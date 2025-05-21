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

        const fileInsertPromises = files.map(file => {
            const fileUrl = `${file.filename}`;
            const fullPath = "http://localhost:5000/tht/";
            return ResourceFilesModel.createResourceFile(task_id, fileUrl, fullPath);
        });

        await Promise.all(fileInsertPromises);

        res.status(201).json({ status: 201, message: 'Resource files uploaded successfully.', result: [] });
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




// exports.deleteResourceFilesByTaskId = async (req, res) => {
//     try {
//         const { task_id } = req.body;

//         if (!task_id) {
//             return res.status(400).json({ status: 400, message: 'task_id is required.', result: [] });
//         }

//         // Step 1: Get file paths from DB
//         const files = await ResourceFilesModel.getResourceFilesByTaskId(task_id);

//         // Step 2: Delete files from folder
//         for (const file of files) {
//             const filePath = path.resolve(file.path);
//             if (fs.existsSync(filePath)) {
//                 fs.unlinkSync(filePath);
//             }
//         }

//         // Step 3: Delete records from DB
//         await ResourceFilesModel.deleteResourceFilesByTaskId(task_id);

//         return res.status(200).json({ status: 200, message: 'Files deleted successfully.', result: [] });
//     } catch (error) {
//         console.error('Error deleting resource files:', error);
//         return res.status(500).json({ status: 500, message: 'Server error while deleting files.', result: [] });
//     }
// };






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

        // Step 1: Get all file records for the task
        const files = await ResourceFilesModel.getResourceFilesByTaskId(task_id);

        // Step 2: Loop through each and delete the file
        files.forEach((file) => {
            const fileName = file.resource_file; // assuming this is just the filename like 'abc.pdf'
            const filePath = path.join(__dirname, '../uploads/resources_files', fileName);

            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`❌ Error deleting file: ${filePath}`, err.message);
                    } else {
                        console.log(`✅ Deleted file: ${filePath}`);
                    }
                });
            } else {
                console.warn(`⚠️ File does not exist: ${filePath}`);
            }
        });

        // Step 3: Delete from database
        await ResourceFilesModel.deleteResourceFilesByTaskId(task_id);

        return res.status(200).json({
            status: 200,
            message: 'All resource files deleted successfully.',
            result: [],
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

