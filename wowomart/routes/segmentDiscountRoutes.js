const express = require('express');
const router = express.Router();
const segmentController = require('../controller/segmentDiscountController');

// Create
router.post('/wowomart/api/segmentDiscount/create', segmentController.createSegment);

// Get All
router.get('/wowomart/api/allSegmentDiscount', segmentController.getAllSegments);

// Get By ID
router.get('/wowomart/api/segmentDiscount/:id', segmentController.getSegmentById);

// Update By ID
router.put('/wowomart/api/segmentDiscount/update/:id', segmentController.updateSegmentById);

// Delete By ID
router.delete('/wowomart/api/segmentDiscount/delete/:id', segmentController.deleteSegmentById);

module.exports = router;
