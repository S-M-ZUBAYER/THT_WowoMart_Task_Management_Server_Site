const authModel = require('../model/authModel');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
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

        const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password

        const imageUrl = req.file
            ? `https://grozziie.zjweiting.com:57683/tht/uploads/employee_images/${req.file.filename}`
            : null;

        const user = {
            ...req.body,
            password: hashedPassword, // Store hashed password
            image: imageUrl
        };

        const result = await authModel.createUser(user);
        res.status(201).json({ status: 201, message: 'User registered successfully', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error', result: null });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { error } = updateUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message, result: null });
        }

        const userId = req.body.id;

        // 1. Find the user in the database
        const existingUser = await authModel.findUserById(userId);
        if (!existingUser) {
            return res.status(404).json({ status: 404, message: 'User not found', result: null });
        }

        let imageUrl = existingUser.image;

        // 2. Handle image update
        if (req.file) {
            const uploadsDir = path.join(__dirname, '../uploads/employee_images');

            // 2.1 Delete the old image if it exists
            if (imageUrl) {
                const oldImageName = imageUrl.replace('https://grozziie.zjweiting.com:57683/tht/uploads/employee_images/', '');
                const oldImagePath = path.join(uploadsDir, oldImageName);

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // 2.2 Set new image URL
            imageUrl = `https://grozziie.zjweiting.com:57683/tht/uploads/employee_images/${req.file.filename}`;
        }

        // 3. Prepare updated user data
        const updatedUser = {
            ...req.body,
            image: imageUrl,
        };

        const success = await authModel.updateUser(updatedUser);
        if (!success) {
            return res.status(400).json({ status: 400, message: 'User update failed', result: null });
        }

        res.status(200).json({
            status: 200,
            message: 'User updated successfully',
            result: updatedUser
        });

    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ status: 500, message: 'Server error', result: null });
    }
};

exports.makeAdminFromGeneralUser = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await authModel.makeAdminById(id);
        res.status(200).json({ status: 200, message: 'User role updated to Admin', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message,
                result: null
            });
        }

        const user = await authModel.findUserByEmail(req.body.email);
        if (!user) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid email or password',
                result: null
            });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid email or password',
                result: null
            });
        }

        // Exclude password from response
        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            status: 200,
            message: 'Login successful',
            result: userWithoutPassword
        });

    } catch (err) {
        res.status(500).json({
            status: 500,
            message: 'Server error',
            result: null
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { error } = deleteUserSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message, result: null });
        }

        const { id } = req.body;

        // 1. Fetch user to get image path
        const user = await authModel.findUserById(id);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found', result: null });
        }

        // 2. Extract image filename and delete it
        if (user.image) {
            const imageFileName = user.image.replace('https://grozziie.zjweiting.com:57683/tht/uploads/employee_images/', '');
            const imagePath = path.join(__dirname, '../uploads/employee_images', imageFileName);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // 3. Delete user from DB
        const success = await authModel.deleteUser(id);
        if (!success) {
            return res.status(404).json({ status: 404, message: 'User deletion failed', result: null });
        }

        res.status(200).json({ status: 200, message: 'User deleted successfully', result: { id } });

    } catch (err) {
        console.error('Error deleting user:', err);
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

exports.getAllUsers = async (_req, res) => {
    try {
        const users = await authModel.getAllUsers();
        return res.status(200).json({
            status: 200,
            message: 'Users fetched successfully',
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

exports.getAllUsersWithDeactivate = async (_req, res) => {
    try {
        const users = await authModel.getAllUsersWithDeactivate();
        return res.status(200).json({
            status: 200,
            message: 'Users fetched successfully',
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

exports.getAllUsersWithOutImage = async (_req, res) => {
    try {
        const users = await authModel.getAllUsersWithOutImage();
        return res.status(200).json({
            status: 200,
            message: 'Users fetched successfully without image',
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

exports.updateDeactivateStatus = async (req, res) => {
    const userId = req.params.id;
    const { deactivate } = req.body;

    if (typeof deactivate !== 'number' || ![0, 1].includes(deactivate)) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid deactivate value. Must be 0 or 1.',
        });
    }

    try {
        const result = await authModel.updateDeactivateStatus(userId, deactivate);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        return res.status(200).json({
            status: 200,
            message: `User deactivation status updated to ${deactivate}`,
        });
    } catch (err) {
        console.error('Error updating deactivate status:', err);
        return res.status(500).json({
            status: 500,
            message: 'Server error',
        });
    }
};



