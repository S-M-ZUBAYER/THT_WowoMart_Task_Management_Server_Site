const express = require("express");
const { getAllShopifyProducts } = require("../controller/shopifyProductsController");

const router = express.Router();

router.get("/wowomart/api/shopify/products", getAllShopifyProducts);

module.exports = router;
