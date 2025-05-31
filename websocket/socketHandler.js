const WebSocket = require('ws');

const connectedClients = new Map(); // Optional: For broadcasting or tracking

function initWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('✅ New WebSocket connection');

        ws.on('message', (message) => {
            try {
                const str = typeof message === 'string' ? message : message.toString('utf-8');
                const data = JSON.parse(str);

                if (!data.type) {
                    return ws.send(JSON.stringify({ error: 'Missing type in message.' }));
                }

                // ✅ Register user
                if (data.type === 'register') {
                    if (!data.userId || !data.role) {
                        return ws.send(JSON.stringify({ error: 'Registration must include userId and role.' }));
                    }

                    ws.userId = String(data.userId).trim();  // ✅ Attached directly to ws
                    ws.role = String(data.role).trim();
                    connectedClients.set(ws, { userId: ws.userId, role: ws.role });

                    console.log(`🧑‍💼 Registered: ${ws.userId} as ${ws.role}`);
                    return;
                }

                // ✅ Check if user is registered
                if (!ws.userId || !ws.role) {
                    return ws.send(JSON.stringify({ error: 'You must register before sending messages.' }));
                }

                // 🔔 Notify all Admins
                if (data.type === 'notify_admins') {
                    let count = 0;
                    for (const client of wss.clients) {
                        if (client.readyState === WebSocket.OPEN && client.role === 'Admin') {
                            client.send(JSON.stringify({
                                type: 'admin_notification',
                                from: ws.userId,
                                message: data.message
                            }));
                            count++;
                        }
                    }
                    console.log(`📣 ${ws.userId} sent message to ${count} admins.`);
                    return;
                }

                // 👥 Notify all Users
                if (data.type === 'notify_users') {
                    let count = 0;
                    for (const client of wss.clients) {
                        if (client.readyState === WebSocket.OPEN && client.role === 'User') {
                            client.send(JSON.stringify({
                                type: 'user_notification',
                                from: ws.userId,
                                message: data.message
                            }));
                            count++;
                        }
                    }
                    console.log(`📣 ${ws.userId} sent message to ${count} users.`);
                    return;
                }

                // 👥 Notify all Users and Admins
                if (data.type === 'notify_All') {
                    let count = 0;
                    for (const client of wss.clients) {
                        if (client.readyState === WebSocket.OPEN || client.role === 'User' || client.role === 'Admin') {
                            client.send(JSON.stringify({
                                type: 'user_all_notification',
                                from: ws.userId,
                                message: data.message
                            }));
                            count++;
                        }
                    }
                    console.log(`📣 ${ws.userId} sent message to ${count} users.`);
                    return;
                }

                // 🎯 Notify specific users
                if (data.type === 'notify_specific') {
                    if (!Array.isArray(data.userIds) || data.userIds.length === 0) {
                        return ws.send(JSON.stringify({ error: 'notify_specific must include userIds array.' }));
                    }

                    let count = 0;
                    for (const client of wss.clients) {
                        if (client.readyState === WebSocket.OPEN && data.userIds.includes(client.userId)) {
                            client.send(JSON.stringify({
                                type: 'direct_notification',
                                from: ws.userId,
                                message: data.message
                            }));
                            count++;
                        }
                    }
                    console.log(`📬 ${ws.userId} sent to ${count} specific users.`);
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
