// // File: controllers/taskController.js
// const TaskManagementPool = require('../../TaskManagementDb/config/db');

// exports.createTask = async (req, res) => {
//     const {
//         task_title,
//         task_details,
//         task_starting_time,
//         task_deadline,
//         task_completing_date,
//         assigned_employee_ids,
//         status
//     } = req.body;

//     try {
//         const [result] = await TaskManagementPool.query(
//             `INSERT INTO TaskFullInfo (task_title, task_details, task_starting_time, task_deadline, task_completing_date, assigned_employee_ids, status)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//             [task_title, task_details, task_starting_time, task_deadline, task_completing_date, assigned_employee_ids, status]
//         );
//         res.status(201).json({ id: result.insertId });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.getAllTasks = async (req, res) => {
//     try {
//         const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskFullInfo`);
//         res.json(rows);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.getTaskById = async (req, res) => {
//     try {
//         const [rows] = await TaskManagementPool.query(`SELECT * FROM TaskFullInfo WHERE id = ?`, [req.params.id]);
//         res.json(rows[0]);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.updateTask = async (req, res) => {
//     const { task_title, task_details, task_starting_time, task_deadline, task_completing_date, assigned_employee_ids, status } = req.body;
//     try {
//         await TaskManagementPool.query(
//             `UPDATE TaskFullInfo SET task_title=?, task_details=?, task_starting_time=?, task_deadline=?, task_completing_date=?, assigned_employee_ids=?, status=? WHERE id = ?`,
//             [task_title, task_details, task_starting_time, task_deadline, task_completing_date, assigned_employee_ids, status, req.params.id]
//         );
//         res.sendStatus(204);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// exports.deleteTask = async (req, res) => {
//     try {
//         await TaskManagementPool.query(`DELETE FROM TaskFullInfo WHERE id = ?`, [req.params.id]);
//         res.sendStatus(204);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };


const { createTaskSchema } = require('../schemas/taskSchema');
const TaskModel = require('../model/TaskFullInfoModel');
const { updateTaskSchema } = require('../schemas/taskSchema');

exports.createTask = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = createTaskSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message, result: null });
        }

        // Convert assigned_employee_ids array to comma-separated string
        const assignedIdsString = value.assigned_employee_ids.join(',');

        // Prepare data for DB insertion
        const taskData = {
            ...value,
            assigned_employee_ids: assignedIdsString
        };

        const result = await TaskModel.createTask(taskData);


        res.status(201).json({
            status: 201,
            message: 'Task created successfully',
            result: { insertId: result.insertId }
        });
    } catch (err) {
        console.error('Error creating task:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            result: null
        });
    }
};



exports.updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        // Validate input
        const { error, value } = updateTaskSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message,
                result: null
            });
        }

        const result = await TaskModel.updateTask(taskId, value);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Task not found',
                result: null
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Task updated successfully',
            result: { affectedRows: result.affectedRows }
        });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({
            status: 500,
            message: 'Internal server error',
            result: null
        });
    }
};


const {
    getTaskInfo,
    getUsersByIds,
    getDiscussionsByTaskId,
    getAttachmentsByDiscussionId,
    getTestReportsByTaskId,
    getResourceFilesByTaskId
} = require('../model/TaskFullInfoModel');

exports.getTaskDetailsById = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await getTaskInfo(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Get assigned users
        let assignedEmployees = [];
        if (task.assigned_employee_ids) {
            const userIds = task.assigned_employee_ids.split(',').map(id => parseInt(id.trim()));
            assignedEmployees = await getUsersByIds(userIds);
        }

        // Get discussions and map users and attachments
        const discussions = await getDiscussionsByTaskId(taskId);
        for (let discussion of discussions) {
            discussion.discussion_with_users = [];
            if (discussion.discussion_with_ids) {
                const ids = discussion.discussion_with_ids.split(',').map(id => parseInt(id.trim()));
                discussion.discussion_with_users = await getUsersByIds(ids);
            }
            discussion.attachments = await getAttachmentsByDiscussionId(discussion.id);
        }

        // Get additional task resources
        const testReports = await getTestReportsByTaskId(taskId);
        const resourceFiles = await getResourceFilesByTaskId(taskId);

        res.status(200).json({
            message: 'Task Details Retrieved Successfully',
            data: {
                taskInfo: task,
                assignedEmployees,
                discussions,
                testReports,
                resourceFiles
            }
        });

    } catch (error) {
        console.error('Error retrieving task details:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.deleteTaskById = async (req, res) => {
    try {
        const { task_id } = req.body;

        if (!task_id || typeof task_id !== 'number') {
            return res.status(400).json({ status: 400, message: 'task_id must be a number', result: null });
        }

        // Get discussion IDs related to this task
        const discussionIdsResult = await TaskModel.getDiscussionIdsByTaskId(task_id);
        const discussionIds = discussionIdsResult.map(row => row.id);

        // Delete attachments based on discussion IDs
        if (discussionIds.length > 0) {
            await TaskModel.deleteDiscussionAttachmentsByDiscussionIds(discussionIds);
        }

        // Delete discussions
        await TaskModel.deleteDiscussionsByTaskId(task_id);

        // Delete test reports
        await TaskModel.deleteTestReportsByTaskId(task_id);

        // Delete resource files
        await TaskModel.deleteResourceFilesByTaskId(task_id);

        // Finally delete the task
        await TaskModel.deleteTaskById(task_id);

        return res.status(200).json({
            status: 200,
            message: `Task and related data deleted successfully for task_id ${task_id}`,
            result: null
        });

    } catch (err) {
        console.error('Error deleting task:', err);
        return res.status(500).json({ status: 500, message: 'Internal server error', result: null });
    }
};