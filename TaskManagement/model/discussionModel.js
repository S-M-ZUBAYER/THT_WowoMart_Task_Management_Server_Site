const TaskManagementPool = require('../../TaskManagementDb/config/db');
const attachmentModel = require('./attachmentModel');

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

    getDiscussionsByTask: (taskId) => {
        const query = `SELECT * FROM TaskDiscussionInfo WHERE task_id = ?`;
        return executeQuery(query, [taskId]);
    },

    getDiscussionsById: (id) => {
        const query = `SELECT * FROM TaskDiscussionInfo WHERE id = ?`;
        return executeQuery(query, [id]);
    },

    getAttachmentsByDiscussionId: (discussionId) => {
        const query = `SELECT * FROM DiscussionAttachment WHERE discussion_id = ?`;
        return executeQuery(query, [discussionId]);
    },

    deleteDiscussionById: (discussionId) => {
        const query = `DELETE FROM TaskDiscussionInfo WHERE id = ?`;
        return executeQuery(query, [discussionId]);
    },

    deleteAttachmentsByTaskId: (taskId) => {
        const query = `
        DELETE DA FROM DiscussionAttachment DA
        JOIN TaskDiscussionInfo DI ON DA.discussion_id = DI.id
        WHERE DI.task_id = ?`;
        return executeQuery(query, [taskId]);
    },

    deleteDiscussionsByTaskId: (taskId) => {
        const query = `DELETE FROM TaskDiscussionInfo WHERE task_id = ?`;
        return executeQuery(query, [taskId]);
    },

    deleteByDiscussionIdForTaskId: async (discussion_id) => {
        try {
            await attachmentModel.deleteDiscussionIdAttachment(discussion_id);
            await discussionModel.deleteDiscussionById(discussion_id);
        } catch (err) {
            console.error('Error in deleteByDiscussionIdForTaskId:', err);
            throw err; // Let the controller handle the response
        }
    }

};






module.exports = discussionModel;