const wowomartPool = require('../../wowomartDb/config/db'); // Ensure correct path to your db config

const CouponUserInfo = {
    getAll: async () => {
        const query = `
            SELECT 
                u.*, 
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', c.id,
                        'cause_name', c.cause_name,
                        'description', c.description
                    )
                ) AS causes
            FROM coupon_user_info u
            LEFT JOIN coupon_cause c ON u.id = c.user_id
            GROUP BY u.id
        `;

        const [results] = await wowomartPool.query(query);

        return results.map(user => ({
            ...user,
            causes: JSON.parse(user.causes)
        }));
    },


    getById: async (id) => {
        try {
            const query = `
                SELECT 
                    u.*, 
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', c.id,
                            'cause_name', c.cause_name,
                            'description', c.description
                        )
                    ) AS causes
                FROM coupon_user_info u
                LEFT JOIN coupon_cause c ON u.id = c.user_id
                WHERE u.id = ?
                GROUP BY u.id
            `;

            // ✅ use the promise-based pool
            const [results] = await wowomartPool.query(query, [id]);

            if (!results[0]) return null;

            const user = results[0];
            user.causes = JSON.parse(user.causes);
            return user;
        } catch (err) {
            throw err;
        }
    },

    create: async (data) => {
        const {
            user_name,
            user_email,
            user_country,
            account_duration,
            user_id,
            tag_name,
            discount,
            coupon_code,
            coupon_title,
            expire_time,
            causes = []
        } = data;

        const connection = wowomartPool;

        try {
            await connection.query('START TRANSACTION');

            const userSql = `
                INSERT INTO coupon_user_info 
                (user_name, user_email, user_country, account_duration, user_id, tag_name, discount, coupon_code, coupon_title, expire_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const userValues = [
                user_name,
                user_email,
                user_country,
                account_duration,
                user_id,
                tag_name,
                discount,
                coupon_code,
                coupon_title,
                expire_time
            ];

            const [userResult] = await connection.query(userSql, userValues);
            const newUserId = userResult.insertId;

            for (const cause of causes) {
                await connection.query(
                    'INSERT INTO coupon_cause (cause_name, description, user_id) VALUES (?, ?, ?)',
                    [cause.cause_name, cause.description || null, newUserId]
                );
            }

            await connection.query('COMMIT');
            return {
                message: 'User and causes added successfully',
                userId: newUserId
            };
        } catch (err) {
            await connection.query('ROLLBACK');
            throw err;
        }
    },




    update: async (id, data) => {
        const {
            user_name,
            user_email,
            user_country,
            account_duration,
            user_id,
            tag_name,
            discount,
            coupon_code,
            coupon_title,
            expire_time,
            causes = [] // Array of { cause_name, description }
        } = data;

        const connection = await wowomartPool.getConnection();

        try {
            await connection.beginTransaction();

            // Update user info
            const updateUserSql = `
            UPDATE coupon_user_info 
            SET user_name=?, user_email=?, user_country=?, account_duration=?, user_id=?, tag_name=?, discount=?, coupon_code=?, coupon_title=?, expire_time=?
            WHERE id=?
          `;

            const updateUserValues = [
                user_name,
                user_email,
                user_country,
                account_duration,
                user_id,
                tag_name,
                discount,
                coupon_code,
                coupon_title,
                expire_time,
                id
            ];

            await connection.query(updateUserSql, updateUserValues);

            // Delete existing causes
            await connection.query('DELETE FROM coupon_cause WHERE user_id = ?', [id]);

            // Insert new causes
            for (const cause of causes) {
                await connection.query(
                    'INSERT INTO coupon_cause (cause_name, description, user_id) VALUES (?, ?, ?)',
                    [cause.cause_name, cause.description || null, id]
                );
            }

            await connection.commit();
            return { message: 'User and causes updated successfully' };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },



    // remove: (id) => {
    //     return new Promise((resolve, reject) => {
    //         wowomartPool.getConnection((err, connection) => {
    //             if (err) return reject(err);

    //             connection.beginTransaction(err => {
    //                 if (err) {
    //                     connection.release();
    //                     return reject(err);
    //                 }

    //                 // First delete from coupon_cause
    //                 connection.query('DELETE FROM coupon_cause WHERE user_id = ?', [id], (err) => {
    //                     if (err) {
    //                         return connection.rollback(() => {
    //                             connection.release();
    //                             reject(err);
    //                         });
    //                     }

    //                     // Then delete from coupon_user_info
    //                     connection.query('DELETE FROM coupon_user_info WHERE id = ?', [id], (err, result) => {
    //                         if (err) {
    //                             return connection.rollback(() => {
    //                                 connection.release();
    //                                 reject(err);
    //                             });
    //                         }

    //                         connection.commit(err => {
    //                             if (err) {
    //                                 return connection.rollback(() => {
    //                                     connection.release();
    //                                     reject(err);
    //                                 });
    //                             }
    //                             connection.release();
    //                             resolve({ message: 'User and related causes deleted successfully', result });
    //                         });
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // },



    remove: async (id) => {
        const connection = await wowomartPool.getConnection();

        try {
            await connection.beginTransaction();

            // First delete from coupon_cause
            await connection.query('DELETE FROM coupon_cause WHERE user_id = ?', [id]);

            // Then delete from coupon_user_info
            const [result] = await connection.query('DELETE FROM coupon_user_info WHERE id = ?', [id]);

            await connection.commit();

            return {
                message: 'User and related causes deleted successfully',
                result
            };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

};

module.exports = CouponUserInfo;

