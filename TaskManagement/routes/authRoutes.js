const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profilePicUploadDir = path.resolve(__dirname, '../uploads/employee_images');
if (!fs.existsSync(profilePicUploadDir)) fs.mkdirSync(profilePicUploadDir, { recursive: true });

// ✅ Serve uploads via public URL
router.use('/uploads/employee_images', express.static(profilePicUploadDir));

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, profilePicUploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

//registerSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUser:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *         - designation
 *         - phone
 *         - joiningDate
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: secret123
 *         role:
 *           type: string
 *           example: Admin
 *         designation:
 *           type: string
 *           example: Software Engineer
 *         phone:
 *           type: string
 *           example: "017XXXXXXXX"
 *         joiningDate:
 *           type: string
 *           format: date
 *           example: 2025-01-01
 */

//UpdateRegisterInfoSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateUser:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - role
 *         - designation
 *         - phone
 *         - joiningDate
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Jane Smith
 *         role:
 *           type: string
 *           example: Manager
 *         designation:
 *           type: string
 *           example: Team Lead
 *         phone:
 *           type: string
 *           example: "018XXXXXXXX"
 *         joiningDate:
 *           type: string
 *           format: date
 *           example: 2024-12-15
 */

//LogInSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: secret123
 */

//DeleteUserSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     DeleteUser:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the user to delete
 *           example: 5
 */

//FindUserByIdsSchema
/**
 * @swagger
 * components:
 *   schemas:
 *     FindUsersByIds:
 *       type: object
 *       required:
 *         - ids
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: integer
 *             example: 1
 *           description: Array of user IDs to find
 *           example: [1, 2, 3]
 */


/**
 * @swagger
 * /taskManagement/api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               designation:
 *                 type: string
 *               phone:
 *                 type: string
 *               joiningDate:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/taskManagement/api/user/register', upload.single('image'), authController.registerUser);

/**
 * @swagger
 * /taskManagement/api/user/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post('/taskManagement/api/user/login', authController.loginUser);

/**
 * @swagger
 * /taskManagement/api/users/getAll:
 *   get:
 *     summary: Get all active users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of users
 */
router.get('/taskManagement/api/users/getAll', authController.getAllUsers);

/**
 * @swagger
 * /taskManagement/api/user/update:
 *   post:
 *     summary: Update a user
 *     tags: [User]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *               designation:
 *                 type: string
 *               phone:
 *                 type: string
 *               joiningDate:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.post('/taskManagement/api/user/update', upload.single('image'), authController.updateUser);

/**
 * @swagger
 * /taskManagement/api/user/delete:
 *   post:
 *     summary: Delete a user by ID
 *     tags: [User]
 *     requestBody:
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
 *         description: User deleted successfully
 */
router.post('/taskManagement/api/user/delete', authController.deleteUser);

/**
 * @swagger
 * /taskManagement/api/makeAdmin/{id}:
 *   post:
 *     summary: Promote a user to Admin
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User promoted to Admin
 */
router.post('/taskManagement/api/makeAdmin/:id', authController.makeAdminFromGeneralUser);

/**
 * @swagger
 * /taskManagement/api/user/find/{id}:
 *   get:
 *     summary: Find a user by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 */
router.get('/taskManagement/api/user/find/:id', authController.findUserById);

/**
 * @swagger
 * /taskManagement/api/user/find-many:
 *   post:
 *     summary: Find multiple users by IDs
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: List of users
 */
router.post('/taskManagement/api/user/find-many', authController.findUsersByIds);

/**
 * @swagger
 * /taskManagement/api/users/getAllWithDeactivate:
 *   get:
 *     summary: Get all users (active and deactivated)
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */
router.get('/taskManagement/api/users/getAllWithDeactivate', authController.getAllUsersWithDeactivate);

/**
 * @swagger
 * /taskManagement/api/users/getAllWithOutImage:
 *   get:
 *     summary: Get all users without images
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Users fetched successfully without images
 */
router.get('/taskManagement/api/users/getAllWithOutImage', authController.getAllUsersWithOutImage);

/**
 * @swagger
 * /taskManagement/api/users/deactivate/{id}:
 *   post:
 *     summary: Update user's deactivate status
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deactivate
 *             properties:
 *               deactivate:
 *                 type: integer
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: User deactivate status updated
 */
router.post('/taskManagement/api/users/deactivate/:id', authController.updateDeactivateStatus);


module.exports = router;
