const express = require('express');
const router = express.Router();
const attachmentController = require('../controller/attachmentController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');



const uploadDirImages = path.resolve(__dirname, '../uploads/discussion_images');
const uploadDirFiles = path.resolve(__dirname, '../uploads/discussion_files');

if (!fs.existsSync(uploadDirImages)) fs.mkdirSync(uploadDirImages, { recursive: true });
if (!fs.existsSync(uploadDirFiles)) fs.mkdirSync(uploadDirFiles, { recursive: true });


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = file.mimetype.startsWith('image/') ? uploadDirImages : uploadDirFiles;
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});


const upload = multer({ storage });

router.get('/taskManagement/api/attachment/discussion/:discussion_id', attachmentController.getAttachmentByDiscussionId);
router.post('/taskManagement/api/attachment/upload', upload.fields([{ name: 'files' }, { name: 'images' }]), attachmentController.createAttachment);
// router.delete('/taskManagement/api/attachment/delete/:id', attachmentController.deleteAttachment);
router.post('/taskManagement/api/attachment/deleteById', attachmentController.deleteByIdAttachment);
// router.delete('/taskManagement/api/attachment/delete/discussionId/:discussion_id', attachmentController.deleteDiscussionIdAttachment);
router.post('/taskManagement/api/attachment/delete/discussionId', attachmentController.deleteDiscussionIdAttachment);

module.exports = router;