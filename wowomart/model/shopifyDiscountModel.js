// const wowomartPool = require('../../wowomartDb/config/db'); // adjust path as needed

// const shopifyDiscountModel = {
//     // Fetch all segment discounts
//     getAllSegmentDiscounts: () => {
//         return new Promise((resolve, reject) => {
//             wowomartPool.query(
//                 `SELECT * FROM wowomart_segment_discount_create ORDER BY id DESC`,
//                 (err, results) => {
//                     if (err) {
//                         return reject(err);
//                     }
//                     resolve(results);
//                 }
//             );
//         });
//     },

//     // Fetch a single segment discount by ID
//     getSegmentDiscountById: (id) => {
//         return new Promise((resolve, reject) => {
//             wowomartPool.query(
//                 `SELECT * FROM wowomart_segment_discount_create WHERE id = ?`,
//                 [id],
//                 (err, results) => {
//                     if (err) {
//                         return reject(err);
//                     }
//                     resolve(results[0]); // return only the first object
//                 }
//             );
//         });
//     },

//     getByTag: () => {
//         return new Promise((resolve, reject) => {
//             wowomartPool.query(
//                 `SELECT * FROM wowomart_segment_discount_create WHERE tag IS NOT NULL AND tag != ''`,
//                 (err, results) => {
//                     if (err) return reject({ status: 500, message: err.message });
//                     resolve({ status: 200, result: results, message: 'Fetched coupon users with non-empty tags successfully.' });
//                 }
//             );
//         });
//     },
// };

// module.exports = shopifyDiscountModel;


const wowomartPool = require('../../wowomartDb/config/db'); // already using promise()

const shopifyDiscountModel = {
    // Fetch all segment discounts
    getAllSegmentDiscounts: async () => {
        try {
            const [results] = await wowomartPool.query(
                `SELECT * FROM wowomart_segment_discount_create ORDER BY id DESC`
            );
            return results;
        } catch (err) {
            throw err;
        }
    },

    // Fetch a single segment discount by ID
    getSegmentDiscountById: async (id) => {
        try {
            const [results] = await wowomartPool.query(
                `SELECT * FROM wowomart_segment_discount_create WHERE id = ?`,
                [id]
            );
            return results[0]; // return only the first object
        } catch (err) {
            throw err;
        }
    },

    getByTag: async () => {
        try {
            const [results] = await wowomartPool.query(
                `SELECT * FROM wowomart_segment_discount_create WHERE tag IS NOT NULL AND tag != ''`
            );
            return {
                status: 200,
                result: results,
                message: 'Fetched coupon users with non-empty tags successfully.',
            };
        } catch (err) {
            return {
                status: 500,
                message: err.message,
            };
        }
    },
};

module.exports = shopifyDiscountModel;
