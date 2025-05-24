const TaskManagementPool = require('../../TaskManagementDb/config/db');

exports.create = (data) => {
    return TaskManagementPool.execute(
        'INSERT INTO BugManagement (projectName, BugDetails, findDate, solveDate, assignWith, priority, attachmentFile, status, creationDate, createdEmail, path,bugProjectId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)',
        [
            data.projectName,
            data.BugDetails,
            data.findDate,
            data.solveDate,
            Array.isArray(data.assignWith) ? data.assignWith.join(',') : null,  // Convert array to comma-separated string
            data.priority,
            data.attachmentFile,
            data.status,
            data.createdEmail,
            "https://grozziie.zjweiting.com:57683/tht/uploads/bugs_attachment_files/",
            data.bugProjectId
        ]
    );

};

exports.updateById = (id, data) => {
    return TaskManagementPool.execute(
        'UPDATE BugManagement SET projectName=?, BugDetails=?, findDate=?, solveDate=?, assignWith=?, priority=?, attachmentFile=?, status=?, createdEmail=? WHERE id=?',
        [data.projectName, data.BugDetails, data.findDate, data.solveDate, data.assignWith, data.priority, data.attachmentFile, data.status, data.createdEmail, id]
    );
};

exports.getById = (id) => TaskManagementPool.execute('SELECT * FROM BugManagement WHERE id=?', [id]);
exports.getAll = () => TaskManagementPool.execute('SELECT * FROM BugManagement');
exports.deleteById = (id) => TaskManagementPool.execute('DELETE FROM BugManagement WHERE id=?', [id]);
exports.getByMultipleId = (ids) => TaskManagementPool.query('SELECT * FROM BugManagement WHERE id IN (?)', [ids]);
exports.deleteByMultipleId = (ids) => TaskManagementPool.query('DELETE FROM BugManagement WHERE id IN (?)', [ids]);
