const TaskManagementPool = require('../../TaskManagementDb/config/db'); // your DB connection

exports.create = (data) => {
    const sql = 'INSERT INTO dailyTaskReport SET ?';
    return TaskManagementPool.query(sql, data);
};

exports.updateById = (id, data) => {
    const sql = 'UPDATE dailyTaskReport SET ? WHERE id = ?';
    return TaskManagementPool.query(sql, [data, id]);
};

exports.getById = (id) => {
    const sql = 'SELECT * FROM dailyTaskReport WHERE id = ?';
    return TaskManagementPool.query(sql, [id]);
};

exports.getByEmail = (email) => {
    const sql = 'SELECT * FROM dailyTaskReport WHERE employeeEmail = ?';
    return TaskManagementPool.query(sql, [email]);
};

exports.getAll = () => {
    const sql = 'SELECT * FROM dailyTaskReport ORDER BY createdTime DESC';
    return TaskManagementPool.query(sql);
};

exports.getByDate = async (date) => {
    const query = 'SELECT * FROM dailyTaskReport WHERE reportDate = ?';
    return await TaskManagementPool.query(query, [date]);
},


    exports.deleteById = (id) => {
        const sql = 'DELETE FROM dailyTaskReport WHERE id = ?';
        return TaskManagementPool.query(sql, [id]);
    };

exports.deleteByMultipleId = (ids) => {
    const sql = `DELETE FROM dailyTaskReport WHERE id IN (?)`;
    return TaskManagementPool.query(sql, [ids]);
};

exports.deleteByEmail = (email) => {
    const sql = 'DELETE FROM dailyTaskReport WHERE employeeEmail = ?';
    return TaskManagementPool.query(sql, [email]);
};
