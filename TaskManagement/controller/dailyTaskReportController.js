const model = require('../model/dailyTaskReportModel');
const { createReportSchema, updateReportSchema } = require('../schemas/dailyTaskReportSchema');

exports.create = async (req, res) => {
    try {
        const { error, value } = createReportSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.message });

        const [result] = await model.create(value);
        res.status(201).json({ status: 201, message: 'Report created', reportId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { error, value } = updateReportSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.message });

        const [result] = await model.updateById(value.id, value);
        if (result.affectedRows === 0) return res.status(404).json({ status: 404, message: 'Report not found' });

        res.status(200).json({ status: 200, message: 'Report updated' });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.getById = async (req, res) => {
    try {
        const [rows] = await model.getById(req.params.id);

        if (rows.length > 0) {
            res.status(200).json({
                status: 200,
                message: "Fetched daily report by ID successfully",
                result: rows[0]
            });
        } else {
            res.status(404).json({
                status: 404,
                message: "No daily report found for this ID",
                result: {}
            });
        }
    } catch (err) {
        console.error('Error fetching daily report by ID:', err);
        res.status(500).json({
            status: 500,
            message: 'Server error'
        });
    }
};

exports.getByEmail = async (req, res) => {
    try {
        const [rows] = await model.getByEmail(req.params.email);

        if (rows.length > 0) {
            res.status(200).json({
                status: 200,
                message: 'Daily reports fetched successfully by email',
                result: rows
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'No reports found for this email',
                result: []
            });
        }
    } catch (err) {
        console.error('Error fetching reports by email:', err);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            result: null
        });
    }
};

exports.getAll = async (_req, res) => {
    try {
        const [rows] = await model.getAll();

        res.status(200).json({
            status: 200,
            message: 'All daily reports fetched successfully',
            result: rows
        });
    } catch (err) {
        console.error('Error fetching all daily reports:', err);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            result: null
        });
    }
};

exports.getByDate = async (req, res) => {
    try {
        const date = req.params.date;

        const [rows] = await model.getByDate(date);

        if (rows.length > 0) {
            res.status(200).json({
                status: 200,
                message: `Fetched ${rows.length} report(s) for ${date}`,
                result: rows
            });
        } else {
            res.status(404).json({
                status: 404,
                message: `No reports found for date ${date}`,
                result: []
            });
        }
    } catch (err) {
        console.error('Error fetching by date:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            result: null
        });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const [result] = await model.deleteById(req.body.id);

        if (result.affectedRows) {
            res.status(200).json({
                status: 200,
                message: 'Daily report deleted successfully',
                result: { affectedRows: result.affectedRows }
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'Daily report not found for the provided ID',
                result: null
            });
        }
    } catch (err) {
        console.error('Error deleting by ID:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            result: null
        });
    }
};

exports.deleteByMultipleId = async (req, res) => {
    try {
        const ids = req.body.ids;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                status: 400,
                message: 'ids must be a non-empty array',
                result: null
            });
        }

        const [result] = await model.deleteByMultipleId(ids);

        res.status(200).json({
            status: 200,
            message: `Successfully deleted ${result.affectedRows} report(s)`,
            result: { affectedRows: result.affectedRows }
        });
    } catch (err) {
        console.error('Error deleting by multiple IDs:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            result: null
        });
    }
};

exports.deleteByEmail = async (req, res) => {
    try {
        const [result] = await model.deleteByEmail(req.body.email);

        if (result.affectedRows > 0) {
            res.status(200).json({
                status: 200,
                message: `Successfully deleted ${result.affectedRows} report(s) for the given email`,
                result: { affectedRows: result.affectedRows }
            });
        } else {
            res.status(404).json({
                status: 404,
                message: 'No reports found for the provided email',
                result: null
            });
        }
    } catch (err) {
        console.error('Error deleting by email:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            result: null
        });
    }
};

