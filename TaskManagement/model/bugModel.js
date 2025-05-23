const TaskManagementPool = require('../../TaskManagementDb/config/db');

exports.create = (data) => {
    return TaskManagementPool.execute(
        'INSERT INTO BugManagement (projectName, BugDetails, findDate, solveDate, asignWith, priority, attachmentFile, status, creationDate, createdEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)',
        [data.projectName, data.BugDetails, data.findDate, data.solveDate, data.asignWith, data.priority, data.attachmentFile, data.status, data.createdEmail]
    );
};

exports.updateById = (id, data) => {
    return TaskManagementPool.execute(
        'UPDATE BugManagement SET projectName=?, BugDetails=?, findDate=?, solveDate=?, asignWith=?, priority=?, attachmentFile=?, status=?, createdEmail=? WHERE id=?',
        [data.projectName, data.BugDetails, data.findDate, data.solveDate, data.asignWith, data.priority, data.attachmentFile, data.status, data.createdEmail, id]
    );
};

exports.getById = (id) => TaskManagementPool.execute('SELECT * FROM BugManagement WHERE id=?', [id]);
exports.getAll = () => TaskManagementPool.execute('SELECT * FROM BugManagement');
exports.deleteById = (id) => TaskManagementPool.execute('DELETE FROM BugManagement WHERE id=?', [id]);
exports.getByMultipleId = (ids) => TaskManagementPool.query('SELECT * FROM BugManagement WHERE id IN (?)', [ids]);
exports.deleteByMultipleId = (ids) => TaskManagementPool.query('DELETE FROM BugManagement WHERE id IN (?)', [ids]);
