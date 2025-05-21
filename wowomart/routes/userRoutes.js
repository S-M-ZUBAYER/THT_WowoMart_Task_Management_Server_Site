const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/wowomart/api/shopify/register", userController.register);
router.post("/wowomart/api/shopify/login", userController.login);
router.put("/wowomart/api/shopify/makeAdmin/:email", userController.makeAdmin);
// router.get('/users', authenticateToken, userController.getAllUsers);
// router.get('/users/:id', authenticateToken, userController.getUserById);
router.get('/wowomart/api/shopify/users', userController.getWowomartAllUsers);
router.get('/wowomart/api/shopify/users/:id', userController.getWowomartUserById);

module.exports = router;
