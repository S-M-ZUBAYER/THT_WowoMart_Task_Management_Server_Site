const express = require('express');
const router = express.Router();
const { getNotificationsByUserId } = require('../controller/notificationController');
const cron = require('node-cron');
const deleteOldNotifications = require('../model/notificationModel');

// Run every night at 2:00 AM
cron.schedule('0 2 * * *', async () => {
    console.log('⏰ Running daily notification cleanup at 12:20 PM...');
    await deleteOldNotifications.deleteOldNotifications();
});


router.get('/taskManagement/api/notification/:userId', getNotificationsByUserId);

module.exports = router;
