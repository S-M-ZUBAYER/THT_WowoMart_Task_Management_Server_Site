const express = require('express');
const router = express.Router();
const controller = require('../controller/dailyTaskReportController');


/**
 * @swagger
 * components:
 *   schemas:
 *     DailyTaskReportCreate:
 *       type: object
 *       required:
 *         - employeeName
 *         - employeeEmail
 *         - employeeId
 *         - reportDetails
 *         - reportDate
 *       properties:
 *         employeeName:
 *           type: string
 *           example: John Doe
 *         employeeEmail:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         employeeId:
 *           type: string
 *           example: EMP12345
 *         image:
 *           type: string
 *           description: Base64 or image URL (optional)
 *           example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 *         reportDetails:
 *           type: string
 *           example: Completed module 1 and 2 tasks
 *         reportDate:
 *           type: string
 *           format: date
 *           example: 2025-07-07
 *
 *     DailyTaskReportUpdate:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         employeeName:
 *           type: string
 *           example: John Doe
 *         employeeEmail:
 *           type: string
 *           format: email
 *           example: john.doe@example.com
 *         employeeId:
 *           type: string
 *           example: EMP12345
 *         reportDetails:
 *           type: string
 *           example: Updated task report details
 *         reportDate:
 *           type: string
 *           format: date
 *           example: 2025-07-07
 */

/**
 * @swagger
 * /taskManagement/api/dailyTaskReport/create:
 *   post:
 *     summary: Create a new daily task report
 *     tags: [DailyTaskReport]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DailyTaskReportCreate'
 *     responses:
 *       201:
 *         description: Report created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/taskManagement/api/dailyTaskReport/create', controller.create);

/**
 * @swagger
 * /taskManagement/api/dailyTaskReport/update:
 *   post:
 *     summary: Update an existing daily task report by ID
 *     tags: [DailyTaskReport]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DailyTaskReportUpdate'
 *     responses:
 *       200:
 *         description: Report updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.post('/taskManagement/api/dailyTaskReport/update', controller.updateById);


/**
 * @swagger
 * /taskManagement/api/dailyTaskReport/{id}:
 *   get:
 *     summary: Get a daily task report by ID
 *     tags: [DailyTaskReport]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report found
 *       404:
 *         description: Report not found
 *       500:
 *         description: Server error
 */
router.get('/taskManagement/api/dailyTaskReport/:id', controller.getById);

/**
 * @swagger
 * /taskManagement/api/dailyTaskReport/email/{email}:
 *   get:
 *     summary: Get daily task reports by employee email
 *     tags: [DailyTaskReport]
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee email address
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 *       404:
 *         description: No reports found for this email
 *       500:
 *         description: Server error
 */
router.get('/taskManagement/api/dailyTaskReport/email/:email', controller.getByEmail);

/**
 * @swagger
 * /taskManagement/api/dailyTaskReport/get/all:
 *   get:
 *     summary: Get all daily task reports
 *     tags: [DailyTaskReport]
 *     responses:
 *       200:
 *         description: All reports fetched successfully
 *       500:
 *         description: Server error
 */
router.get('/taskManagement/api/dailyTaskReport/get/all', controller.getAll);

/**
 * @swagger
 * /taskManagement/api/dailyTaskReport/byDate/{date}:
 *   get:
 *     summary: Get daily task reports by report date
 *     tags: [DailyTaskReport]
 *     parameters:
 *       - name: date
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Report date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reports fetched for the date
 *       404:
 *         description: No reports found for the date
 *       500:
 *         description: Server error
 */
router.get('/taskManagement/api/dailyTaskReport/byDate/:date', controller.getByDate);

/**
 * @swagger
 * /taskManagement/api/dailyTaskReport/deleteById:
 *   post:
 *     summary: Delete a daily task report by ID
 *     tags: [DailyTaskReport]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Report ID to delete
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: Report not found for the provided ID
 *       500:
 *         description: Server error
 */
router.post('/taskManagement/api/dailyTaskReport/deleteById', controller.deleteById);

/**
 * @swagger
 * /taskManagement/api/dailyTaskReport/delete/multiple:
 *   post:
 *     summary: Delete multiple daily task reports by IDs
 *     tags: [DailyTaskReport]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of report IDs to delete
 *     responses:
 *       200:
 *         description: Reports deleted successfully
 *       400:
 *         description: Validation error - ids must be a non-empty array
 *       500:
 *         description: Server error
 */
router.post('/taskManagement/api/dailyTaskReport/delete/multiple', controller.deleteByMultipleId);

/**
 * @swagger
 * /taskManagement/api/dailyTaskReport/deleteByEmail:
 *   post:
 *     summary: Delete daily task reports by employee email
 *     tags: [DailyTaskReport]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: Employee email to delete reports for
 *     responses:
 *       200:
 *         description: Reports deleted successfully for the given email
 *       404:
 *         description: No reports found for the provided email
 *       500:
 *         description: Server error
 */
router.post('/taskManagement/api/dailyTaskReport/deleteByEmail', controller.deleteByEmail);


module.exports = router;
