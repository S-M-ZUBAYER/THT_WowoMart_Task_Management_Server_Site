// const poolNew = require('../../config/db');

// const CouponManagement = {
//     getAll: () => {
//         return new Promise((resolve, reject) => {
//             poolNew.query('SELECT * FROM coupon_management', (err, results) => {
//                 if (err) return reject(err);
//                 resolve(results);
//             });
//         });
//     },

//     getById: (id) => {
//         return new Promise((resolve, reject) => {
//             poolNew.query('SELECT * FROM coupon_management WHERE id = ?', [id], (err, results) => {
//                 if (err) return reject(err);
//                 resolve(results[0]);
//             });
//         });
//     },

//     create: (data) => {
//         const { tag_name, coupon_code, coupon_title, discount, category_title, category_details, expire_time } = data;

//         return new Promise((resolve, reject) => {
//             poolNew.query(
//                 'INSERT INTO coupon_management (tag_name,coupon_code,coupon_title, discount,category_title,	category_details, expire_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
//                 [tag_name, coupon_code, coupon_title, discount, category_title, category_details, expire_time],
//                 (err, result) => {
//                     if (err) return reject(err);
//                     console.log(result);
//                     resolve(result);
//                 }
//             );
//         });
//     },

//     update: (id, data) => {
//         const {
//             tag_name,
//             coupon_code,
//             coupon_title,
//             discount,
//             category_title,
//             category_details,
//             expire_time
//         } = data;

//         return new Promise((resolve, reject) => {
//             poolNew.query(
//                 `UPDATE coupon_management 
//              SET tag_name = ?, coupon_code = ?, coupon_title = ?, discount = ?, 
//                  category_title = ?, category_details = ?, expire_time = ?
//              WHERE id = ?`,
//                 [tag_name, coupon_code, coupon_title, discount, category_title, category_details, expire_time, id],
//                 (err, result) => {
//                     if (err) return reject(err);
//                     resolve(result);
//                 }
//             );
//         });
//     },


//     remove: (id) => {
//         return new Promise((resolve, reject) => {
//             poolNew.query('DELETE FROM coupon_management WHERE id = ?', [id], (err, result) => {
//                 if (err) return reject(err);
//                 resolve(result);
//             });
//         });
//     },
// };

// module.exports = CouponManagement;


const wowomartPool = require('../../wowomartDb/config/db');


const CouponManagement = {
    getAll: async () => {
        try {
            const [results] = await wowomartPool.query('SELECT * FROM coupon_management');
            return results;
        } catch (err) {
            throw err;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await wowomartPool.query('SELECT * FROM coupon_management WHERE id = ?', [id]);
            return results[0];
        } catch (err) {
            throw err;
        }
    },

    create: async (data) => {
        const { tag_name, coupon_code, coupon_title, discount, category_title, category_details, expire_time } = data;

        try {
            const [result] = await wowomartPool.query(
                `INSERT INTO coupon_management 
                 (tag_name, coupon_code, coupon_title, discount, category_title, category_details, expire_time) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [tag_name, coupon_code, coupon_title, discount, category_title, category_details, expire_time]
            );
            return result;
        } catch (err) {
            throw err;
        }
    },

    update: async (id, data) => {
        const { tag_name, coupon_code, coupon_title, discount, category_title, category_details, expire_time } = data;

        try {
            const [result] = await wowomartPool.query(
                `UPDATE coupon_management 
                 SET tag_name = ?, coupon_code = ?, coupon_title = ?, discount = ?, 
                     category_title = ?, category_details = ?, expire_time = ?
                 WHERE id = ?`,
                [tag_name, coupon_code, coupon_title, discount, category_title, category_details, expire_time, id]
            );
            return result;
        } catch (err) {
            throw err;
        }
    },

    remove: async (id) => {
        try {
            const [result] = await wowomartPool.query('DELETE FROM coupon_management WHERE id = ?', [id]);
            return result;
        } catch (err) {
            throw err;
        }
    },
};

module.exports = CouponManagement;