const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/taskManagement/api/register', authController.registerUser);
router.post('/taskManagement/api/login', authController.loginUser);
router.put('/taskManagement/api/update', authController.updateUser);
router.delete('/taskManagement/api/delete', authController.deleteUser);
router.get('/taskManagement/api/find/:id', authController.findUserById);
router.post('/taskManagement/api/find-many', authController.findUsersByIds);


module.exports = router;
