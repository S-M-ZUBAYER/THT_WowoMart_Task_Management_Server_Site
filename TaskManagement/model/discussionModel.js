const TaskManagementPool = require('../../TaskManagementDb/config/db');

const executeQuery = async (query, params) => {
    const [rows] = await TaskManagementPool.execute(query, params);
    return rows; // This works for SELECT, but not INSERT!
};

const discussionModel = {
    createDiscussion: (data) => {
        const query = `INSERT INTO TaskDiscussionInfo (task_id, title, discussion_date, details, discussion_with_ids) VALUES (?, ?, ?, ?, ?)`;
        const params = [
            data.task_id,
            data.title,
            data.discussion_date,
            data.details,
            data.discussion_with_ids
        ];
        return executeQuery(query, params);
    },

    getDiscussionsByTask: (taskId) => executeQuery(`SELECT * FROM TaskDiscussionInfo WHERE task_id = ?`, [taskId]),

    updateDiscussion: (id, data) => {
        const query = `UPDATE TaskDiscussionInfo SET title=?, discussion_date=?, details=?, discussion_with_ids=? WHERE id = ?`;
        const params = [
            data.title,
            data.discussion_date,
            data.details,
            data.discussion_with_ids,
            id
        ];
        return executeQuery(query, params);
    }

};

module.exports = discussionModel;