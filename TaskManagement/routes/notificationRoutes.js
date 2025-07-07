/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: APIs for user notifications
 */
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


//NotificationSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - from
 *         - message
 *         - date
 *         - type
 *         - path
 *       properties:
 *         userId:
 *           type: string
 *           example: "u12345"
 *         from:
 *           type: string
 *           example: "System Admin"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         message:
 *           type: string
 *           example: "Your task has been updated"
 *         date:
 *           type: string
 *           example: "2025-07-07T12:34:56Z"
 *         type:
 *           type: string
 *           enum:
 *             - admin_notification
 *             - user_notification
 *             - user_all_notification
 *             - direct_notification
 *           example: "admin_notification"
 *         path:
 *           type: string
 *           example: "/task-details/123"
 */


/**
 * @swagger
 * /taskManagement/api/notification/{userId}:
 *   get:
 *     summary: Get all notifications for a user by userId
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch notifications for
 *     responses:
 *       200:
 *         description: List of notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       userId:
 *                         type: string
 *                         example: "user123"
 *                       senderId:
 *                         type: string
 *                         example: "admin"
 *                       name:
 *                         type: string
 *                         example: "Admin Name"
 *                       message:
 *                         type: string
 *                         example: "This is a notification message"
 *                       date:
 *                         type: string
 *                         example: "07-07-2025"
 *                       type:
 *                         type: string
 *                         enum:
 *                           - admin_notification
 *                           - user_notification
 *                           - user_all_notification
 *                           - direct_notification
 *                         example: "admin_notification"
 *                       path:
 *                         type: string
 *                         example: "/dashboard"
 *       500:
 *         description: Server error
 */
router.get('/taskManagement/api/notification/:userId', getNotificationsByUserId);

module.exports = router;
