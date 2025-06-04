const path = require('path');
const fs = require('fs');

const { createTaskSchema, updateTaskStatusSchema } = require('../schemas/taskSchema');
const TaskModel = require('../model/TaskFullInfoModel');
const { updateTaskSchema } = require('../schemas/taskSchema');
const {
    getTaskInfo,
    getAllTaskInfo,
    getUsersByIds,
    getDiscussionsByTaskId,
    getAttachmentsByDiscussionId,
    getTestReportsByTaskId,
    getResourceFilesByTaskId
} = require('../model/TaskFullInfoModel');

const discussionModel = require('../model/discussionModel');
const { deleteTestReportsByTaskId } = require('../model/testReportsModel');
const { deleteResourceFilesByTaskId } = require('../model/resourceFilesModel');
const { getProjectIdByName, deleteByProjectId, deleteByBugsIdForTaskName } = require('../model/bugModel');


exports.createTask = async (req, res) => {
    try {
        const { error, value } = createTaskSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ status: 400, message: error.details[0].message, result: null });
        }

        const assignedIdsString = value.assigned_employee_ids.join(',');

        const taskData = {
            ...value,
            assigned_employee_ids: assignedIdsString,
            task_deadline: value.task_deadline ?? null,
            task_completing_date: value.task_completing_date ?? null
        };
        // Insert into Task table
        const taskResult = await TaskModel.createTask(taskData);

        // Insert into bugproject table
        await TaskModel.createBugProjectFromTask(taskData.task_title);

        res.status(201).json({
            status: 201,
            message: 'Task and bug project created successfully',
            result: { insertId: taskResult.insertId }
        });
    } catch (err) {
        console.error('Error creating task and bug project:', err);
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

        const updatedTaskData = {
            ...value,
            task_deadline: value.task_deadline ?? null,
            task_completing_date: value.task_completing_date ?? null
        };

        const result = await TaskModel.updateTask(taskId, updatedTaskData);

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

exports.updateTaskStatus = async (req, res) => {
    try {
        const { error, value } = updateTaskStatusSchema.validate(req.body);
        if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

        const id = req.params.id;
        const result = await TaskModel.updateTaskById(id, { status: value.status });

        res.status(200).json({ status: 200, message: 'Bug status updated', result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error' });
    }
};

exports.getTaskDetailsById = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await getTaskInfo(taskId);

        if (!task || task === undefined) return res.status(404).json({
            status: 404,
            message: 'Task not found',
            result: null
        });

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
            status: 200,
            message: 'Task Details Retrieved Successfully',
            data: {
                taskInfo: {
                    ...task,
                    assigned_employee_ids: assignedEmployees
                },
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

exports.getAllTaskDetails = async (req, res) => {
    console.log('🔧 [getAllTaskDetails] Route Hit');
    try {
        const allTasks = await getAllTaskInfo(); // Replace with your actual DB call

        const detailedTasks = [];

        for (let task of allTasks) {
            // Get assigned employees
            let assignedEmployees = [];
            if (task.assigned_employee_ids) {
                const userIds = task.assigned_employee_ids.split(',').map(id => parseInt(id.trim()));
                assignedEmployees = await getUsersByIds(userIds);
            }

            // Get discussions and map users and attachments
            const discussions = await getDiscussionsByTaskId(task.id);
            for (let discussion of discussions) {
                discussion.discussion_with_users = [];
                if (discussion.discussion_with_ids) {
                    const ids = discussion.discussion_with_ids.split(',').map(id => parseInt(id.trim()));
                    discussion.discussion_with_users = await getUsersByIds(ids);
                }
                discussion.attachments = await getAttachmentsByDiscussionId(discussion.id);
            }

            // Get additional task resources
            const testReports = await getTestReportsByTaskId(task.id);
            const resourceFiles = await getResourceFilesByTaskId(task.id);

            detailedTasks.push({
                taskInfo: {
                    ...task,
                    assigned_employee_ids: assignedEmployees
                },
                discussions,
                testReports,
                resourceFiles
            });

        }

        res.status(200).json({
            status: 200,
            message: 'All Task Details Retrieved Successfully',
            data: detailedTasks
        });

    } catch (error) {
        console.error('Error retrieving all task details:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteTaskById = async (req, res) => {
    try {
        const { task_id, projectName } = req.body;
        if (!task_id || typeof task_id !== 'number') {
            return res.status(400).json({ status: 400, message: 'task_id must be a number', result: null });
        }

        // Delete all bugs related to this task
        const bugManagementIdsRelatedToTask = await TaskModel.getAllRelatedProjectBugsByProjectName(projectName);
        const bugManagementIdsRelatedToTaskIds = bugManagementIdsRelatedToTask.map(row => row.id);
        const projectData = await getProjectIdByName(projectName);
        const projectId = projectData[0]?.id;
        if (bugManagementIdsRelatedToTaskIds.length > 0) {
            try {
                await Promise.all(
                    bugManagementIdsRelatedToTaskIds.map(async (bugsId) => {
                        await deleteByBugsIdForTaskName(bugsId);
                    })
                );

                const deleted = await deleteByProjectId(projectId);
                console.log(deleted);

                if (deleted === 0) {
                    console.warn(`⚠️ No project found with id: ${projectId}`);
                }

            } catch (err) {
                console.error('❌ Error deleting all bugs related to this task:', err);
                return res.status(500).json({ status: 500, message: 'Error deleting related discussions', result: null });
            }
        }


        // Delete related discussions
        const discussionIdsResult = await TaskModel.getDiscussionsByTaskId(task_id);
        const discussionIds = discussionIdsResult.map(row => row.id);

        if (discussionIds.length > 0) {
            try {
                await Promise.all(
                    discussionIds.map(async (discussionId) => {
                        await discussionModel.deleteByDiscussionIdForTaskId(discussionId);
                    })
                );
            } catch (err) {
                console.error('❌ Error deleting discussions:', err);
                return res.status(500).json({ status: 500, message: 'Error deleting related discussions', result: null });
            }
        }

        // Delete test report files
        try {
            const testReports = await getTestReportsByTaskId(task_id);
            for (const file of testReports) {
                const fileName = file.path.replace('https://grozziie.zjweiting.com:57683/tht/uploads/test_reports_files/', '');
                const filePath = path.join(__dirname, '../uploads/test_reports_files', fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`✅ Deleted test report file: ${filePath}`);
                }
            }
            await deleteTestReportsByTaskId(task_id);
        } catch (err) {
            console.error('❌ Error deleting test reports:', err);
            return res.status(500).json({ status: 500, message: 'Error deleting test reports', result: null });
        }

        // Delete resource files
        try {
            const resourceFiles = await getResourceFilesByTaskId(task_id);
            for (const file of resourceFiles) {

                const fileName = file.resource_file.replace('https://grozziie.zjweiting.com:57683/tht/uploads/resources_files/', '');
                const filePath = path.join(__dirname, '../uploads/resources_files', fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`✅ Deleted resource file: ${filePath}`);

                }
            }
            await deleteResourceFilesByTaskId(task_id);
        } catch (err) {
            console.error('❌ Error deleting resource files:', err);
            return res.status(500).json({ status: 500, message: 'Error deleting resource files', result: null });
        }

        // Finally delete the task
        await TaskModel.deleteTaskById(task_id);

        return res.status(200).json({
            status: 200,
            message: `Task and all related files and discussions deleted successfully for task_id ${task_id}`,
            result: null
        });

    } catch (err) {
        console.error('❌ Error deleting task:', err);
        return res.status(500).json({ status: 500, message: 'Internal server error', result: null });
    }
};