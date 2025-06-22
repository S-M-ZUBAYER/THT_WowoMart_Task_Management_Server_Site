const TaskManagementPool = require('../../TaskManagementDb/config/db');

exports.createUser = async (user) => {
    const [result] = await TaskManagementPool.execute(
        `INSERT INTO users (name, email, password, role, designation, phone, joiningDate, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.name, user.email, user.password, user.role, user.designation, user.phone, user.joiningDate, user.image]
    );
    return result;
};

exports.updateUser = async (user) => {
    const [result] = await TaskManagementPool.execute(
        `UPDATE users SET name=?, role=?, designation=?, phone=?, joiningDate=?, image=? WHERE id=?`,
        [user.name, user.role, user.designation, user.phone, user.joiningDate, user.image, user.id]
    );
    return result.affectedRows > 0;
};

exports.makeAdminById = (id) => {
    const sql = 'UPDATE users SET role = "Admin" WHERE id = ?';
    return TaskManagementPool.query(sql, [id]);
};

exports.findUserByEmail = async (email) => {
    const [rows] = await TaskManagementPool.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    return rows[0];
};

exports.findUserById = async (id) => {
    const sql = `
        SELECT 
            id, 
            name, 
            email, 
            image, 
            role, 
            DATE_FORMAT(joiningDate, '%Y-%m-%d') AS joiningDate,
            phone, 
            designation, 
            created_at 
        FROM users 
        WHERE id = ?
    `;
    const [rows] = await TaskManagementPool.execute(sql, [id]);
    return rows[0] || null;
};

exports.deleteUser = async (id) => {
    const [result] = await TaskManagementPool.execute(`DELETE FROM users WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};

exports.findUsersByIds = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const placeholders = ids.map(() => '?').join(', ');
    const sql = `
        SELECT 
            id, 
            name, 
            email, 
            image, 
            role, 
            DATE_FORMAT(joiningDate, '%Y-%m-%d') AS joiningDate,
            phone, 
            designation, 
            created_at 
        FROM users 
        WHERE id IN (${placeholders})
    `;

    const [rows] = await TaskManagementPool.execute(sql, ids);
    return rows;
};

exports.getAllUsers = async () => {
    const sql = `
        SELECT 
            id, 
            name, 
            email, 
            image, 
            role, 
            DATE_FORMAT(joiningDate, '%Y-%m-%d') AS joiningDate, 
            phone, 
            designation, 
            created_at 
        FROM users
        ORDER BY id ASC
    `;
    const [rows] = await TaskManagementPool.execute(sql);
    return rows;
};

exports.getAllUsersWithOutImage = async () => {
    const sql = `SELECT id, name, email,role,designation FROM users`;
    const [rows] = await TaskManagementPool.execute(sql);
    return rows;
};
