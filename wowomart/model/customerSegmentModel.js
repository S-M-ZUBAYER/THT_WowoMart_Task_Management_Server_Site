
const wowomartPool = require('../../wowomartDb/config/db');

const getSegmentDiscounts = async () => {
    const [rows] = await wowomartPool.query('SELECT * FROM wowomart_segment_discount_create');
    return rows;
};

module.exports = { getSegmentDiscounts };

