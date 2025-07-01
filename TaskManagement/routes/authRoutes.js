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

router.post('/taskManagement/api/user/register', upload.single('image'), authController.registerUser);
router.post('/taskManagement/api/user/update', upload.single('image'), authController.updateUser);
router.post('/taskManagement/api/user/login', authController.loginUser);
router.post('/taskManagement/api/user/delete', authController.deleteUser);
router.post('/taskManagement/api/makeAdmin/:id', authController.makeAdminFromGeneralUser);
router.get('/taskManagement/api/user/find/:id', authController.findUserById);
router.post('/taskManagement/api/user/find-many', authController.findUsersByIds);
router.get('/taskManagement/api/users/getAll', authController.getAllUsers);
router.get('/taskManagement/api/users/getAllWithDeactivate', authController.getAllUsersWithDeactivate);
router.get('/taskManagement/api/users/getAllWithOutImage', authController.getAllUsersWithOutImage);
router.post('/taskManagement/api/users/deactivate/:id', authController.updateDeactivateStatus);


module.exports = router;
