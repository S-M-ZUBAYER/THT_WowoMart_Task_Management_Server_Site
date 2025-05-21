// routes/couponUserList.routes.js
const express = require('express');
const router = express.Router();
const couponController = require('../controller/couponUserListController');
const authenticateToken = require('../middleware/jwt');

// Routes
router.post('/wowomart/api/shopify/couponUserList/create', couponController.createCoupon);
// router.get('/shopify/allCouponUserList', authenticateToken, couponController.getAllCoupons);
router.get('/wowomart/api/shopify/allCouponUserList', couponController.getAllCoupons);
router.get('/wowomart/api/shopify/couponUserList/:id', couponController.getCouponById);
router.put('/wowomart/api/shopify/couponUserList/update/:id', couponController.updateCoupon);
router.delete('/wowomart/api/shopify/couponUserList/:id', couponController.deleteCoupon);
router.post('/wowomart/api/shopify/deleteAndUpdate', couponController.removeWithUpdate);

module.exports = router;
