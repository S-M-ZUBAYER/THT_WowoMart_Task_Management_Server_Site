const TaskManagementPool = require('../../TaskManagementDb/config/db');

const Notification = {
    create: async ({ userId, from, name, message, date, type, path }) => {

        const [result] = await TaskManagementPool.execute(
            `INSERT INTO notifications (userId, senderId, senderName, message, date, type, path) VALUES (?, ?, ?, ?, ?, ?,?)`,
            [userId, from, name, message, date, type, path]
        );
        return result;
    },

    findByUserId: async (userId) => {
        const [rows] = await TaskManagementPool.execute(
            `SELECT 
                id,
                userId,
                senderId,
                senderName AS name,  -- 🔁 alias senderName to name
                message,
                date,
                type,
                path
             FROM notifications
             WHERE userId = ?
             ORDER BY STR_TO_DATE(date, '%m-%d-%Y') DESC`, // Optional: if date is stored as string
            [userId]
        );
        return rows;
    },

    deleteOldNotifications: async () => {
        try {
            const [result] = await TaskManagementPool.execute(`
                DELETE FROM notifications 
                WHERE STR_TO_DATE(date, '%m-%d-%Y') < DATE_SUB(CURDATE(), INTERVAL 3 DAY)
            `);
            console.log(`🧹 Deleted ${result.affectedRows} old notifications.`);
        } catch (error) {
            console.error('❌ Error deleting old notifications:', error.message);
        }
    }

};

module.exports = Notification;