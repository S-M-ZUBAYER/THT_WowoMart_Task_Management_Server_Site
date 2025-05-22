const TaskManagementPool = require('../../TaskManagementDb/config/db');

const executeQuery = async (query, params) => {
    const [rows] = await TaskManagementPool.execute(query, params);
    return rows; // This works for SELECT, but not INSERT!
};

const discussionModel = {
    // create discussion according to the task_id
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

    // update discussion according to the task_id
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
    },

    // Get discussions by task ID
    getDiscussionsByTask: (taskId) => {
        const query = `SELECT * FROM TaskDiscussionInfo WHERE task_id = ?`;
        return executeQuery(query, [taskId]);
    },
    // Get attachments by discussion ID
    getAttachmentsByDiscussionId: (discussionId) => {
        const query = `SELECT * FROM DiscussionAttachment WHERE discussion_id = ?`;
        return executeQuery(query, [discussionId]);
    },

    // Delete attachments by discussion ID
    deleteAttachmentsByDiscussionId: (discussionId) => {
        const query = `DELETE FROM DiscussionAttachment WHERE discussion_id = ?`;
        return executeQuery(query, [discussionId]);
    },

    // Delete discussion by ID
    deleteDiscussionById: (discussionId) => {
        const query = `DELETE FROM TaskDiscussionInfo WHERE id = ?`;
        return executeQuery(query, [discussionId]);
    },

    // Delete attachments by task ID (join discussion IDs)
    deleteAttachmentsByTaskId: (taskId) => {
        const query = `
        DELETE DA FROM DiscussionAttachment DA
        JOIN TaskDiscussionInfo DI ON DA.discussion_id = DI.id
        WHERE DI.task_id = ?`;
        return executeQuery(query, [taskId]);
    },

    // Delete discussions by task ID
    deleteDiscussionsByTaskId: (taskId) => {
        const query = `DELETE FROM TaskDiscussionInfo WHERE task_id = ?`;
        return executeQuery(query, [taskId]);
    },

};






module.exports = discussionModel;