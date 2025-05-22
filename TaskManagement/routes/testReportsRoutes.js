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

// Routes
router.post('/taskManagement/api/test-reports/upload', upload.array('report_file', 10), controller.uploadTestReport);
router.get('/taskManagement/api/test-reports/:task_id', controller.getTestReportsByTaskId);
router.post('/taskManagement/api/test-reports/deleteByTask_id', controller.deleteTestReportsByTaskId);

module.exports = router;
