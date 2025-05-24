const TaskManagementPool = require('../../TaskManagementDb/config/db');

exports.createUser = async (user) => {
    const [result] = await TaskManagementPool.execute(
        `INSERT INTO users (name, email, password, role, designation, phone, joiningDate, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.name, user.email, user.password, user.role, user.designation, user.phone, user.joiningDate, user.image]
    );
    return result;
};


exports.findUserByEmail = async (email) => {
    const [rows] = await TaskManagementPool.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0];
};

exports.updateUser = async (user) => {
    const [result] = await TaskManagementPool.execute(
        `UPDATE users SET name=?, role=?, designation=?, phone=?, joiningDate=?, image=? WHERE id=?`,
        [user.name, user.role, user.designation, user.phone, user.joiningDate, user.image, user.id]
    );
    return result.affectedRows > 0;
};

exports.findUserById = async (id) => {
    const [rows] = await TaskManagementPool.execute(`SELECT * FROM users WHERE id = ?`, [id]);
    return rows[0] || null;
};

exports.deleteUser = async (id) => {
    const [result] = await TaskManagementPool.execute(`DELETE FROM users WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};

exports.findUsersByIds = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    // Create placeholders like "?, ?, ?" based on the number of IDs
    const placeholders = ids.map(() => '?').join(', ');
    const sql = `SELECT * FROM users WHERE id IN (${placeholders})`;

    const [rows] = await TaskManagementPool.execute(sql, ids);
    return rows;
};