const wowomartPool = require("../../wowomartDb/config/db"); // Ensure this uses mysql2/promise

const createUser = async (name, email, hashedPassword, phone) => {
    try {
        const [result] = await wowomartPool.query(
            'INSERT INTO wowomartUser (name, email, password, phone) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, phone]
        );
        return { id: result.insertId, name, email };
    } catch (err) {
        throw err;
    }
};

const updateUserRoleToAdmin = async (email) => {
    try {
        await wowomartPool.query(
            'UPDATE wowomartUser SET isAdmin = 1 WHERE email = ?',
            [email]
        );

        const [results] = await wowomartPool.query(
            'SELECT * FROM wowomartUser WHERE email = ?',
            [email]
        );
        return results[0];
    } catch (err) {
        throw err;
    }
};

const findUserByEmail = async (email) => {
    try {
        const [results] = await wowomartPool.query(
            'SELECT * FROM wowomartUser WHERE email = ?',
            [email]
        );
        return results[0];
    } catch (err) {
        throw err;
    }
};

const getAllWowomartUsers = async () => {
    try {
        const [results] = await wowomartPool.query('SELECT * FROM wowomartUser');
        const sanitizedResults = results.map(user => {
            const { password, ...rest } = user;
            return rest;
        });
        return sanitizedResults;
    } catch (err) {
        throw err;
    }
};

const getByIdWowomartUser = async (id) => {
    try {
        const [results] = await wowomartPool.query(
            'SELECT * FROM wowomartUser WHERE id = ?',
            [id]
        );
        if (results.length === 0) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        const { password, ...rest } = results[0];
        return rest;
    } catch (err) {
        throw err;
    }
};

module.exports = {
    createUser,
    updateUserRoleToAdmin,
    findUserByEmail,
    getAllWowomartUsers,
    getByIdWowomartUser
};
