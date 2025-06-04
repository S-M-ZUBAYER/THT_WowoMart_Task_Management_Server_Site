const path = require('path');
const fs = require('fs');
const model = require('../model/bugModel');
const schema = require('../schemas/bugManagementSchema');

exports.create = async (req, res) => {
    // ✅ Parse assignWith if it’s a string
    if (typeof req.body.assignWith === 'string') {
        try {
            req.body.assignWith = JSON.parse(req.body.assignWith);
        } catch (parseError) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid assignWith format. Must be a JSON array.',
                result: null
            });
        }
    }
    try {
        const { error, value } = schema.createBugSchema.validate(req.body);
        // console.log(value);

        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        let attachmentFile = null;
        console.log("file", req.file);

        if (req.file) {
            attachmentFile = `${req.file.filename}`;
        }
        const bugData = {
            ...value,
            attachmentFile,
            solveDate: value.solveDate ?? null,
        };

        console.log(bugData);

        const result = await model.create(bugData);
        res.status(201).json({ status: 201, message: 'Bug report created', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.updateById = async (req, res) => {
    try {
        const id = req.body.id;

        const { error, value } = schema.updateBugSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message });
        }

        const [existing] = await model.getById(id);
        if (!existing.length) {
            return res.status(404).json({ status: 404, message: 'Bug not found' });
        }

        let attachmentFile = existing[0].attachmentFile;

        if (req.file) {
            // Delete old image if it exists
            if (attachmentFile) {
                const oldFilename = attachmentFile.replace('https://grozziie.zjweiting.com:57683/tht/uploads/bugs_attachment_files/', '');
                const oldPath = path.join(__dirname, '../uploads/bugs_attachment_files', oldFilename);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            // Set new file URL
            attachmentFile = `https://grozziie.zjweiting.com:57683/tht/uploads/bugs_attachment_files/${req.file.filename}`;
        }

        const updated = await model.updateById(id, { ...value, attachmentFile });

        res.status(200).json({
            status: 200,
            message: 'Updated successfully',
            result: { id, ...value, attachmentFile }
        });
    } catch (err) {
        console.error('Error updating bug:', err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.updateBugStatus = async (req, res) => {
    try {
        const { error, value } = schema.updateBugStatusSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        const id = req.params.id;
        const result = await model.updateBugById(id, { status: value.status });

        res.status(200).json({ status: 200, message: 'Bug status updated', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.updateBugPriority = async (req, res) => {
    try {
        const { error, value } = schema.updateBugPrioritySchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        const id = req.params.id;
        const result = await model.updateBugById(id, { priority: value.priority });

        res.status(200).json({ status: 200, message: 'Bug priority updated', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const [rows] = await model.getById(req.params.id);
        if (rows.length) {
            res.status(200).json({ status: 200, message: 'Fetch successful', result: rows[0] });
        } else {
            res.status(404).json({ status: 404, message: 'Not found', result: {} });
        }
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.getAll = async (_req, res) => {
    try {
        const [rows] = await model.getAll();
        res.status(200).json({ status: 200, message: 'Fetched all bugs', result: rows });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.body;

        const [rows] = await model.getById(id);

        if (rows.length && rows[0].attachmentFile) {
            const fileName = rows[0].attachmentFile.replace('https://grozziie.zjweiting.com:57683/tht/uploads/bugs_attachment_files/', '');
            const filePath = path.join(__dirname, '../uploads/bugs_attachment_files', fileName);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        const [result] = await model.deleteById(id);

        if (result.affectedRows) {
            return res.status(200).json({ status: 200, message: 'Deleted successfully' });
        } else {
            return res.status(404).json({ status: 404, message: 'Bug not found' });
        }

    } catch (err) {
        console.error('Error deleting bug:', err);
        return res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.deleteByMultipleId = async (req, res) => {
    try {
        const ids = req.body.ids;
        if (!Array.isArray(ids)) {
            return res.status(400).json({ status: 400, message: 'ids must be an array' });
        }

        const [bugs] = await model.getByMultipleId(ids);

        for (const bug of bugs) {
            if (bug.attachmentFile) {
                // Extract filename from full URL
                const fileName = bug.attachmentFile.replace('https://grozziie.zjweiting.com:57683/tht/uploads/bugs_attachment_files/', '');
                const filePath = path.join(__dirname, '../uploads/bugs_attachment_files', fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        const [result] = await model.deleteByMultipleId(ids);
        res.status(200).json({ status: 200, message: `Deleted ${result.affectedRows} bugs` });

    } catch (err) {
        console.error('Error in deleteByMultipleId:', err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};
