const path = require('path');
const fs = require('fs');
const model = require('../model/bugModel');
const schema = require('../schemas/bugManagementSchema');

exports.create = async (req, res) => {
    try {
        const { error, value } = schema.createBugSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        let attachmentFile = null;
        if (req.file) {
            attachmentFile = `${req.file.filename}`;
        }
        const bugData = {
            ...value,
            assignWith: Array.isArray(value.assignWith) ? value.assignWith.join(',') : value.assignWith,
            attachmentFile,
            solveDate: value.solveDate ?? null,
        };


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
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        const existing = await model.getById(id);
        if (!existing[0].length) return res.status(404).json({ status: 404, message: 'Bug not found' });

        let attachmentFile = existing[0][0].attachmentFile;
        if (req.file) {
            if (attachmentFile) {
                const oldPath = path.resolve(__dirname, '../..', attachmentFile);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            attachmentFile = `/uploads/bugs/${req.file.filename}`;
        }

        const result = await model.updateById(id, { ...value, attachmentFile });
        res.status(200).json({ status: 200, message: 'Updated successfully', result });
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
        const [rows] = await model.getById(req.body.id);
        if (rows.length && rows[0].attachmentFile) {
            const filePath = path.resolve(__dirname, '../..', rows[0].attachmentFile);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        const [result] = await model.deleteById(req.body.id);
        res.status(result.affectedRows ? 200 : 404).json({
            status: result.affectedRows ? 200 : 404,
            message: result.affectedRows ? 'Deleted successfully' : 'Bug not found',
        });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.deleteByMultipleId = async (req, res) => {
    try {
        const ids = req.body.ids;
        if (!Array.isArray(ids)) return res.status(400).json({ status: 400, message: 'ids must be an array' });

        const [bugs] = await model.getByMultipleId(ids);
        for (const bug of bugs) {
            if (bug.attachmentFile) {
                const filePath = path.resolve(__dirname, '../..', bug.attachmentFile);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        }

        const [result] = await model.deleteByMultipleId(ids);
        res.status(200).json({ status: 200, message: `Deleted ${result.affectedRows} bugs` });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};
