const ResourceFilesModel = require('../model/resourceFilesModel');
const fs = require('fs');
const path = require('path');


exports.createResourceFiles = async (req, res) => {
    try {
        const task_id = req.body.task_id;
        const files = req.files;

        if (!task_id || !files || files.length === 0) {
            return res.status(400).json({ status: 400, message: 'Task ID and files are required.', result: [] });
        }

        const uploadedFilesData = [];

        const fileInsertPromises = files.map(file => {
            const fileUrl = `https://grozziie.zjweiting.com:57683/tht/uploads/resources_files/${file.filename}`;
            const fullPath = `https://grozziie.zjweiting.com:57683/tht/uploads/resources_files/${file.filename}`;

            // Save to DB
            const insertPromise = ResourceFilesModel.createResourceFile(task_id, fileUrl, fullPath);

            // Collect data for response
            uploadedFilesData.push({
                originalName: file.originalname,
                filename: file.filename,
                url: fileUrl,
                path: fullPath,
                mimetype: file.mimetype,
                size: file.size
            });

            return insertPromise;
        });

        await Promise.all(fileInsertPromises);

        res.status(201).json({
            status: 201,
            message: 'Resource files uploaded successfully.',
            result: uploadedFilesData
        });

    } catch (error) {
        console.error('Error uploading resource files:', error);
        res.status(500).json({ status: 500, message: 'Server error while uploading files.', result: [] });
    }
};

exports.getResourceFilesByTaskId = async (req, res) => {
    try {
        const taskId = req.params.task_id;

        const data = await ResourceFilesModel.getResourceFilesByTaskId(taskId);
        res.status(200).json({ status: 200, message: 'Files fetched successfully.', result: data });
    } catch (error) {
        console.error('Error fetching resource files:', error);
        res.status(500).json({ status: 500, message: 'Server error while fetching files.', result: [] });
    }
};

exports.deleteResourceFilesByTaskId = async (req, res) => {
    try {
        const { task_id } = req.body;

        if (!task_id) {
            return res.status(400).json({
                status: 400,
                message: 'task_id is required.',
                result: [],
            });
        }

        // Get file data from DB
        const files = await ResourceFilesModel.getResourceFilesByTaskId(task_id);

        for (const file of files) {
            if (file.resource_file) {
                const fileName = file.resource_file.replace('https://grozziie.zjweiting.com:57683/tht/uploads/resources_files/', '');
                const filePath = path.join(__dirname, '../uploads/resources_files', fileName);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        // Delete from database
        await ResourceFilesModel.deleteResourceFilesByTaskId(task_id);

        return res.status(200).json({
            status: 200,
            message: 'All resource files deleted successfully.',
            result: files,
        });

    } catch (error) {
        console.error('❌ Error deleting resource files:', error);
        return res.status(500).json({
            status: 500,
            message: 'Server error while deleting resource files.',
            result: [],
        });
    }
};


