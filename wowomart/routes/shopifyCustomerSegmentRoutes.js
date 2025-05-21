const express = require('express');
const {
    getCustomerInfo,
    listCustomers,
} = require('../controller/shopifyCustomerController');

const {
    updateTags,
    createDiscount,
    createDiscountForSegment,
    getAllSegmentDiscounts,
    getSegmentDiscountById,
    getCouponsByTag,
    deleteDiscountController,
    createFixedAmountDiscount,
    createFixedAmountDiscountForSegment
} = require('../controller/shopifyDiscountController');

const router = express.Router();

router.post('/wowomart/api/shopify/update', updateTags);
router.post('/wowomart/api/shopify/segment-discount', createDiscountForSegment);
router.post('/wowomart/api/shopify/create-discount', createDiscount);
router.post('/wowomart/api/shopify/create-FixedAmount-segment-discount', createFixedAmountDiscountForSegment);
router.get('/wowomart/api/shopify/customer/:customerId', getCustomerInfo);
router.get('/wowomart/api/shopify/customers', listCustomers);
// GET all segment discounts
router.get('/wowomart/api/shopify/segment-discounts', getAllSegmentDiscounts);

// GET a specific segment discount by ID
router.get('/wowomart/api/shopify/segment-discounts/:id', getSegmentDiscountById);

router.get('/wowomart/api/shopify/coupons-by-tag', getCouponsByTag);
router.post('/wowomart/api/shopify/discount/delete', deleteDiscountController);


module.exports = router;

