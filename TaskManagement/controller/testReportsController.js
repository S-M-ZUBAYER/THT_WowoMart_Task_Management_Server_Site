const fs = require('fs');
const path = require('path');
const TestReportsModel = require('../model/testReportsModel');

// POST: Upload multiple test reports
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
            const filePath = `https://grozziie.zjweiting.com:57683/tht/uploads/test_reports_files/`;
            await TestReportsModel.insertTestReport(task_id, file.filename, filePath);
            uploadedResults.push({ filename: file.filename, path: filePath });
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

// GET: Get all reports by task_id
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

// DELETE: Delete all reports by task_id
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

        const files = await TestReportsModel.getTestReportsByTaskId(task_id);

        files.forEach((file) => {
            const filePath = path.join(__dirname, '../', file.path); // Correct path
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

        await TestReportsModel.deleteTestReportsByTaskId(task_id);

        return res.status(200).json({
            status: 200,
            message: 'Test report files deleted successfully.',
            result: [],
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

