const TaskManagementPool = require('../../TaskManagementDb/config/db');

const executeQuery = async (query, params) => {
    const [rows] = await TaskManagementPool.execute(query, params);
    return rows; // This works for SELECT, but not INSERT!
};

exports.createTask = async (data) => {
    const query = `INSERT INTO TaskFullInfo 
      (project_name,task_title, task_details, task_starting_time, task_deadline, task_completing_date, assigned_employee_ids, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        data.project_name,
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

exports.createBugProjectFromTask = async (bugProjectName) => {
    const query = `INSERT INTO bugproject (bugProjectName) VALUES (?)`;
    await TaskManagementPool.execute(query, [bugProjectName]);
};

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

exports.updateTaskById = (id, data) => {
    const sql = 'UPDATE TaskFullInfo SET ? WHERE id = ?';
    return TaskManagementPool.query(sql, [data, id]);
};

exports.getTaskInfo = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskFullInfo WHERE id = ?`, [taskId]);
    return rows[0];
};

exports.getTaskInfoByProjectName = async (project_name) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskFullInfo WHERE project_name = ?`, [project_name]);
    return rows;
};

exports.getAllTasksAccordingToProjectName = async () => {
    const sql = `
        SELECT id, project_name, task_title, task_details, assigned_employee_ids
        FROM taskfullinfo
        ORDER BY project_name, id
    `;
    const [rows] = await TaskManagementPool.execute(sql); // ✅ This line was throwing the error
    return rows;
};

exports.getAllTaskInfo = async () => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskFullInfo`);
    return rows; // return the full array of tasks
};

exports.getAllRelatedProjectBugsByProjectName = async (projectName) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM bugmanagement WHERE projectName = ?`, [projectName]);
    return rows; // return the full array of tasks
};

exports.getUsersByIds = async (ids) => {
    if (!ids.length) return [];
    const [rows] = await TaskManagementPool.query(`SELECT * FROM users WHERE id IN (?)`, [ids]);
    return rows;
};

exports.getDiscussionsByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskDiscussionInfo WHERE task_id = ?`, [taskId]);
    return rows;
};

exports.getAttachmentsByDiscussionId = async (discussionId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM DiscussionAttachment WHERE discussion_id = ?`, [discussionId]);
    return rows;
};

exports.getTestReportsByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TestReportsDocuments WHERE task_id = ?`, [taskId]);
    return rows;
};

exports.getResourceFilesByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM ResourceFiles WHERE task_id = ?`, [taskId]);
    return rows;
};

exports.deleteTaskById = async (taskId) => {
    const [rows] = await TaskManagementPool.query(` DELETE FROM TaskFullInfo WHERE id=? `, [taskId]);
    return rows[0];
};

exports.deleteNotificationsByTaskId = async (taskId) => {
    const sql = `
        DELETE FROM notifications
        WHERE path LIKE ?
    `;
    const likePattern = `%/task-details/${taskId}%`;
    const [result] = await TaskManagementPool.execute(sql, [likePattern]);
    return result;
};
