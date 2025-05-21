// const { fetchVendors, fetchProducts } = require("../model/shopifyProductsModel");

// // Utility function
// const handleError = (res, error, message) => {
//     console.error(message, error.message);
//     res.status(500).json({ error: message });
// };

// // Controller to fetch all Shopify vendor products
// const getAllShopifyProducts = async (req, res) => {
//     try {
//         const vendors = await fetchVendors();

//         const productsByVendor = await Promise.all(
//             vendors.map((vendor) =>
//                 fetchProducts(vendor).catch((error) => {
//                     console.error(`Failed to fetch products for vendor ${vendor}:`, error.message);
//                     return [];
//                 })
//             )
//         );

//         const allProducts = productsByVendor.flat();

//         res.status(200).json({
//             status: 200,
//             success: true,
//             message: "Shopify vendor products fetched successfully",
//             data: allProducts,
//         });
//     } catch (error) {
//         handleError(res, error, "Error fetching Shopify products");
//     }
// };

// module.exports = {
//     getAllShopifyProducts,
// };


const { fetchVendors, fetchProducts } = require("../model/shopifyProductsModel");

// Utility function for error handling
const handleError = (res, error, message) => {
    console.error(`${message}:`, error.message);
    res.status(500).json({
        status: 500,
        success: false,
        message,
        error: error.message,
    });
};

// Controller to fetch all Shopify vendor products
const getAllShopifyProducts = async (req, res) => {
    try {
        const vendors = await fetchVendors();

        const productsByVendor = await Promise.all(
            vendors.map(async (vendor) => {
                try {
                    return await fetchProducts(vendor);
                } catch (error) {
                    console.error(`Failed to fetch products for vendor ${vendor}:`, error.message);
                    return [];
                }
            })
        );

        const allProducts = productsByVendor.flat();

        res.status(200).json({
            status: 200,
            success: true,
            message: "Shopify vendor products fetched successfully",
            data: allProducts,
        });
    } catch (error) {
        handleError(res, error, "Error fetching Shopify products");
    }
};

module.exports = {
    getAllShopifyProducts,
};
