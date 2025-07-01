const fs = require('fs');
const path = require('path');
const TestReportsModel = require('../model/testReportsModel');


exports.uploadTestReport = async (req, res) => {
    try {
        const { task_id } = req.body;
        const files = req.files;

        if (!task_id || !files || files.length === 0) {
            return res.status(400).json({
                status: 400,
                message: 'task_id and at least one file are required.',
                result: [],
            });
        }

        const uploadedResults = [];

        for (const file of files) {
            const filePath = `https://grozziie.zjweiting.com:57683/tht/uploads/test_reports_files/${file.filename}`;
            const filename = `https://grozziie.zjweiting.com:57683/tht/uploads/test_reports_files/${file.filename}`;
            await TestReportsModel.insertTestReport(task_id, file.originalname, filename, filePath);
            uploadedResults.push({ name: file.originalname, filename: file.filename, path: filePath });
        }

        return res.status(201).json({
            status: 201,
            message: 'Test report(s) uploaded successfully.',
            result: uploadedResults,
        });
    } catch (error) {
        console.error('❌ Error uploading test report:', error);
        return res.status(500).json({
            status: 500,
            message: 'Server error while uploading test report.',
            result: [],
        });
    }
};

exports.getTestReportsByTaskId = async (req, res) => {
    try {
        const { task_id } = req.params;

        if (!task_id) {
            return res.status(400).json({
                status: 400,
                message: 'task_id is required.',
                result: [],
            });
        }

        const reports = await TestReportsModel.getTestReportsByTaskId(task_id);

        return res.status(200).json({
            status: 200,
            message: 'Test reports retrieved successfully.',
            result: reports,
        });
    } catch (error) {
        console.error('❌ Error getting test reports:', error);
        return res.status(500).json({
            status: 500,
            message: 'Server error while retrieving test reports.',
            result: [],
        });
    }
};

exports.deleteTestReportsByTaskId = async (req, res) => {
    try {
        const { task_id } = req.body;

        if (!task_id) {
            return res.status(400).json({
                status: 400,
                message: 'task_id is required.',
                result: [],
            });
        }

        // Step 1: Get all test report records for the task
        const files = await TestReportsModel.getTestReportsByTaskId(task_id);

        // Step 2: Delete files from filesystem
        files.forEach((file) => {
            const fileName = file.path.replace('https://grozziie.zjweiting.com:57683/tht/uploads/test_reports_files/', '');
            const filePath = path.join(__dirname, '../uploads/test_reports_files', fileName);

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
        });

        // Step 3: Delete DB entries
        await TestReportsModel.deleteTestReportsByTaskId(task_id);

        // Step 4: Return response with deleted records
        return res.status(200).json({
            status: 200,
            message: 'Test report files deleted successfully.',
            result: files,
        });

    } catch (error) {
        console.error('❌ Error deleting test reports:', error);
        return res.status(500).json({
            status: 500,
            message: 'Server error while deleting test reports.',
            result: [],
        });
    }
};


