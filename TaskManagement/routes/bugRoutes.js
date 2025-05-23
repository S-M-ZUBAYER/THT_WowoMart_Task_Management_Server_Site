const express = require('express');
const router = express.Router();
const controller = require('../controller/bugController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const bugUploadDir = path.resolve(__dirname, '../uploads/bugs_attachment_files');
if (!fs.existsSync(bugUploadDir)) fs.mkdirSync(bugUploadDir, { recursive: true });

// ✅ Serve uploads via public URL
router.use('/uploads/discussion_images', express.static(bugUploadDir));

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, bugUploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/taskManagement/api/bug/create', upload.single('attachmentFile'), controller.create);
router.put('/taskManagement/api/bug/update', upload.single('attachmentFile'), controller.updateById);
router.get('/taskManagement/api/bug/:id', controller.getById);
router.get('/taskManagement/api/bug', controller.getAll);
router.post('/taskManagement/api/bug/delete', controller.deleteById);
router.post('/taskManagement/api/bug/delete-multiple', controller.deleteByMultipleId);

module.exports = router;
