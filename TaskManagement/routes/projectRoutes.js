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

router.post('/taskManagement/api/projects/create', upload.array('resource_files', 10), projectController.createProject);
router.get('/taskManagement/api/project/:id', projectController.getProjectById);
router.get('/taskManagement/api/projects/getAll', projectController.getAllProjects);
router.post('/taskManagement/api/projects/update-status/:id', projectController.updateProjectStatus);
router.post('/taskManagement/api/projects/update/:id', projectController.updateProjectById);
router.post('/taskManagement/api/projects/upload-resource/:projectId', upload.array('resource_files', 10), projectController.uploadProjectResourceFiles);
router.post('/taskManagement/api/projects/delete/:id', projectController.deleteProjectById);
router.post('/taskManagement/api/project-resource-file/delete/:id', projectController.deleteProjectResourceFileById);


module.exports = router;
