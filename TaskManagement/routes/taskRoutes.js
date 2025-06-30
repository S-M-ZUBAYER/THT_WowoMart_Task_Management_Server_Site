const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');

router.get('/taskManagement/api/task-details/:taskId', taskController.getTaskDetailsById);
router.get('/taskManagement/api/task-details/projectName/:project_name', taskController.getTaskDetailsByProjectName);
router.get('/taskManagement/api/ProjectListWithTasks', taskController.getAllProjectsWithTasks);
router.get('/taskManagement/api/All-task-details/getAll', taskController.getAllTaskDetails);
router.post('/taskManagement/api/tasks/Create', taskController.createTask);
router.post('/taskManagement/api/tasks/update/:id', taskController.updateTask);
router.post('/taskManagement/api/delete-task', taskController.deleteTaskById);
router.post('/taskManagement/api/taskStatus/:id', taskController.updateTaskStatus);

module.exports = router;


