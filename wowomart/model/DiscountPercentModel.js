const wowomartPool = require('../../wowomartDb/config/db');

// const DiscountPercent = {
//     create: (data) => {
//         return new Promise((resolve, reject) => {
//             const { value, label } = data;
//             wowomartPool.query(
//                 'INSERT INTO discount_percent (value, label) VALUES (?, ?)',
//                 [value, label],
//                 (err, result) => {
//                     if (err) return reject(err);
//                     resolve(result);
//                 }
//             );
//         });
//     },

//     getAll: () => {
//         return new Promise((resolve, reject) => {
//             wowomartPool.query('SELECT * FROM discount_percent', (err, results) => {
//                 if (err) return reject(err);
//                 resolve(results);
//             });
//         });
//     },

//     getById: (id) => {
//         return new Promise((resolve, reject) => {
//             wowomartPool.query('SELECT * FROM discount_percent WHERE id = ?', [id], (err, results) => {
//                 if (err) return reject(err);
//                 resolve(results[0]);
//             });
//         });
//     },

//     update: (id, data) => {
//         const { value, label } = data;
//         return new Promise((resolve, reject) => {
//             wowomartPool.query(
//                 'UPDATE discount_percent SET value = ?, label = ? WHERE id = ?',
//                 [value, label, id],
//                 (err, result) => {
//                     if (err) return reject(err);
//                     resolve(result);
//                 }
//             );
//         });
//     },

//     remove: (id) => {
//         return new Promise((resolve, reject) => {
//             wowomartPool.query('DELETE FROM discount_percent WHERE id = ?', [id], (err, result) => {
//                 if (err) return reject(err);
//                 resolve(result);
//             });
//         });
//     },
// };

const DiscountPercent = {
    create: async (data) => {
        const { value, label } = data;
        const [result] = await wowomartPool.execute(
            'INSERT INTO discount_percent (value, label) VALUES (?, ?)',
            [value, label]
        );
        return result;
    },

    getAll: async () => {
        const [results] = await wowomartPool.execute('SELECT * FROM discount_percent');
        return results;
    },

    getById: async (id) => {
        const [results] = await wowomartPool.execute('SELECT * FROM discount_percent WHERE id = ?', [id]);
        return results[0];
    },

    update: async (id, data) => {
        const { value, label } = data;
        const [result] = await wowomartPool.execute(
            'UPDATE discount_percent SET value = ?, label = ? WHERE id = ?',
            [value, label, id]
        );
        return result;
    },

    remove: async (id) => {
        const [result] = await wowomartPool.execute('DELETE FROM discount_percent WHERE id = ?', [id]);
        return result;
    },
};


module.exports = DiscountPercent;
