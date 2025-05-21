// // File: routes/taskRoutes.js
// const express = require('express');
// const router = express.Router();
// const taskController = require('../controllers/taskController');


// // TaskFullInfo APIs
// router.post('/tasks', taskController.createTask);
// router.get('/tasks', taskController.getAllTasks);
// router.get('/tasks/:id', taskController.getTaskById);
// router.put('/tasks/:id', taskController.updateTask);
// router.delete('/tasks/:id', taskController.deleteTask);



// module.exports = router;


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


