const WebSocket = require('ws');
const Notification = require('../TaskManagement/model/notificationModel');
const { validateNotification } = require('../TaskManagement/schemas/notificationSchema');
const TaskManagementPool = require('../TaskManagementDb/config/db');

const connectedClients = new Map();

function initWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('✅ New WebSocket connection');

        ws.on('message', async (message) => {
            try {
                const str = typeof message === 'string' ? message : message.toString('utf-8');
                const data = JSON.parse(str);

                if (!data.type) {
                    return ws.send(JSON.stringify({ error: 'Missing type in message.' }));
                }

                if (data.type === 'register') {
                    if (!data.userId || !data.role) {
                        return ws.send(JSON.stringify({ error: 'Registration must include userId and role.' }));
                    }

                    const userId = String(data.userId).trim();
                    const role = String(data.role).trim();

                    ws.userId = userId;
                    ws.role = role;

                    connectedClients.set(ws, { userId, role });
                    console.log(`🧑‍💼 Registered: ${ws.userId} as ${ws.role}`);
                    return;
                }

                if (!ws.userId || !ws.role) {
                    return ws.send(JSON.stringify({ error: 'You must register before sending messages.' }));
                }

                const storeAndSendNotification = async (userId, payload) => {
                    const { error } = validateNotification(payload);
                    if (error) {
                        console.error('❌ Validation error:', error.details[0].message);
                        return;
                    }

                    // Save to DB and get insertId
                    const result = await Notification.create(payload);
                    const notificationId = result.insertId;

                    // Prepare payload with DB ID
                    const payloadWithId = {
                        ...payload,
                        id: notificationId,
                    };

                    // Send to online user if connected
                    for (const client of wss.clients) {
                        if (client.readyState === WebSocket.OPEN && client.userId === String(userId)) {
                            client.send(JSON.stringify(payloadWithId));
                            break;
                        }
                    }
                };


                // Get recipients from DB
                const sendToUsers = async (userRows, type) => {
                    for (const user of userRows) {
                        const payload = {
                            type,
                            from: ws.userId,
                            name: data.name,
                            message: data.message,
                            date: data.date,
                            userId: String(user.id),
                            path: data.path
                        };

                        await storeAndSendNotification(user.id, payload);
                    }

                    console.log(`📤 Notification "${type}" sent to ${userRows.length} users.`);
                };

                // Admins
                if (data.type === 'notify_admins') {
                    const [admins] = await TaskManagementPool.query("SELECT id FROM users WHERE role = 'Admin'");
                    await sendToUsers(admins, 'admin_notification');
                    return;
                }

                // Users
                if (data.type === 'notify_users') {
                    const [users] = await TaskManagementPool.query("SELECT id FROM users WHERE role = 'User'");
                    await sendToUsers(users, 'user_notification');
                    return;
                }

                // All
                if (data.type === 'notify_All') {
                    const [all] = await TaskManagementPool.query("SELECT id FROM users WHERE role IN ('Admin', 'User')");
                    await sendToUsers(all, 'user_all_notification');
                    return;
                }

                // Specific
                if (data.type === 'notify_specific') {
                    if (!Array.isArray(data.userIds) || data.userIds.length === 0) {
                        return ws.send(JSON.stringify({ error: 'notify_specific must include userIds array.' }));
                    }

                    const [specific] = await TaskManagementPool.query("SELECT id FROM users WHERE id IN (?)", [data.userIds]);
                    await sendToUsers(specific, 'direct_notification');
                    return;
                }

                ws.send(JSON.stringify({ error: 'Unknown message type.' }));
            } catch (err) {
                console.error('❌ Error:', err.message);
                ws.send(JSON.stringify({ error: 'Invalid JSON or message structure.' }));
            }
        });

        ws.on('close', () => {
            connectedClients.delete(ws);
            console.log('❎ Disconnected: ws closed');
        });
    });

    return wss;
}

module.exports = initWebSocket;
