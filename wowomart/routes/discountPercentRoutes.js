const express = require('express');
const router = express.Router();
const discountController = require('../controller/discountPercentController');


router.post('/wowomart/api/discountPercent/create', discountController.createDiscount);
router.get('/wowomart/api/allDiscountPercent', discountController.getAllDiscounts);
router.get('/wowomart/api/discountPercent/:id', discountController.getDiscountById);
router.put('/wowomart/api/discountPercent/update/:id', discountController.updateDiscountById);
router.delete('/wowomart/api/discountPercent/delete/:id', discountController.deleteDiscountById);
router.post('/wowomart/api/discountPercent/delete/:id', discountController.deleteDiscountById);


module.exports = router;
