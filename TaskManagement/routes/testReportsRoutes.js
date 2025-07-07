/**
 * @swagger
 * tags:
 *   name: TestReports
 *   description: APIs for uploading, retrieving, and deleting test report documents
 */

const express = require('express');
const router = express.Router();
const controller = require('../controller/testReportsController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload folder exists
const uploadPath = path.join(__dirname, '../uploads/test_reports_files');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Serve uploads via public URL
router.use('/uploads/test_reports_files', express.static(uploadPath));

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
 * /taskManagement/api/test-reports/upload:
 *   post:
 *     summary: Upload test report documents
 *     tags: [TestReports]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - task_id
 *               - report_file
 *             properties:
 *               task_id:
 *                 type: string
 *                 example: "T-1001"
 *               report_file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *       400:
 *         description: Missing task_id or files
 *       500:
 *         description: Server error
 */
router.post('/taskManagement/api/test-reports/upload', upload.array('report_file', 10), controller.uploadTestReport);

/**
 * @swagger
 * /taskManagement/api/test-reports/{task_id}:
 *   get:
 *     summary: Get all test report files for a specific task
 *     tags: [TestReports]
 *     parameters:
 *       - in: path
 *         name: task_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Test reports retrieved successfully
 *       400:
 *         description: Task ID is required
 *       500:
 *         description: Server error
 */
router.get('/taskManagement/api/test-reports/:task_id', controller.getTestReportsByTaskId);

/**
 * @swagger
 * /taskManagement/api/test-reports/deleteByTask_id:
 *   post:
 *     summary: Delete all test report files by task ID
 *     tags: [TestReports]
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
 *                 example: "T-1001"
 *     responses:
 *       200:
 *         description: Test report files deleted successfully
 *       400:
 *         description: task_id is required
 *       500:
 *         description: Server error
 */
router.post('/taskManagement/api/test-reports/deleteByTask_id', controller.deleteTestReportsByTaskId);

module.exports = router;
