const express = require('express');
const router = express.Router();
const { getShopifyCustomerSegment, getShopifyCustomerSegmentByEmail } = require('../controller/customerSegmentController');

router.get('/shopify/customer-segment/:id', getShopifyCustomerSegment);
router.get('/shopify/customer-segment-email/:email', getShopifyCustomerSegmentByEmail);

module.exports = router;
