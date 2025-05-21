const authModel = require('../model/authModel');
const {
    registerSchema,
    loginSchema,
    updateUserSchema,
    deleteUserSchema,
    findUsersByIdsSchema
} = require('../schemas/authSchema');

exports.registerUser = async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message, result: null });

        const existing = await authModel.findUserByEmail(req.body.email);
        if (existing) return res.status(409).json({ status: 409, message: 'Email already registered', result: null });

        const result = await authModel.createUser(req.body);
        res.status(201).json({ status: 201, message: 'User registered successfully', result });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error', result: null });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message, result: null });

        const user = await authModel.findUserByEmail(req.body.email);
        if (!user || user.password !== req.body.password) {
            return res.status(401).json({ status: 401, message: 'Invalid email or password', result: null });
        }

        res.status(200).json({ status: 200, message: 'Login successful', result: user });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error', result: null });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { error } = updateUserSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message, result: null });

        const success = await authModel.updateUser(req.body);
        if (!success) return res.status(404).json({ status: 404, message: 'User not found', result: null });

        res.status(200).json({ status: 200, message: 'User updated successfully', result: req.body });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error', result: null });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { error } = deleteUserSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message, result: null });

        const { id } = req.body;
        const success = await authModel.deleteUser(id);
        if (!success) return res.status(404).json({ status: 404, message: 'User not found', result: null });

        res.status(200).json({ status: 200, message: 'User deleted successfully', result: { id } });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error', result: null });
    }
};

exports.findUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ status: 400, message: 'Invalid ID', result: null });
        }

        const user = await authModel.findUserById(Number(id));

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', result: null });
        }

        res.status(200).json({ status: 200, message: 'User found', result: user });
    } catch (err) {
        res.status(500).json({ status: 500, message: 'Server error', result: null });
    }
};

exports.findUsersByIds = async (req, res) => {
    try {
        const { error } = findUsersByIdsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message,
                result: null
            });
        }

        const { ids } = req.body;
        const users = await authModel.findUsersByIds(ids);

        return res.status(200).json({
            status: 200,
            message: users.length ? 'Users found' : 'No users found',
            result: users
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            message: 'Server error',
            result: null
        });
    }
};



