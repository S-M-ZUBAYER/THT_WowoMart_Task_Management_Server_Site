const model = require('../model/bugProjectModel');
const schema = require('../schemas/bugProjectSchema');
// const { getAllBugProjectsWithBugs } = require('../model/bugProjectModel');
exports.create = async (req, res) => {
    try {
        const { error, value } = schema.createBugProjectSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        const result = await model.create(value);
        res.status(201).json({ status: 201, message: 'Project created', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const rows = await model.getAll();

        res.status(200).json({ status: 200, message: 'All projects bug', result: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};


exports.getAllWithBugs = async (req, res) => {
    try {
        const data = await model.getAllBugProjectsWithBugs();

        if (!data || data.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No bug projects found',
                result: []
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'Bug projects with related bugs fetched successfully',
            result: data
        });
    } catch (error) {
        console.error('Error fetching bug projects with bugs:', error);
        return res.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: error.message
        });
    }
};


exports.deleteProjectAndBugs = async (req, res) => {
    try {
        const { id } = req.body; // Assuming id comes from body as { id: 5 }

        const result = await model.deleteProjectAndRelatedBugs(id);

        res.status(200).json({
            status: 200,
            message: 'Project and related bugs deleted successfully',
            result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: err.message
        });
    }
};


exports.updateProjectName = async (req, res) => {
    try {
        const { error, value } = schema.updateBugProjectSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        const id = req.params.id;
        const result = await model.updateProjectName(id, { bugProjectName: value.bugProjectName });

        res.status(200).json({ status: 200, message: 'Project name updated', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};
