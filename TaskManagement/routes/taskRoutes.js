const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');

const { getTaskDetailsById } = require('../controller/taskController');

router.get('/taskManagement/api/task-details/:taskId', getTaskDetailsById);
router.post('/taskManagement/api/tasks/Create', taskController.createTask);
router.put('/taskManagement/api/tasks/update/:id', taskController.updateTask);

// Delete by POST request
router.post('/taskManagement/api/delete-task', taskController.deleteTaskById);

module.exports = router;


