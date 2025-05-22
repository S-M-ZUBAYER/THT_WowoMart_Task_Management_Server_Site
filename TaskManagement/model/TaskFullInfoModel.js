const TaskManagementPool = require('../../TaskManagementDb/config/db');

const executeQuery = async (query, params) => {
    const [rows] = await TaskManagementPool.execute(query, params);
    return rows; // This works for SELECT, but not INSERT!
};

// create new task info
exports.createTask = async (data) => {
    const query = `INSERT INTO TaskFullInfo 
      (task_title, task_details, task_starting_time, task_deadline, task_completing_date, assigned_employee_ids, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        data.task_title,
        data.task_details,
        data.task_starting_time,
        data.task_deadline,
        data.task_completing_date,
        data.assigned_employee_ids,
        data.status
    ];

    const [result] = await TaskManagementPool.execute(query, params);
    return result; // ✅ This will contain insertId, affectedRows, etc.
};

// Update created task
exports.updateTask = async (id, data) => {
    const query = `
          UPDATE TaskFullInfo 
          SET task_title = ?, task_details = ?, task_starting_time = ?, 
              task_deadline = ?, task_completing_date = ?, assigned_employee_ids = ?, status = ?
          WHERE id = ?
        `;

    const assignedIdsString = data.assigned_employee_ids.join(',');

    const params = [
        data.task_title,
        data.task_details,
        data.task_starting_time,
        data.task_deadline,
        data.task_completing_date,
        assignedIdsString,
        data.status,
        id
    ];

    const [result] = await TaskManagementPool.execute(query, params);
    return result;
};


// Get task info
exports.getTaskInfo = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskFullInfo WHERE id = ?`, [taskId]);
    return rows[0];
};

// Get users by IDs
exports.getUsersByIds = async (ids) => {
    if (!ids.length) return [];
    const [rows] = await TaskManagementPool.query(`SELECT * FROM users WHERE id IN (?)`, [ids]);
    return rows;
};

// Get task discussions
exports.getDiscussionsByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskDiscussionInfo WHERE task_id = ?`, [taskId]);
    return rows;
};

// Get discussion attachments
exports.getAttachmentsByDiscussionId = async (discussionId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM DiscussionAttachment WHERE discussion_id = ?`, [discussionId]);
    return rows;
};

// Get test reports
exports.getTestReportsByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TestReportsDocuments WHERE task_id = ?`, [taskId]);
    return rows;
};

// Get resource files
exports.getResourceFilesByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM ResourceFiles WHERE task_id = ?`, [taskId]);
    return rows;
};

