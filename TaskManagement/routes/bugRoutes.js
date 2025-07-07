const express = require('express');
const router = express.Router();
const controller = require('../controller/bugController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const bugUploadDir = path.resolve(__dirname, '../uploads/bugs_attachment_files');
if (!fs.existsSync(bugUploadDir)) fs.mkdirSync(bugUploadDir, { recursive: true });

// ✅ Serve uploads via public URL
router.use('/uploads/bugs_attachment_files', express.static(bugUploadDir));

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, bugUploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

//✅ createBugSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBug:
 *       type: object
 *       required:
 *         - projectName
 *         - BugTitle
 *         - BugDetails
 *         - findDate
 *         - priority
 *         - status
 *         - remark
 *         - createdEmail
 *         - bugProjectId
 *       properties:
 *         projectName:
 *           type: string
 *           maxLength: 255
 *           example: Website Redesign
 *         BugTitle:
 *           type: string
 *           example: Button not working on form
 *         BugDetails:
 *           type: string
 *           example: The submit button on the contact form does not trigger the API
 *         findDate:
 *           type: string
 *           format: date
 *           example: 2025-07-07
 *         solveDate:
 *           type: string
 *           nullable: true
 *           example: 2025-07-10
 *         assignWith:
 *           type: array
 *           items:
 *             type: integer
 *           example: [2, 4]
 *         priority:
 *           type: string
 *           enum: [High, Medium, Low]
 *           example: High
 *         status:
 *           type: string
 *           enum: [Pending, In Progress, Solved]
 *           example: Pending
 *         remark:
 *           type: string
 *           enum: [Not Checked, Not Solved, Completed]
 *           example: Not Checked
 *         createdEmail:
 *           type: string
 *           format: email
 *           example: dev@company.com
 *         bugProjectId:
 *           type: integer
 *           example: 101
 */

//✅ updateBugSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateBug:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateBug'
 *         - type: object
 *           properties:
 *             attachmentFile:
 *               type: string
 *               example: bug_screenshot.png
 */

//✅ updateBugStatusSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateBugStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [Pending, In Progress, Solved]
 *           example: In Progress
 */

//✅ updateRemarkDetailsSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateRemarkDetails:
 *       type: object
 *       required:
 *         - BugDetails
 *         - remark
 *       properties:
 *         BugDetails:
 *           type: string
 *           example: Issue occurs on click event with no handler attached
 *         remark:
 *           type: string
 *           enum: [Not Checked, Not Solved, Completed]
 *           example: Completed
 */

//✅ updateBugPrioritySchema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateBugPriority:
 *       type: object
 *       required:
 *         - priority
 *       properties:
 *         priority:
 *           type: string
 *           enum: [High, Medium, Low]
 *           example: Medium
 */



/**
 * @swagger
 * /taskManagement/api/bug/create:
 *   post:
 *     summary: Create a new bug report
 *     tags: [Bug]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - BugTitle
 *               - projectName
 *             properties:
 *               projectName:
 *                 type: string
 *               BugTitle:
 *                 type: string
 *               BugDetails:
 *                 type: string
 *               findDate:
 *                 type: string
 *               solveDate:
 *                 type: string
 *               assignWith:
 *                 type: string
 *                 example: "[1, 2]"
 *               priority:
 *                 type: string
 *               attachmentFile:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: string
 *               createdEmail:
 *                 type: string
 *               bugProjectId:
 *                 type: integer
 *               remark:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bug created
 */
router.post('/taskManagement/api/bug/create', upload.single('attachmentFile'), controller.create);

/**
 * @swagger
 * /taskManagement/api/bug/getById/{id}:
 *   get:
 *     summary: Get a bug by ID
 *     tags: [Bug]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bug ID
 *     responses:
 *       200:
 *         description: Bug found
 *       404:
 *         description: Bug not found
 */
router.get('/taskManagement/api/bug/getById/:id', controller.getById);

/**
 * @swagger
 * /taskManagement/api/bug/getAll:
 *   get:
 *     summary: Get all bugs
 *     tags: [Bug]
 *     responses:
 *       200:
 *         description: Fetched all bugs
 */
router.get('/taskManagement/api/bug/getAll', controller.getAll);

/**
 * @swagger
 * /taskManagement/api/bug/deleteById:
 *   post:
 *     summary: Delete a bug by ID
 *     tags: [Bug]
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
 *     responses:
 *       200:
 *         description: Bug deleted successfully
 *       404:
 *         description: Bug not found
 */
router.post('/taskManagement/api/bug/deleteById', controller.deleteById);

/**
 * @swagger
 * /taskManagement/api/bug/delete-multiple_ById:
 *   post:
 *     summary: Delete multiple bugs by IDs
 *     tags: [Bug]
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
 *     responses:
 *       200:
 *         description: Bugs deleted
 */
router.post('/taskManagement/api/bug/delete-multiple_ById', controller.deleteByMultipleId);

/**
 * @swagger
 * /taskManagement/api/bugStatus/{id}:
 *   post:
 *     summary: Update the status of a bug
 *     tags: [Bug]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bug ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.post('/taskManagement/api/bugStatus/:id', controller.updateBugStatus);

/**
 * @swagger
 * /taskManagement/api/update/remarkDetails/{id}:
 *   post:
 *     summary: Update remark and bug details by ID
 *     tags: [Bug]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bug ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - remark
 *               - BugDetails
 *             properties:
 *               remark:
 *                 type: string
 *               BugDetails:
 *                 type: string
 *     responses:
 *       200:
 *         description: Remark updated
 */
router.post('/taskManagement/api/update/remarkDetails/:id', controller.updateRemarkDetailsStatus);

/**
 * @swagger
 * /taskManagement/api/bugPriority/{id}:
 *   post:
 *     summary: Update the priority of a bug
 *     tags: [Bug]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bug ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priority
 *             properties:
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Priority updated
 */
router.post('/taskManagement/api/bugPriority/:id', controller.updateBugPriority);



module.exports = router;
