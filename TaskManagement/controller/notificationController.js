const Notification = require('../model/notificationModel');

exports.getNotificationsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const notifications = await Notification.findByUserId(userId);
        res.status(200).json({ status: 200, success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};