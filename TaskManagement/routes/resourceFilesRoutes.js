const express = require('express');
const router = express.Router();
const resourceFilesController = require('../controller/resourceFilesController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the folder exists
const uploadPath = path.join(__dirname, '../uploads/resources_files');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Serve uploads via public URL
router.use('/uploads/resources_files', express.static(uploadPath));

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });


/**
 * @swagger
 * /taskManagement/api/resource/create:
 *   post:
 *     summary: Upload resource files for a task
 *     tags: [ResourceFiles]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - resource_file
 *             properties:
 *               task_id:
 *                 type: string
 *                 example: "123"
 *               resource_file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: Missing task ID or files
 *       500:
 *         description: Server error
 */
router.post('/taskManagement/api/resource/create', upload.array('resource_file', 10), resourceFilesController.createResourceFiles);

/**
 * @swagger
 * /taskManagement/api/resource/{task_id}:
 *   get:
 *     summary: Get resource files for a task
 *     tags: [ResourceFiles]
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID to retrieve resource files
 *     responses:
 *       200:
 *         description: List of resource files
 *       500:
 *         description: Server error while fetching
 */
router.get('/taskManagement/api/resource/:task_id', resourceFilesController.getResourceFilesByTaskId);

/**
 * @swagger
 * /taskManagement/api/resource/delete/deleteByTaskId:
 *   post:
 *     summary: Delete all resource files by task ID
 *     tags: [ResourceFiles]
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
 *                 type: string
 *                 example: "123"
 *     responses:
 *       200:
 *         description: All resource files deleted successfully
 *       400:
 *         description: task_id missing
 *       500:
 *         description: Server error while deleting files
 */
router.post('/taskManagement/api/resource/delete/deleteByTaskId', resourceFilesController.deleteResourceFilesByTaskId);

module.exports = router;
