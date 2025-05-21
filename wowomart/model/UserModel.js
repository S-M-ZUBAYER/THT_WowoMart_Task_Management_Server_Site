// // const poolNew = require('../../config/db');
// const wowomartPool = require("../../wowomartDb/config/db")

// const createUser = (name, email, hashedPassword, phone) => {
//     return new Promise((resolve, reject) => {
//         const query = 'INSERT INTO wowomartUser (name, email, password,phone) VALUES (?, ?, ?,?)';
//         wowomartPool.query(query, [name, email, hashedPassword, phone], (err, result) => {
//             if (err) return reject(err);
//             resolve({ id: result.insertId, name, email });
//         });
//     });
// };

// // Example: in models/User.js
// const updateUserRoleToAdmin = (email) => {
//     return new Promise((resolve, reject) => {
//         const updateQuery = 'UPDATE wowomartUser SET isAdmin = 1 WHERE email = ?';
//         wowomartPool.query(updateQuery, [email], (err) => {
//             if (err) return reject(err);

//             // Fetch the updated user
//             const selectQuery = 'SELECT * FROM wowomartUser WHERE email = ?';
//             wowomartPool.query(selectQuery, [email], (err, results) => {
//                 if (err) return reject(err);
//                 resolve(results[0]);
//             });
//         });
//     });
// };



// const findUserByEmail = (email) => {
//     return new Promise((resolve, reject) => {
//         const query = 'SELECT * FROM wowomartUser WHERE email = ?';
//         wowomartPool.query(query, [email], (err, results) => {
//             if (err) return reject(err);
//             resolve(results[0]);
//         });
//     });
// };

// const getAllWowomartUsers = () => {
//     console.log("alluser3");

//     return new Promise((resolve, reject) => {
//         wowomartPool.query('SELECT * FROM wowomartUser', (err, results) => {
//             if (err) return reject(err);
//             const sanitizedResults = results.map(user => {
//                 const { password, ...rest } = user;
//                 return rest;
//             });
//             resolve(sanitizedResults);
//         });
//     });
// };


// const getByIdWowomartUser = (id) => {
//     return new Promise((resolve, reject) => {
//         wowomartPool.query('SELECT * FROM wowomartUser WHERE id = ?', [id], (err, results) => {
//             if (err) return reject(err);
//             if (results.length === 0) return reject({ status: 404, message: 'User not found' });

//             const { password, ...rest } = results[0];
//             resolve(rest);
//         });
//     });
// };


// module.exports = {
//     createUser,
//     updateUserRoleToAdmin,
//     findUserByEmail,
//     getAllWowomartUsers,
//     getByIdWowomartUser
// };


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
