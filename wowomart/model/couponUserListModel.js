const wowomartPool = require('../../wowomartDb/config/db');
const axios = require("axios");

const convertDateFormat = (isoDate, newMonth, newDay) => {
    const date = new Date(isoDate);
    date.setMonth(newMonth - 1);
    date.setDate(newDay);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const CouponUserListModel = {
    getAll: async () => {
        const [results] = await wowomartPool.query('SELECT * FROM coupon_user_list');
        return results;
    },

    getById: async (id) => {
        const [results] = await wowomartPool.query('SELECT * FROM coupon_user_list WHERE id = ?', [id]);
        return results[0];
    },

    create: async (data) => {
        const {
            title,
            percentage,
            segmentQuery,
            minimumAmount,
            minimumItem,
            code,
            expireDate,
            tag,
            segmentId,
            discountId,
            email,
            customerId,
        } = data;

        const convertedExpireDate = convertDateFormat(expireDate, 5, 31);

        const [result] = await wowomartPool.query(
            `INSERT INTO coupon_user_list 
            (title, percentage, segmentQuery, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId, email, customerId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, percentage, segmentQuery, minimumAmount, minimumItem, code, convertedExpireDate, tag, segmentId, discountId, email, customerId]
        );

        return result;
    },

    update: async (id, data) => {
        const {
            title,
            percentage,
            segmentQuery,
            minimumAmount,
            minimumItem,
            code,
            expireDate,
            tag,
            segmentId,
            discountId,
            email,
            customerId,
        } = data;

        const convertedExpireDate = convertDateFormat(expireDate, 5, 31);

        const [result] = await wowomartPool.query(
            `UPDATE coupon_user_list 
             SET title = ?, percentage = ?, segmentQuery = ?, minimumAmount = ?, minimumItem = ?, 
                 code = ?, expireDate = ?, tag = ?, segmentId = ?, discountId = ?, email = ?, customerId = ?
             WHERE id = ?`,
            [title, percentage, segmentQuery, minimumAmount, minimumItem, code, convertedExpireDate, tag, segmentId, discountId, email, customerId, id]
        );

        return result;
    },

    remove: async (id) => {
        const [result] = await wowomartPool.query('DELETE FROM coupon_user_list WHERE id = ?', [id]);
        return result;
    },

    removeWithUpdate: async ({ id, customerId, tag }) => {
        const [rows] = await wowomartPool.query('SELECT discountId FROM coupon_user_list WHERE id = ?', [id]);
        if (rows.length === 0) throw new Error('Coupon user not found.');

        // First, update the tag
        const apiResponse = await axios.post('https://grozziie.zjweiting.com:57683/tht/wowomart/api/shopify/update', {
            update: 2,
            customerId,
            tags: tag,
        });
        console.log({
            update: 2,
            customerId,
            tags: tag,
        }, apiResponse);

        // Proceed with deletion only if update was successful
        if (apiResponse.data?.success || apiResponse.status === 200) {
            await wowomartPool.query('DELETE FROM coupon_user_list WHERE id = ?', [id]);
            return {
                success: true,
                message: 'Tag updated and coupon user deleted successfully.',
                data: apiResponse.data
            };
        } else {
            throw new Error('Failed to update tag before deletion.');
        }
    }

};

module.exports = CouponUserListModel;
