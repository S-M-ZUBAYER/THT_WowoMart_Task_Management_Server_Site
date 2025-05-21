const express = require('express');
const router = express.Router();
const controller = require('../controller/couponManagementController');

router.get('/wowomart/api/allCoupon', controller.getAllCoupons);
router.get('/wowomart/api/coupon/:id', controller.getCouponById);
router.post('/wowomart/api/coupon/create', controller.createCoupon);
router.put('/wowomart/api/coupon/update/:id', controller.updateCoupon);
router.delete('/wowomart/api/coupon/delete/:id', controller.deleteCoupon);

module.exports = router;
