const TaskManagementPool = require('../../TaskManagementDb/config/db');
const path = require('path');
const fs = require('fs');

const executeQuery = async (query, params) => {
    const [rows] = await TaskManagementPool.execute(query, params);
    return rows; // This works for SELECT, but not INSERT!
};

exports.create = (data) => {
    return TaskManagementPool.execute(
        `INSERT INTO BugManagement ( 
        projectName, BugTitle, BugDetails, findDate, solveDate, assignWith,
        priority, attachmentFile, status, creationDate, createdEmail,
        path, bugProjectId, remark
    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
`,
        [
            data.projectName,
            data.BugTitle,
            data.BugDetails,
            data.findDate,
            data.solveDate,
            Array.isArray(data.assignWith) ? data.assignWith.join(',') : null,  // Convert array to comma-separated string
            data.priority,
            // data.attachmentFile,
            `https://grozziie.zjweiting.com:57683/tht/uploads/bugs_attachment_files/${data.attachmentFile}`,
            data.status,
            data.createdEmail,
            `https://grozziie.zjweiting.com:57683/tht/uploads/bugs_attachment_files/${data.attachmentFile}`,
            data.bugProjectId,
            data.remark
        ]
    );

};

exports.updateById = (id, data) => {
    return TaskManagementPool.execute(
        'UPDATE BugManagement SET projectName=?,BugTitle, BugDetails=?, findDate=?, solveDate=?, assignWith=?, priority=?, attachmentFile=?, status=?, createdEmail=?, remark=? WHERE id=?',
        [data.projectName, data.BugTitle, data.BugDetails, data.findDate, data.solveDate, data.assignWith, data.priority, data.attachmentFile, data.status, data.createdEmail, data.remark, id]
    );
};


exports.updateBugById = async (id, data) => {
    if (data.status === 'Solved') {
        const currentDate = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD
        data.solveDate = currentDate;
    }

    const sql = 'UPDATE bugManagement SET ? WHERE id = ?';
    return TaskManagementPool.query(sql, [data, id]);
};

exports.updateRemarkDetailsById = async (id, data) => {
    const sql = `
        UPDATE bugManagement
        SET remark = ?, BugDetails = ?
        WHERE id = ?
    `;

    return TaskManagementPool.query(sql, [data.remark, data.BugDetails, id]);
};


exports.deleteByBugsIdForTaskName = async (bug_id) => {
    console.log(`📌 Deleting attachments for bugs_id: ${bug_id}`);
    try {
        const attachment = await executeQuery(
            `SELECT attachmentFile FROM bugmanagement WHERE id = ?`,
            [bug_id]
        );
        const fileName = attachment[0]?.attachmentFile?.replace(
            'https://grozziie.zjweiting.com:57683/tht/uploads/bugs_attachment_files/',
            ''
        ).trim();

        const filePath = path.join(__dirname, '../uploads/bugs_attachment_files', fileName);

        if (fs.existsSync(filePath)) {
            try {
                await fs.promises.unlink(filePath);
                console.log(`✅ Deleted file: ${filePath}`);
            } catch (err) {
                console.error(`❌ Error deleting file: ${filePath}`, err.message);
            }
        } else {
            console.warn(`⚠️ File not found: ${filePath}`);
        }

        await TaskManagementPool.execute('DELETE FROM BugManagement WHERE id=?', [bug_id]);
    } catch (err) {
        console.error('❌ Error in deleteByBugsIdForTaskName:', err);
        throw err;
    }
};

exports.getById = (id) => TaskManagementPool.execute('SELECT * FROM BugManagement WHERE id=?', [id]);
exports.getProjectIdByName = async (projectName) => {
    const [rows] = await TaskManagementPool.execute(
        'SELECT * FROM bugproject WHERE bugProjectName=?',
        [projectName]
    );
    return rows;
};
exports.getAll = () => TaskManagementPool.execute('SELECT * FROM BugManagement');
exports.deleteById = (id) => TaskManagementPool.execute('DELETE FROM BugManagement WHERE id=?', [id]);
exports.deleteByProjectId = async (id) => {
    const [result] = await TaskManagementPool.execute('DELETE FROM bugproject WHERE id = ?', [id]);
    return result.affectedRows;
};

exports.getByMultipleId = (ids) => TaskManagementPool.query('SELECT * FROM BugManagement WHERE id IN (?)', [ids]);
exports.deleteByMultipleId = (ids) => TaskManagementPool.query('DELETE FROM BugManagement WHERE id IN (?)', [ids]);
