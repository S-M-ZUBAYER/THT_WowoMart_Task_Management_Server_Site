/**
 * @swagger
 * tags:
 *   name: TaskDiscussion
 *   description: APIs for managing task discussions
 */

const express = require('express');
const router = express.Router();
const discussionController = require('../controller/discussionController');


//✅ createDiscussionSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateDiscussion:
 *       type: object
 *       required:
 *         - task_id
 *         - title
 *         - discussion_date
 *         - details
 *         - discussion_with_ids
 *       properties:
 *         task_id:
 *           type: integer
 *           example: 101
 *         title:
 *           type: string
 *           example: API Integration Meeting
 *         discussion_date:
 *           type: string
 *           format: date
 *           example: 2025-07-07
 *         details:
 *           type: string
 *           example: Discussed API design and responsibilities for the team.
 *         discussion_with_ids:
 *           type: array
 *           items:
 *             type: integer
 *           example: [2, 3, 5]
 */

//✅ updateDiscussionSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateDiscussion:
 *       type: object
 *       required:
 *         - title
 *         - discussion_date
 *         - details
 *         - discussion_with_ids
 *       properties:
 *         title:
 *           type: string
 *           example: Final Review Meeting
 *         discussion_date:
 *           type: string
 *           format: date
 *           example: 2025-07-08
 *         details:
 *           type: string
 *           example: Final discussion before production release.
 *         discussion_with_ids:
 *           type: array
 *           items:
 *             type: integer
 *           example: [4, 6]
 */



/**
 * @swagger
 * /taskManagement/api/taskDiscussion/create:
 *   post:
 *     summary: Create a new task discussion
 *     tags: [TaskDiscussion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - title
 *               - discussion_date
 *               - details
 *               - discussion_with_ids
 *             properties:
 *               task_id:
 *                 type: integer
 *                 example: 123
 *               title:
 *                 type: string
 *                 example: Discussion title
 *               discussion_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-07-07
 *               details:
 *                 type: string
 *                 example: Detailed discussion text here.
 *               discussion_with_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Discussion created successfully
 *       400:
 *         description: Validation error or invalid discussion_with_ids format
 *       500:
 *         description: Internal server error
 */
router.post('/taskManagement/api/taskDiscussion/create', discussionController.createDiscussion);

/**
 * @swagger
 * /taskManagement/api/taskDiscussion/update/{id}:
 *   post:
 *     summary: Update a task discussion by ID
 *     tags: [TaskDiscussion]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Discussion ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - discussion_date
 *               - details
 *               - discussion_with_ids
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated discussion title
 *               discussion_date:
 *                 type: string
 *                 format: date
 *                 example: 2025-07-08
 *               details:
 *                 type: string
 *                 example: Updated details text
 *               discussion_with_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 4]
 *     responses:
 *       200:
 *         description: Discussion updated successfully
 *       400:
 *         description: Validation error or invalid discussion_with_ids format
 *       500:
 *         description: Internal server error
 */
router.post('/taskManagement/api/taskDiscussion/update/:id', discussionController.updateDiscussion);

/**
 * @swagger
 * /taskManagement/api/taskDiscussion/by-task/{taskId}:
 *   get:
 *     summary: Get discussions by Task ID
 *     tags: [TaskDiscussion]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Task ID to fetch discussions for
 *     responses:
 *       200:
 *         description: Discussions fetched successfully with attachments
 *       500:
 *         description: Internal server error
 */
router.get('/taskManagement/api/taskDiscussion/by-task/:taskId', discussionController.getDiscussionsByTaskId);

/**
 * @swagger
 * /taskManagement/api/taskDiscussion/by-id/{id}:
 *   get:
 *     summary: Get discussion by Discussion ID
 *     tags: [TaskDiscussion]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Discussion ID to fetch
 *     responses:
 *       200:
 *         description: Discussion fetched successfully with attachments
 *       404:
 *         description: Discussion not found
 *       500:
 *         description: Internal server error
 */
router.get('/taskManagement/api/taskDiscussion/by-id/:id', discussionController.getDiscussionsById);

/**
 * @swagger
 * /taskManagement/api/taskDiscussion/delete-by-task-id:
 *   post:
 *     summary: Delete discussions and attachments by Task ID
 *     tags: [TaskDiscussion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *             properties:
 *               task_id:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       200:
 *         description: Discussions and attachments deleted successfully for the task
 *       500:
 *         description: Internal server error
 */
router.post('/taskManagement/api/taskDiscussion/delete-by-task-id', discussionController.deleteByTaskId);

/**
 * @swagger
 * /taskManagement/api/taskDiscussion/delete-by-id:
 *   post:
 *     summary: Delete discussion and attachments by Discussion ID
 *     tags: [TaskDiscussion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - discussion_id
 *             properties:
 *               discussion_id:
 *                 type: integer
 *                 example: 456
 *     responses:
 *       200:
 *         description: Discussion deleted successfully
 *       500:
 *         description: Internal server error
 */
router.post('/taskManagement/api/taskDiscussion/delete-by-id', discussionController.deleteByDiscussionId);

module.exports = router;
