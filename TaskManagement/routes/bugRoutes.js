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

router.post('/taskManagement/api/bug/create', upload.single('attachmentFile'), controller.create);
router.get('/taskManagement/api/bug/getById/:id', controller.getById);
router.get('/taskManagement/api/bug/getAll', controller.getAll);
router.post('/taskManagement/api/bug/deleteById', controller.deleteById);
router.post('/taskManagement/api/bug/delete-multiple_ById', controller.deleteByMultipleId);
router.post('/taskManagement/api/bugStatus/:id', controller.updateBugStatus);
router.post('/taskManagement/api/update/remarkDetails/:id', controller.updateRemarkDetailsStatus);
router.post('/taskManagement/api/bugPriority/:id', controller.updateBugPriority);

module.exports = router;
