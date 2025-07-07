const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');


//🟢 createTaskSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTask:
 *       type: object
 *       required:
 *         - project_name
 *         - task_title
 *         - task_details
 *         - task_starting_time
 *         - assigned_employee_ids
 *         - status
 *       properties:
 *         project_name:
 *           type: string
 *           maxLength: 255
 *           example: "Website Redesign"
 *         task_title:
 *           type: string
 *           maxLength: 255
 *           example: "Update homepage UI"
 *         task_details:
 *           type: string
 *           example: "Revamp the hero section and update navbar"
 *         task_starting_time:
 *           type: string
 *           format: date-time
 *           example: "2025-07-07T10:00:00Z"
 *         task_deadline:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-07-15T17:00:00Z"
 *         task_completing_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         assigned_employee_ids:
 *           type: array
 *           items:
 *             type: integer
 *             example: 3
 *         status:
 *           type: string
 *           enum:
 *             - To Do
 *             - In Progress
 *             - Completed
 *           example: "To Do"
 */

//🟡 updateTaskSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateTask:
 *       type: object
 *       required:
 *         - task_title
 *         - task_details
 *         - task_starting_time
 *         - assigned_employee_ids
 *         - status
 *       properties:
 *         task_title:
 *           type: string
 *           example: "Implement login feature"
 *         task_details:
 *           type: string
 *           example: "Create login form and connect to backend"
 *         task_starting_time:
 *           type: string
 *           format: date-time
 *           example: "2025-07-10T09:00:00Z"
 *         task_deadline:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-07-20T17:00:00Z"
 *         task_completing_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         assigned_employee_ids:
 *           type: array
 *           items:
 *             type: integer
 *             example: 1
 *         status:
 *           type: string
 *           enum:
 *             - To Do
 *             - In Progress
 *             - Completed
 *           example: "In Progress"
 */

//🔵 updateTaskStatusSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateTaskStatus:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum:
 *             - To Do
 *             - In Progress
 *             - Completed
 *           example: "Completed"
 */


/**
 * @swagger
 * /taskManagement/api/task-details/{taskId}:
 *   get:
 *     summary: Get task details by task ID
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task to retrieve
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
 *       404:
 *         description: Task not found
 */
router.get('/taskManagement/api/task-details/:taskId', taskController.getTaskDetailsById);

/**
 * @swagger
 * /taskManagement/api/task-details/projectName/{project_name}:
 *   get:
 *     summary: Get tasks by project name
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: project_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the project
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       404:
 *         description: No tasks found for the given project
 */
router.get('/taskManagement/api/task-details/projectName/:project_name', taskController.getTaskDetailsByProjectName);

/**
 * @swagger
 * /taskManagement/api/ProjectListWithTasks:
 *   get:
 *     summary: Get all projects with associated tasks
 *     tags: [Task]
 *     responses:
 *       200:
 *         description: Projects and tasks retrieved successfully
 */
router.get('/taskManagement/api/ProjectListWithTasks', taskController.getAllProjectsWithTasks);

/**
 * @swagger
 * /taskManagement/api/All-task-details/getAll:
 *   get:
 *     summary: Get all task details
 *     tags: [Task]
 *     responses:
 *       200:
 *         description: All task details retrieved successfully
 */
router.get('/taskManagement/api/All-task-details/getAll', taskController.getAllTaskDetails);

/**
 * @swagger
 * /taskManagement/api/tasks/Create:
 *   post:
 *     summary: Create a new task
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 */
router.post('/taskManagement/api/tasks/Create', taskController.createTask);

/**
 * @swagger
 * /taskManagement/api/tasks/update/{id}:
 *   post:
 *     summary: Update a task by ID
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTask'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 */
router.post('/taskManagement/api/tasks/update/:id', taskController.updateTask);

/**
 * @swagger
 * /taskManagement/api/delete-task:
 *   post:
 *     summary: Delete a task by ID
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task_id:
 *                 type: integer
 *               projectName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Invalid request
 */
router.post('/taskManagement/api/delete-task', taskController.deleteTaskById);

/**
 * @swagger
 * /taskManagement/api/taskStatus/{id}:
 *   post:
 *     summary: Update the status of a task
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [To Do, In Progress, Completed]
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       400:
 *         description: Validation error
 */
router.post('/taskManagement/api/taskStatus/:id', taskController.updateTaskStatus);


module.exports = router;


