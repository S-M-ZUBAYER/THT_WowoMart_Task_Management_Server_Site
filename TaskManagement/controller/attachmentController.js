// // File: controllers/attachmentController.js
// const path = require('path');
// const fs = require('fs');
// const AttachmentModel = require('../model/attachmentModel');
// const { createAttachmentSchema } = require('../schemas/attachmentSchema'); // make sure this exists and is imported


// exports.createAttachment = async (req, res) => {
//     try {
//         const { discussion_id } = req.body;

//         // Validate input
//         const { error } = createAttachmentSchema.validate({ discussion_id });
//         if (error) {
//             return res.status(400).json({
//                 status: 400,
//                 message: error.details[0].message,
//                 result: null
//             });
//         }

//         const files = req.files || {};
//         const discussion_files = files.files?.map(file => `/uploads/files/${file.filename}`).join(',') || '';
//         const discussion_images = files.images?.map(img => `/uploads/images/${img.filename}`).join(',') || '';

//         const result = await AttachmentModel.createAttachment({
//             discussion_id,
//             discussion_files,
//             discussion_images
//         });

//         res.status(201).json({
//             status: 201,
//             message: 'Attachments added',
//             result: { insertId: result.insertId }
//         });
//     } catch (error) {
//         console.error('Error creating attachment:', error);
//         res.status(500).json({
//             status: 500,
//             message: 'Internal server error',
//             result: null
//         });
//     }
// };



// exports.deleteAttachment = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await AttachmentModel.deleteAttachment(id);
//         res.status(200).json({ status: 200, message: 'Attachment deleted', result: null });
//     } catch (error) {
//         console.error('Error deleting attachment:', error);
//         res.status(500).json({ status: 500, message: 'Internal server error', result: null });
//     }
// };


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

            uploadedFiles.push({ type: 'file', id: result.insertId, path: path ? path : "http://localhost:5000/tht/taskManagement/api/" });
        }

        // Handle images
        for (const image of imageArray) {
            const discussion_files = null;
            const discussion_images = `${image.filename}`;

            // const discussion_images = files.images?.map(img => `/uploads/discussion_images/${img.filename}`).join(',') || '';
            const result = await AttachmentModel.createAttachment({
                discussion_id,
                discussion_files,
                discussion_images
            });
            uploadedFiles.push({ type: 'image', id: result.insertId, path: path ? path : "http://localhost:5000/tht/taskManagement/api/" });
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
            return res.status(400).json({ message: 'id is required' });
        }
        await AttachmentModel.deleteByIdAttachment(id);
        res.status(200).json({ status: 200, message: 'Attachment deleted', result: null });
    } catch (error) {
        console.error('Error deleting attachment:', error);
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

        res.status(200).json({ attachments });
    } catch (error) {
        console.error('Error fetching attachments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

