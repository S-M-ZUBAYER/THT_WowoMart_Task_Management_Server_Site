const express = require('express');
const router = express.Router();
const controller = require('../controller/couponUserInfoController');

router.get('/wowomart/api/allUser', controller.getAllUsers);
router.get('/wowomart/api/user/:id', controller.getUserById);
router.post('/wowomart/api/user/create', controller.createUser);
router.put('/wowomart/api/user/update/:id', controller.updateUser);
router.delete('/wowomart/api/user/delete/:id', controller.deleteUser);

module.exports = router;
