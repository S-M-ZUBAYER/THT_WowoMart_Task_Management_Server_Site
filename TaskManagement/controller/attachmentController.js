const path = require('path');
const fs = require('fs');
const AttachmentModel = require('../model/attachmentModel');

exports.createAttachment = async (req, res) => {
    try {
        const { discussion_id, path } = req.body;
        const files = req.files || [];
        const uploadedFiles = [];

        const fileArray = files.files || [];
        const imageArray = files.images || [];

        // Handle files
        for (const file of fileArray) {
            const discussion_files = `${file.filename}`;
            const discussion_images = null;

            const result = await AttachmentModel.createAttachment({
                discussion_id,
                discussion_files,
                discussion_images
            });

            uploadedFiles.push({ type: 'file', id: result.insertId, path: path ? path : `https://grozziie.zjweiting.com:57683/tht/uploads/discussion_files/${discussion_files}` });
        }

        // Handle images
        for (const image of imageArray) {
            const discussion_files = null;
            const discussion_images = `${image.filename}`;

            const result = await AttachmentModel.createAttachment({
                discussion_id,
                discussion_files,
                discussion_images
            });
            uploadedFiles.push({
                type: 'image', id: result.insertId, path: path ? path : `https://grozziie.zjweiting.com:57683/tht/uploads/discussion_images/${discussion_images}`
            });
        }
        res.status(201).json({ status: 201, message: 'Attachments added', result: uploadedFiles });
    } catch (error) {
        console.error('Error creating attachment:', error);
        res.status(500).json({ status: 500, message: 'Internal server error', result: null });
    }
};


exports.deleteByIdAttachment = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ status: 400, message: 'id is required', result: null });
        }

        // Step 1: Get attachment details
        const [rows] = await AttachmentModel.getByAttachmentId(id);
        if (!rows) {
            return res.status(404).json({ status: 404, message: 'Attachment not found', result: null });
        }

        const attachment = rows;
        let fileName = '';
        let filePath = '';

        // Step 2: Determine if it's a file or image
        if (attachment.discussion_files) {
            fileName = attachment.discussion_files.replace('https://grozziie.zjweiting.com:57683/tht/uploads/discussion_files/', '');
            filePath = path.join(__dirname, '../uploads/discussion_files', fileName);
        } else if (attachment.discussion_images) {
            fileName = attachment.discussion_images;
            fileName = attachment.discussion_images.replace('https://grozziie.zjweiting.com:57683/tht/uploads/discussion_images/', '');
            filePath = path.join(__dirname, '../uploads/discussion_images', fileName);
        }

        // Step 3: Delete file if it exists
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`✅ Deleted file: ${filePath}`);
            } catch (err) {
                console.error(`❌ Error deleting file: ${filePath}`, err.message);
            }
        } else {
            console.warn(`⚠️ File does not exist: ${filePath}`);
        }

        // Step 4: Delete from DB
        await AttachmentModel.deleteByIdAttachment(id);

        res.status(200).json({ status: 200, message: 'Attachment deleted successfully', result: attachment });
    } catch (error) {
        console.error('❌ Error deleting attachment:', error);
        res.status(500).json({ status: 500, message: 'Internal server error', result: null });
    }
};


exports.deleteDiscussionIdAttachment = async (req, res) => {
    try {
        const { discussion_id } = req.body;

        if (!discussion_id) {
            return res.status(400).json({ message: 'discussion_id is required' });
        }
        await AttachmentModel.deleteDiscussionIdAttachment(discussion_id);
        res.status(200).json({ status: 200, message: 'Attachments deleted', result: null });
    } catch (error) {
        console.error('Error deleting attachments:', error);
        res.status(500).json({ status: 500, message: 'Internal server error', result: null });
    }
};

exports.getAttachmentByDiscussionId = async (req, res) => {
    try {
        const discussionId = req.params.discussion_id;

        if (!discussionId) {
            return res.status(400).json({ message: 'discussion_id is required' });
        }

        // Replace this with your actual model/query logic
        const attachments = await AttachmentModel.getByDiscussionId(discussionId);

        res.status(200).json({
            status: 200,
            message: 'Attachment files fetched successfully',
            result: attachments
        });
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAttachmentById = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ message: 'id is required' });
        }

        // Replace this with your actual model/query logic
        const attachments = await AttachmentModel.getAttachmentById(id);

        res.status(200).json({
            status: 200,
            message: 'Attachment files fetched successfully',
            result: attachments
        });
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

