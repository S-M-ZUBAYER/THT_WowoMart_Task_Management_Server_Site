// const TaskManagementPool = require('../config/db');

// const TaskFullInfoModel = {
//     create: (data, callback) => {
//         const sql = `INSERT INTO TaskFullInfo 
//     (TaskTitle, TaskDetails, TaskStartingTime, TaskDeadLine, TaskCompletingDate, AsignEmployees, Status) 
//     VALUES (?, ?, ?, ?, ?, ?, ?)`;
//         TaskManagementPool.query(sql, data, callback);
//     },

//     getAll: (callback) => {
//         TaskManagementPool.query("SELECT * FROM TaskFullInfo", callback);
//     },

//     getById: (id, callback) => {
//         TaskManagementPool.query("SELECT * FROM TaskFullInfo WHERE id = ?", [id], callback);
//     },

//     update: (id, data, callback) => {
//         const sql = `UPDATE TaskFullInfo SET TaskTitle=?, TaskDetails=?, TaskStartingTime=?, TaskDeadLine=?, TaskCompletingDate=?, AsignEmployees=?, Status=? WHERE id=?`;
//         TaskManagementPool.query(sql, [...data, id], callback);
//     },

//     delete: (id, callback) => {
//         TaskManagementPool.query("DELETE FROM TaskFullInfo WHERE id = ?", [id], callback);
//     }
// };

// module.exports = TaskFullInfoModel;


// // File: models/taskModel.js
// const TaskManagementPool = require('../../TaskManagementDb/config/db');

// // Utility function for executing queries
// const executeQuery = (query, params) => TaskManagementPool.query(query, params);

// module.exports = {
//     createTask: (data) => {
//         const query = `INSERT INTO TaskFullInfo (task_title, task_details, task_starting_time, task_deadline, task_completing_date, assigned_employee_ids, status)
//                    VALUES (?, ?, ?, ?, ?, ?, ?)`;
//         const params = [
//             data.task_title,
//             data.task_details,
//             data.task_starting_time,
//             data.task_deadline,
//             data.task_completing_date,
//             data.assigned_employee_ids,
//             data.status
//         ];
//         return executeQuery(query, params);
//     },

//     getAllTasks: () => executeQuery(`SELECT * FROM TaskFullInfo`, []),

//     getTaskById: (id) => executeQuery(`SELECT * FROM TaskFullInfo WHERE id = ?`, [id]),

//     updateTask: (id, data) => {
//         const query = `UPDATE TaskFullInfo SET task_title=?, task_details=?, task_starting_time=?, task_deadline=?, task_completing_date=?, assigned_employee_ids=?, status=? WHERE id = ?`;
//         const params = [
//             data.task_title,
//             data.task_details,
//             data.task_starting_time,
//             data.task_deadline,
//             data.task_completing_date,
//             data.assigned_employee_ids,
//             data.status,
//             id
//         ];
//         return executeQuery(query, params);
//     },

//     deleteTask: (id) => executeQuery(`DELETE FROM TaskFullInfo WHERE id = ?`, [id])
// };


const TaskManagementPool = require('../../TaskManagementDb/config/db');

const executeQuery = async (query, params) => {
    const [rows] = await TaskManagementPool.execute(query, params);
    return rows; // This works for SELECT, but not INSERT!
};

module.exports = {
    createTask: async (data) => {
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
    },

    updateTask: async (id, data) => {
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
    }
};



// Get task info
const getTaskInfo = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskFullInfo WHERE id = ?`, [taskId]);
    return rows[0];
};

// Get users by IDs
const getUsersByIds = async (ids) => {
    if (!ids.length) return [];
    const [rows] = await TaskManagementPool.query(`SELECT * FROM users WHERE id IN (?)`, [ids]);
    return rows;
};

// Get task discussions
const getDiscussionsByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskDiscussionInfo WHERE task_id = ?`, [taskId]);
    return rows;
};

// Get discussion attachments
const getAttachmentsByDiscussionId = async (discussionId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM DiscussionAttachment WHERE discussion_id = ?`, [discussionId]);
    return rows;
};

// Get test reports
const getTestReportsByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM TestReportsDocuments WHERE task_id = ?`, [taskId]);
    return rows;
};

// Get resource files
const getResourceFilesByTaskId = async (taskId) => {
    const [rows] = await TaskManagementPool.query(`SELECT * FROM ResourceFiles WHERE task_id = ?`, [taskId]);
    return rows;
};

module.exports = {
    getTaskInfo,
    getUsersByIds,
    getDiscussionsByTaskId,
    getAttachmentsByDiscussionId,
    getTestReportsByTaskId,
    getResourceFilesByTaskId
};



module.exports = {
    getDiscussionIdsByTaskId: (taskId) => {
        const query = `SELECT id FROM TaskDiscussionInfo WHERE task_id = ?`;
        return executeQuery(query, [taskId]);
    },

    deleteDiscussionAttachmentsByDiscussionIds: (discussionIds) => {
        const placeholders = discussionIds.map(() => '?').join(',');
        const query = `DELETE FROM DiscussionAttachment WHERE discussion_id IN (${placeholders})`;
        return executeQuery(query, discussionIds);
    },

    deleteDiscussionsByTaskId: (taskId) => {
        const query = `DELETE FROM TaskDiscussionInfo WHERE task_id = ?`;
        return executeQuery(query, [taskId]);
    },

    deleteTestReportsByTaskId: (taskId) => {
        const query = `DELETE FROM TestReportsDocuments WHERE task_id = ?`;
        return executeQuery(query, [taskId]);
    },

    deleteResourceFilesByTaskId: (taskId) => {
        const query = `DELETE FROM ResourceFiles WHERE task_id = ?`;
        return executeQuery(query, [taskId]);
    },

    deleteTaskById: (taskId) => {
        const query = `DELETE FROM TaskFullInfo WHERE id = ?`;
        return executeQuery(query, [taskId]);
    }
};
