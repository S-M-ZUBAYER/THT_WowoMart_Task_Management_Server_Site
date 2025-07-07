/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs
 */
const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the folder exists
const uploadPath = path.join(__dirname, '../uploads/project_resources_files');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Serve uploads via public URL
router.use('/uploads/project_resources_files', express.static(uploadPath));

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });


//ProjectSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectCreate:
 *       type: object
 *       required:
 *         - project_name
 *         - project_requirements
 *         - project_startDate
 *         - project_status
 *         - assign_with_ids
 *       properties:
 *         project_name:
 *           type: string
 *           example: "Inventory Management System"
 *         project_requirements:
 *           type: string
 *           example: "Track products, manage stock, handle orders"
 *         project_startDate:
 *           type: string
 *           format: date
 *           example: "2025-07-07"
 *         project_endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: "2025-09-30"
 *         project_status:
 *           type: string
 *           enum:
 *             - To Do
 *             - In Progress
 *             - Completed
 *           example: "In Progress"
 *         assign_with_ids:
 *           type: array
 *           items:
 *             type: integer
 *             example: 101
 *         resource_files:
 *           type: string
 *           format: binary
 *           description: Optional file upload (e.g. documentation or design resources)
 */


/**
 * @swagger
 * /taskManagement/api/projects/create:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - project_name
 *               - project_requirements
 *               - project_startDate
 *               - project_status
 *               - assign_with_ids
 *             properties:
 *               project_name:
 *                 type: string
 *               project_requirements:
 *                 type: string
 *               project_startDate:
 *                 type: string
 *                 format: date
 *               project_endDate:
 *                 type: string
 *                 format: date
 *               project_status:
 *                 type: string
 *                 enum: [To Do, In Progress, Completed]
 *               assign_with_ids:
 *                 type: string
 *                 description: JSON stringified array of user IDs (e.g. "[1,2,3]")
 *               resource_files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Project created
 */
router.post('/taskManagement/api/projects/create', upload.array('resource_files', 10), projectController.createProject);

/**
 * @swagger
 * /taskManagement/api/project/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project fetched successfully
 *       404:
 *         description: Project not found
 */
router.get('/taskManagement/api/project/:id', projectController.getProjectById);

/**
 * @swagger
 * /taskManagement/api/projects/getAll:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of all projects
 */
router.get('/taskManagement/api/projects/getAll', projectController.getAllProjects);

/**
 * @swagger
 * /taskManagement/api/projects/update-status/{id}:
 *   post:
 *     summary: Update status of a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project_status
 *             properties:
 *               project_status:
 *                 type: string
 *                 enum: [To Do, In Progress, Completed]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Missing or invalid status
 */
router.post('/taskManagement/api/projects/update-status/:id', projectController.updateProjectStatus);

/**
 * @swagger
 * /taskManagement/api/projects/update/{id}:
 *   post:
 *     summary: Update a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_name:
 *                 type: string
 *               project_requirements:
 *                 type: string
 *               project_startDate:
 *                 type: string
 *                 format: date
 *               project_endDate:
 *                 type: string
 *                 format: date
 *               project_status:
 *                 type: string
 *                 enum: [To Do, In Progress, Completed]
 *               assign_with_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Project updated
 */
router.post('/taskManagement/api/projects/update/:id', projectController.updateProjectById);

/**
 * @swagger
 * /taskManagement/api/projects/upload-resource/{projectId}:
 *   post:
 *     summary: Upload resource files for a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resource_files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded
 *       400:
 *         description: No files provided
 */
router.post('/taskManagement/api/projects/upload-resource/:projectId', upload.array('resource_files', 10), projectController.uploadProjectResourceFiles);

/**
 * @swagger
 * /taskManagement/api/projects/delete/{id}:
 *   post:
 *     summary: Delete a project by ID (including tasks and files)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.post('/taskManagement/api/projects/delete/:id', projectController.deleteProjectById);

/**
 * @swagger
 * /taskManagement/api/project-resource-file/delete/{id}:
 *   post:
 *     summary: Delete a specific project resource file by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: File deleted
 *       404:
 *         description: File not found
 */
router.post('/taskManagement/api/project-resource-file/delete/:id', projectController.deleteProjectResourceFileById);

module.exports = router;
