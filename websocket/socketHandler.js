const WebSocket = require('ws');

const connectedClients = new Map(); // ws => { userId, role }

function initWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('✅ New WebSocket connection');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);

                // Client registers with userId and role
                if (data.type === 'register') {
                    connectedClients.set(ws, { userId: data.userId, role: data.role });
                    console.log(`🧑‍💼 User ${data.userId} registered as ${data.role}`);
                }

                // Notify all users
                if (data.type === 'notify_all') {
                    for (const client of wss.clients) {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'notification',
                                message: data.message
                            }));
                        }
                    }
                }

                // Notify only admins
                if (data.type === 'notify_admins') {
                    let count = 0;
                    console.log(info.userId, info.role);

                    for (const [client, info] of connectedClients.entries()) {
                        console.log(`Checking client: ${info.userId}, role: ${info.role}`);

                        if (client.readyState === WebSocket.OPEN && info.role === 'Admin') {
                            client.send(JSON.stringify({
                                type: 'admin_notification',
                                message: data.message
                            }));
                            count++;
                        }
                    }

                    console.log(`📣 Sent admin_notification to ${count} admins`);
                }


            } catch (err) {
                console.error('❌ Invalid JSON received:', message);
            }
        });

        ws.on('close', () => {
            connectedClients.delete(ws);
            console.log('❎ WebSocket client disconnected');
        });
    });

    return wss;
}

module.exports = initWebSocket;
