const express = require('express');
const router = express.Router();
const controller = require('../controller/bugProjectController');



//✅ createBugProjectSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBugProject:
 *       type: object
 *       required:
 *         - bugProjectName
 *       properties:
 *         bugProjectName:
 *           type: string
 *           example: Inventory Management Bugs
 */

//✅ updateBugProjectSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateBugProject:
 *       type: object
 *       required:
 *         - bugProjectName
 *       properties:
 *         bugProjectName:
 *           type: string
 *           example: User Portal Bug Fixes
 */


/**
 * @swagger
 * /taskManagement/api/projectBug/create:
 *   post:
 *     summary: Create a new bug project
 *     tags: [ProjectBug]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bugProjectName
 *             properties:
 *               bugProjectName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 */
router.post('/taskManagement/api/projectBug/create', controller.create);

/**
 * @swagger
 * /taskManagement/api/projectBug/projectName/getAll:
 *   get:
 *     summary: Get all bug projects
 *     tags: [ProjectBug]
 *     responses:
 *       200:
 *         description: All projects bug
 */
router.get('/taskManagement/api/projectBug/projectName/getAll', controller.getAll);

/**
 * @swagger
 * /taskManagement/api/projectBug/with-bugs/getAll:
 *   get:
 *     summary: Get all bug projects with their related bugs
 *     tags: [ProjectBug]
 *     responses:
 *       200:
 *         description: Bug projects with related bugs fetched successfully
 */
router.get('/taskManagement/api/projectBug/with-bugs/getAll', controller.getAllWithBugs);

/**
 * @swagger
 * /taskManagement/api/projectBug/with-bugs/getById/{id}:
 *   get:
 *     summary: Get a bug project with its related bugs by project ID
 *     tags: [ProjectBug]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Bug project with related bugs fetched successfully
 *       404:
 *         description: Bug project not found
 */
router.get('/taskManagement/api/projectBug/with-bugs/getById/:id', controller.getProjectWithBugsById);

/**
 * @swagger
 * /taskManagement/api/projectBug/{id}:
 *   post:
 *     summary: Update a bug project's name by ID
 *     tags: [ProjectBug]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bugProjectName
 *             properties:
 *               bugProjectName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project name updated
 */
router.post('/taskManagement/api/projectBug/:id', controller.updateProjectName);

/**
 * @swagger
 * /taskManagement/api/projectBug/deleteProjectNameWithAllBug:
 *   post:
 *     summary: Delete a bug project and all its related bugs
 *     tags: [ProjectBug]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Project and related bugs deleted successfully
 */
router.post('/taskManagement/api/projectBug/deleteProjectNameWithAllBug', controller.deleteProjectAndBugs);


router.post('/taskManagement/api/projectBug/create', controller.create);
router.get('/taskManagement/api/projectBug/projectName/getAll', controller.getAll);
router.get('/taskManagement/api/projectBug/with-bugs/getAll', controller.getAllWithBugs);
router.get('/taskManagement/api/projectBug/with-bugs/getById/:id', controller.getProjectWithBugsById);
router.post('/taskManagement/api/projectBug/:id', controller.updateProjectName);
router.post('/taskManagement/api/projectBug/deleteProjectNameWithAllBug', controller.deleteProjectAndBugs);

module.exports = router;
