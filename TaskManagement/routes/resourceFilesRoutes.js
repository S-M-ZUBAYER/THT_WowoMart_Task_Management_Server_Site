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

// Routes
router.post('/taskManagement/api/resource/create', upload.array('resource_file', 10), resourceFilesController.createResourceFiles);
router.get('/taskManagement/api/resource/:task_id', resourceFilesController.getResourceFilesByTaskId);
router.post('/taskManagement/api/resource/delete/deleteByTaskId', resourceFilesController.deleteResourceFilesByTaskId);

module.exports = router;
