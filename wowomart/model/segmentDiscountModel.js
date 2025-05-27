const wowomartPool = require('../../wowomartDb/config/db');

const SegmentDiscount = {
    create: async (data) => {
        const { value, label, ApiUrl } = data;
        try {
            const [result] = await wowomartPool.execute(
                'INSERT INTO segment_discounts (value, label, ApiUrl) VALUES (?, ?, ?)',
                [value, label, ApiUrl]
            );
            return result;
        } catch (error) {
            throw error;
        }
    },

    getAll: async () => {
        try {
            const [results] = await wowomartPool.execute('SELECT * FROM segment_discounts');
            return results;
        } catch (error) {
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const [results] = await wowomartPool.execute(
                'SELECT * FROM segment_discounts WHERE id = ?',
                [id]
            );
            return results[0];
        } catch (error) {
            throw error;
        }
    },

    update: async (id, data) => {
        const { value, label, ApiUrl } = data;
        try {
            const [result] = await wowomartPool.execute(
                'UPDATE segment_discounts SET value = ?, label = ?, ApiUrl = ? WHERE id = ?',
                [value, label, ApiUrl, id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    },

    remove: async (id) => {
        try {
            const [result] = await wowomartPool.execute(
                'DELETE FROM segment_discounts WHERE id = ?',
                [id]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = SegmentDiscount;
