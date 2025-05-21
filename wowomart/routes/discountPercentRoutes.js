const express = require('express');
const router = express.Router();
const discountController = require('../controller/discountPercentController');

// Create
router.post('/wowomart/api/discountPercent/create', discountController.createDiscount);

// Get All
router.get('/wowomart/api/allDiscountPercent', discountController.getAllDiscounts);

// Get by ID
router.get('/wowomart/api/discountPercent/:id', discountController.getDiscountById);

// Update by ID
router.put('/wowomart/api/discountPercent/update/:id', discountController.updateDiscountById);

// Delete by ID
router.delete('/wowomart/api/discountPercent/delete/:id', discountController.deleteDiscountById);

// Call Post request Delete by ID 
router.post('/wowomart/api/discountPercent/delete/:id', discountController.deleteDiscountById);


module.exports = router;
