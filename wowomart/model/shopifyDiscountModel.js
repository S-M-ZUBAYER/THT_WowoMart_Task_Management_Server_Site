const wowomartPool = require('../../wowomartDb/config/db'); // already using promise()

const shopifyDiscountModel = {

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
