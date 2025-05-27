const express = require('express');
const router = express.Router();
const segmentController = require('../controller/segmentDiscountController');


router.post('/wowomart/api/segmentDiscount/create', segmentController.createSegment);
router.get('/wowomart/api/allSegmentDiscount', segmentController.getAllSegments);
router.get('/wowomart/api/segmentDiscount/:id', segmentController.getSegmentById);
router.put('/wowomart/api/segmentDiscount/update/:id', segmentController.updateSegmentById);
router.delete('/wowomart/api/segmentDiscount/delete/:id', segmentController.deleteSegmentById);

module.exports = router;
