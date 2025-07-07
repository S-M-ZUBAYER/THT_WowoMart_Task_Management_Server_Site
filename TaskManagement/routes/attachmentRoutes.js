const express = require('express');
const router = express.Router();
const attachmentController = require('../controller/attachmentController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Define upload directories
const uploadDirImages = path.resolve(__dirname, '../uploads/discussion_images');
const uploadDirFiles = path.resolve(__dirname, '../uploads/discussion_files');

// ✅ Create folders if they don’t exist
if (!fs.existsSync(uploadDirImages)) fs.mkdirSync(uploadDirImages, { recursive: true });
if (!fs.existsSync(uploadDirFiles)) fs.mkdirSync(uploadDirFiles, { recursive: true });

// ✅ Serve uploads via public URL
router.use('/uploads/discussion_images', express.static(uploadDirImages));
router.use('/uploads/discussion_files', express.static(uploadDirFiles));

// ✅ Configure multer storage
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


/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAttachment:
 *       type: object
 *       required:
 *         - discussion_id
 *       properties:
 *         discussion_id:
 *           type: integer
 *           description: ID of the discussion this attachment is linked to
 *           example: 12
 */

/**
 * @swagger
 * /taskManagement/api/discussion/attachmentFiles/{discussion_id}:
 *   get:
 *     summary: Get all attachments for a discussion by ID
 *     tags: [Attachment]
 *     parameters:
 *       - in: path
 *         name: discussion_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the discussion
 *     responses:
 *       200:
 *         description: Attachment files fetched successfully
 */
router.get('/taskManagement/api/discussion/attachmentFiles/:discussion_id', attachmentController.getAttachmentByDiscussionId);

/**
 * @swagger
 * /taskManagement/api/attachment/upload:
 *   post:
 *     summary: Upload attachments (images and files)
 *     tags: [Attachment]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - discussion_id
 *             properties:
 *               discussion_id:
 *                 type: integer
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Attachments added successfully
 */
router.post('/taskManagement/api/attachment/upload', upload.fields([{ name: 'files' }, { name: 'images' }]), attachmentController.createAttachment);

/**
 * @swagger
 * /taskManagement/api/attachment/deleteById:
 *   post:
 *     summary: Delete a specific attachment by ID
 *     tags: [Attachment]
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
 *         description: Attachment deleted successfully
 */
router.post('/taskManagement/api/attachment/deleteById', attachmentController.deleteByIdAttachment);

/**
 * @swagger
 * /taskManagement/api/attachment/delete/discussionId:
 *   post:
 *     summary: Delete all attachments by discussion ID
 *     tags: [Attachment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - discussion_id
 *             properties:
 *               discussion_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Attachments deleted successfully for the discussion
 */
router.post('/taskManagement/api/attachment/delete/discussionId', attachmentController.deleteDiscussionIdAttachment);


module.exports = router;