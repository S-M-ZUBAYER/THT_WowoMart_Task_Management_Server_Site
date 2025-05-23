// controllers/discountController.js
const axios = require('axios');
const dotenv = require('dotenv');
const wowomartPool = require('../../wowomartDb/config/db');

dotenv.config();

const SHOPIFY_STORE = "1f9df1-0f.myshopify.com";
const API_VERSION_REST = "2025-01";
const API_VERSION_GRAPHQL = "2024-10";
const API_TOKEN = process.env.API_TOKEN;
const GRAPHQL_URL = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_GRAPHQL}/graphql.json`;
const shopifyDiscountModel = require("../model/shopifyDiscountModel");
const { deleteShopifyDiscount } = require('../model/shopifyCouponDeleteModel');

// const createDiscount = async (req, res) => {
//     const { title, percentage, minimumAmount, minimumItem, code, expireDate, segmentQuery, tag = null, segmentId } = req.body;

//     if (!title || !percentage || !code) {
//         return res.status(400).json({ error: "Missing title, percentage, or code." });
//     }

//     try {
//         let minimumRequirement = null;
//         if (minimumItem) {
//             minimumRequirement = { quantity: { greaterThanOrEqualToQuantity: String(minimumItem) } };
//         } else if (minimumAmount) {
//             minimumRequirement = { subtotal: { greaterThanOrEqualToSubtotal: String(minimumAmount) } };
//         }

//         const mutation = `
//             mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
//                 discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
//                     codeDiscountNode {
//                         id
//                         codeDiscount {
//                             ... on DiscountCodeBasic {
//                                 title
//                                 codes(first: 10) {
//                                     nodes { code }
//                                 }
//                             }
//                         }
//                     }
//                     userErrors { field message }
//                 }
//             }
//         `;

//         const payload = {
//             query: mutation,
//             variables: {
//                 basicCodeDiscount: {
//                     title,
//                     code: code.replace(/\s+/g, "_").toUpperCase(),
//                     customerGets: {
//                         value: { percentage: percentage / 100 },
//                         items: { all: true }
//                     },
//                     appliesOncePerCustomer: true,
//                     startsAt: new Date().toISOString(),
//                     endsAt: expireDate,
//                     usageLimit: 1,
//                     customerSelection: { all: true },
//                     ...(minimumRequirement && { minimumRequirement })
//                 }
//             }
//         };

//         const response = await axios.post(GRAPHQL_URL, payload, {
//             headers: {
//                 "X-Shopify-Access-Token": API_TOKEN,
//                 "Content-Type": "application/json"
//             }
//         });

//         const discountCreation = response.data.data.discountCodeBasicCreate;

//         if (discountCreation.userErrors.length > 0) {
//             return res.status(400).json({ error: "Discount creation failed", details: discountCreation.userErrors });
//         }

//         const discountNode = discountCreation.codeDiscountNode;
//         const discountId = discountNode.id;
//         const savedCode = discountNode.codeDiscount.codes.nodes[0]?.code || code;

//         // Format expireDate to SQL format
//         let formattedExpireDate = null;
//         if (expireDate) {
//             const dateObj = new Date(expireDate);
//             const year = dateObj.getFullYear();
//             const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//             const day = String(dateObj.getDate()).padStart(2, '0');
//             const hours = String(dateObj.getHours()).padStart(2, '0');
//             const minutes = String(dateObj.getMinutes()).padStart(2, '0');
//             const seconds = String(dateObj.getSeconds()).padStart(2, '0');
//             formattedExpireDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//         }

//         wowomartPool.getConnection((err, connection) => {
//             if (err) {
//                 console.error("Error getting database connection:", err);
//                 return res.status(500).json({ error: "Failed to connect to database", details: err.message });
//             }

//             const insertQuery = `
//                 INSERT INTO wowomart_segment_discount_create 
//                 (title, percentage, segmentQuery, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//             `;

//             const values = [
//                 title || null,
//                 percentage || null,
//                 segmentQuery || null,
//                 minimumAmount || null,
//                 minimumItem || null,
//                 savedCode || null,
//                 formattedExpireDate || null,
//                 tag || null,
//                 segmentId || null,
//                 discountId || null
//             ];

//             connection.query(insertQuery, values, (queryErr, results) => {
//                 connection.release(); // always release the connection

//                 if (queryErr) {
//                     console.error("Error inserting discount into database:", queryErr);
//                     return res.status(500).json({ error: "Failed to save discount", details: queryErr.message });
//                 }

//                 res.json({ success: true, discount: discountNode });
//             });
//         });

//     } catch (error) {
//         console.error("Error creating discount:", error);
//         return res.status(500).json({ error: "Internal server error", details: error.message });
//     }
// };


const createDiscount = async (req, res) => {
    const { title, percentage, minimumAmount, minimumItem, code, expireDate, segmentQuery, tag = null, segmentId } = req.body;

    if (!title || !percentage || !code) {
        return res.status(400).json({ error: "Missing title, percentage, or code." });
    }

    try {
        let minimumRequirement = null;
        if (minimumItem) {
            minimumRequirement = { quantity: { greaterThanOrEqualToQuantity: String(minimumItem) } };
        } else if (minimumAmount) {
            minimumRequirement = { subtotal: { greaterThanOrEqualToSubtotal: String(minimumAmount) } };
        }

        const mutation = `
            mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
                discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
                    codeDiscountNode {
                        id
                        codeDiscount {
                            ... on DiscountCodeBasic {
                                title
                                codes(first: 10) {
                                    nodes { code }
                                }
                            }
                        }
                    }
                    userErrors { field message }
                }
            }
        `;

        const payload = {
            query: mutation,
            variables: {
                basicCodeDiscount: {
                    title,
                    code: code.replace(/\s+/g, "_").toUpperCase(),
                    customerGets: {
                        value: { percentage: percentage / 100 },
                        items: { all: true }
                    },
                    appliesOncePerCustomer: true,
                    startsAt: new Date().toISOString(),
                    endsAt: expireDate,
                    usageLimit: 1,
                    customerSelection: { all: true },
                    ...(minimumRequirement && { minimumRequirement })
                }
            }
        };

        const response = await axios.post(GRAPHQL_URL, payload, {
            headers: {
                "X-Shopify-Access-Token": API_TOKEN,
                "Content-Type": "application/json"
            }
        });

        const discountCreation = response.data.data.discountCodeBasicCreate;

        if (discountCreation.userErrors.length > 0) {
            return res.status(400).json({ error: "Discount creation failed", details: discountCreation.userErrors });
        }

        const discountNode = discountCreation.codeDiscountNode;
        const discountId = discountNode.id;
        const savedCode = discountNode.codeDiscount.codes.nodes[0]?.code || code;

        // Format expireDate to SQL format
        let formattedExpireDate = null;
        if (expireDate) {
            const dateObj = new Date(expireDate);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = String(dateObj.getSeconds()).padStart(2, '0');
            formattedExpireDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        // ✅ Using mysql2/promise pool
        const connection = await wowomartPool.getConnection();
        try {
            const insertQuery = `
                INSERT INTO wowomart_segment_discount_create 
                (title, percentage, segmentQuery, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                title || null,
                percentage || null,
                segmentQuery || null,
                minimumAmount || null,
                minimumItem || null,
                savedCode || null,
                formattedExpireDate || null,
                tag || null,
                segmentId || null,
                discountId || null
            ];

            await connection.query(insertQuery, values);
            res.json({ success: true, discount: discountNode });
        } finally {
            connection.release(); // Make sure to release the connection
        }

    } catch (error) {
        console.error("Error creating discount:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
};


// const createFixedAmountDiscount = async (req, res) => {
//     const {
//         title,
//         percentage,
//         fixedAmount,
//         minimumAmount,
//         minimumItem,
//         code,
//         expireDate,
//         segmentQuery,
//         tag = null,
//         segmentId,
//     } = req.body;

//     if (!title || !code || (!percentage && !fixedAmount)) {
//         return res
//             .status(400)
//             .json({ error: "Missing title, code, or discount value (percentage or fixedAmount)." });
//     }

//     try {
//         // Build minimum requirement object
//         let minimumRequirement = null;
//         if (minimumItem) {
//             minimumRequirement = {
//                 quantity: { greaterThanOrEqualToQuantity: String(minimumItem) },
//             };
//         } else if (minimumAmount) {
//             minimumRequirement = {
//                 subtotal: { greaterThanOrEqualToSubtotal: String(minimumAmount) },
//             };
//         }

//         // Build discount value
//         let customerGets = {
//             items: { all: true },
//         };

//         if (fixedAmount) {
//             customerGets.value = {
//                 fixedAmount: {
//                     amount: String(fixedAmount),
//                     appliesOnEachItem: false, // Change to true if needed
//                 },
//             };
//         } else if (percentage) {
//             customerGets.value = {
//                 percentage: percentage / 100,
//             };
//         }

//         const mutation = `
//         mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
//           discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
//             codeDiscountNode {
//               id
//               codeDiscount {
//                 ... on DiscountCodeBasic {
//                   title
//                   codes(first: 10) {
//                     nodes { code }
//                   }
//                 }
//               }
//             }
//             userErrors { field message }
//           }
//         }
//       `;

//         const payload = {
//             query: mutation,
//             variables: {
//                 basicCodeDiscount: {
//                     title,
//                     code: code.replace(/\s+/g, "_").toUpperCase(),
//                     customerGets,
//                     appliesOncePerCustomer: true,
//                     startsAt: new Date().toISOString(),
//                     endsAt: expireDate,
//                     usageLimit: 1,
//                     customerSelection: { all: true },
//                     ...(minimumRequirement && { minimumRequirement }),
//                 },
//             },
//         };

//         const response = await axios.post(GRAPHQL_URL, payload, {
//             headers: {
//                 "X-Shopify-Access-Token": API_TOKEN,
//                 "Content-Type": "application/json",
//             },
//         });

//         const discountCreation = response.data.data.discountCodeBasicCreate;

//         if (discountCreation.userErrors.length > 0) {
//             return res
//                 .status(400)
//                 .json({ error: "Discount creation failed", details: discountCreation.userErrors });
//         }

//         const discountNode = discountCreation.codeDiscountNode;
//         const discountId = discountNode.id;
//         const savedCode = discountNode.codeDiscount.codes.nodes[0]?.code || code;

//         // Format expireDate to SQL format
//         let formattedExpireDate = null;
//         if (expireDate) {
//             const dateObj = new Date(expireDate);
//             const year = dateObj.getFullYear();
//             const month = String(dateObj.getMonth() + 1).padStart(2, "0");
//             const day = String(dateObj.getDate()).padStart(2, "0");
//             const hours = String(dateObj.getHours()).padStart(2, "0");
//             const minutes = String(dateObj.getMinutes()).padStart(2, "0");
//             const seconds = String(dateObj.getSeconds()).padStart(2, "0");
//             formattedExpireDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//         }

//         // Insert into database
//         wowomartPool.getConnection((err, connection) => {
//             if (err) {
//                 console.error("Error getting database connection:", err);
//                 return res
//                     .status(500)
//                     .json({ error: "Failed to connect to database", details: err.message });
//             }

//             const insertQuery = `
//           INSERT INTO wowomart_segment_discount_create 
//           (title, percentage, fixedAmount, segmentQuery, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//             const values = [
//                 title || null,
//                 percentage || null,
//                 fixedAmount || null,
//                 segmentQuery || null,
//                 minimumAmount || null,
//                 minimumItem || null,
//                 savedCode || null,
//                 formattedExpireDate || null,
//                 tag || null,
//                 segmentId || null,
//                 discountId || null,
//             ];

//             connection.query(insertQuery, values, (queryErr, results) => {
//                 connection.release(); // always release the connection

//                 if (queryErr) {
//                     console.error("Error inserting discount into database:", queryErr);
//                     return res.status(500).json({ error: "Failed to save discount", details: queryErr.message });
//                 }

//                 res.json({ success: true, discount: discountNode });
//             });
//         });
//     } catch (error) {
//         console.error("Error creating discount:", error);
//         return res.status(500).json({ error: "Internal server error", details: error.message });
//     }
// };


// const createDiscountForSegment = async (req, res) => {
//     const { title, percentage, segmentQuery, discountEnd, code, expireDate, tag } = req.body;

//     if (!title || !percentage || !code || !expireDate) {
//         return res.status(400).json({ error: "Missing title, percentage, code, or expireDate." });
//     }

//     let Query = tag ? `customer_tags CONTAINS '${tag}'` : segmentQuery + discountEnd;

//     try {
//         const segmentMutation = `
//       mutation {
//         segmentCreate(name: \"${title} Segment\", query: \"${Query}\") {
//           segment { id name query }
//           userErrors { field message }
//         }
//       }
//     `;

//         const segmentResponse = await axios.post(GRAPHQL_URL, { query: segmentMutation }, {
//             headers: {
//                 "X-Shopify-Access-Token": API_TOKEN,
//                 "Content-Type": "application/json"
//             }
//         });

//         const segmentData = segmentResponse.data.data.segmentCreate;
//         if (segmentData.userErrors.length > 0) {
//             return res.status(400).json({ error: "Segment creation failed", details: segmentData.userErrors });
//         }

//         const segmentId = segmentData.segment.id;
//         const discountMutation = `
//       mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
//         discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
//           codeDiscountNode {
//             id
//             codeDiscount {
//               ... on DiscountCodeBasic {
//                 title
//                 codes(first: 10) { nodes { code } }
//               }
//             }
//           }
//           userErrors { field message }
//         }
//       }
//     `;

//         const payload = {
//             query: discountMutation,
//             variables: {
//                 basicCodeDiscount: {
//                     title,
//                     code: code.replace(/\s+/g, "_").toUpperCase(),
//                     customerGets: {
//                         value: { percentage: percentage / 100 },
//                         items: { all: true }
//                     },
//                     customerSelection: { customerSegments: { add: [segmentId] } },
//                     appliesOncePerCustomer: true,
//                     startsAt: new Date().toISOString(),
//                     endsAt: expireDate,
//                     usageLimit: 1
//                 }
//             }
//         };

//         const discountResponse = await axios.post(GRAPHQL_URL, payload, {
//             headers: {
//                 "X-Shopify-Access-Token": API_TOKEN,
//                 "Content-Type": "application/json"
//             }
//         });

//         const discountData = discountResponse.data.data.discountCodeBasicCreate;
//         if (discountData.userErrors.length > 0) {
//             return res.status(400).json({ error: "Discount creation failed", details: discountData.userErrors });
//         }

//         // ✅ Insert into database
//         const discountNode = discountData.codeDiscountNode;
//         const discountId = discountNode.id;
//         const savedCode = discountNode.codeDiscount.codes.nodes[0]?.code || code;

//         // Format expireDate
//         let formattedExpireDate = null;
//         if (expireDate) {
//             const dateObj = new Date(expireDate);
//             const year = dateObj.getFullYear();
//             const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//             const day = String(dateObj.getDate()).padStart(2, '0');
//             const hours = String(dateObj.getHours()).padStart(2, '0');
//             const minutes = String(dateObj.getMinutes()).padStart(2, '0');
//             const seconds = String(dateObj.getSeconds()).padStart(2, '0');
//             formattedExpireDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//         }

//         wowomartPool.getConnection((err, connection) => {
//             if (err) {
//                 console.error("Error getting connection:", err);
//                 return res.status(500).json({ error: "Failed to connect to database", details: err.message });
//             }

//             connection.query(
//                 `INSERT INTO wowomart_segment_discount_create 
//                 (title, percentage, segmentQuery, discountEnd, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId)
//                 VALUES (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?)`,
//                 [
//                     title || null,
//                     percentage || null,
//                     Query || null,    // Save the used segment query
//                     discountEnd,
//                     null,             // minimumAmount is null here
//                     null,             // minimumItem is null here
//                     savedCode || null,
//                     formattedExpireDate || null,
//                     tag || null,
//                     segmentId || null,
//                     discountId || null
//                 ],
//                 (queryErr, results) => {
//                     connection.release(); // Always release

//                     if (queryErr) {
//                         console.error("Error inserting discount:", queryErr);
//                         return res.status(500).json({ error: "Failed to create discount", details: queryErr.message });
//                     }

//                     res.json({ success: true, segment: segmentData.segment, discount: discountNode });
//                 }
//             );
//         });

//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ error: "Internal server error", details: error.response?.data || error.message });
//     }
// };

// const createFixedAmountDiscountForSegment = async (req, res) => {
//     const { title, percentage, fixedAmount, segmentQuery, discountEnd, code, expireDate, tag } = req.body;

//     if (!title || !code || !expireDate || (!percentage && !fixedAmount)) {
//         return res.status(400).json({ error: "Missing title, code, expireDate, and either percentage or fixedAmount." });
//     }

//     // Build customerGets based on the discount type
//     let customerGets = null;
//     if (percentage) {
//         customerGets = {
//             value: { percentage: percentage / 100 },
//             items: { all: true }
//         };
//     } else if (fixedAmount) {
//         customerGets = {
//             value: { amount: { amount: fixedAmount, currencyCode: "USD" } },
//             items: { all: true }
//         };
//     }

//     let Query = tag ? `customer_tags CONTAINS '${tag}'` : segmentQuery + discountEnd;

//     try {
//         const segmentMutation = `
//             mutation {
//                 segmentCreate(name: "${title} Segment", query: "${Query}") {
//                     segment { id name query }
//                     userErrors { field message }
//                 }
//             }
//         `;

//         const segmentResponse = await axios.post(GRAPHQL_URL, { query: segmentMutation }, {
//             headers: {
//                 "X-Shopify-Access-Token": API_TOKEN,
//                 "Content-Type": "application/json"
//             }
//         });

//         const segmentData = segmentResponse.data.data.segmentCreate;
//         if (segmentData.userErrors.length > 0) {
//             return res.status(400).json({ error: "Segment creation failed", details: segmentData.userErrors });
//         }

//         const segmentId = segmentData.segment.id;

//         const discountMutation = `
//             mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
//                 discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
//                     codeDiscountNode {
//                         id
//                         codeDiscount {
//                             ... on DiscountCodeBasic {
//                                 title
//                                 codes(first: 10) { nodes { code } }
//                             }
//                         }
//                     }
//                     userErrors { field message }
//                 }
//             }
//         `;

//         const payload = {
//             query: discountMutation,
//             variables: {
//                 basicCodeDiscount: {
//                     title,
//                     code: code.replace(/\s+/g, "_").toUpperCase(),
//                     customerGets,
//                     customerSelection: { customerSegments: { add: [segmentId] } },
//                     appliesOncePerCustomer: true,
//                     startsAt: new Date().toISOString(),
//                     endsAt: expireDate,
//                     usageLimit: 1
//                 }
//             }
//         };

//         const discountResponse = await axios.post(GRAPHQL_URL, payload, {
//             headers: {
//                 "X-Shopify-Access-Token": API_TOKEN,
//                 "Content-Type": "application/json"
//             }
//         });

//         const discountData = discountResponse.data.data.discountCodeBasicCreate;
//         if (discountData.userErrors.length > 0) {
//             return res.status(400).json({ error: "Discount creation failed", details: discountData.userErrors });
//         }

//         const discountNode = discountData.codeDiscountNode;
//         const discountId = discountNode.id;
//         const savedCode = discountNode.codeDiscount.codes.nodes[0]?.code || code;

//         // Format expireDate
//         let formattedExpireDate = null;
//         if (expireDate) {
//             const dateObj = new Date(expireDate);
//             const year = dateObj.getFullYear();
//             const month = String(dateObj.getMonth() + 1).padStart(2, '0');
//             const day = String(dateObj.getDate()).padStart(2, '0');
//             const hours = String(dateObj.getHours()).padStart(2, '0');
//             const minutes = String(dateObj.getMinutes()).padStart(2, '0');
//             const seconds = String(dateObj.getSeconds()).padStart(2, '0');
//             formattedExpireDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//         }

//         wowomartPool.getConnection((err, connection) => {
//             if (err) {
//                 console.error("Error getting connection:", err);
//                 return res.status(500).json({ error: "Failed to connect to database", details: err.message });
//             }

//             connection.query(
//                 `INSERT INTO wowomart_segment_discount_create 
//                 (title, percentage, fixedAmount, segmentQuery, discountEnd, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//                 [
//                     title || null,
//                     percentage || null,
//                     fixedAmount || null,
//                     Query || null,
//                     discountEnd,
//                     null, // minimumAmount
//                     null, // minimumItem
//                     savedCode || null,
//                     formattedExpireDate || null,
//                     tag || null,
//                     segmentId || null,
//                     discountId || null
//                 ],
//                 (queryErr, results) => {
//                     connection.release();

//                     if (queryErr) {
//                         console.error("Error inserting discount:", queryErr);
//                         return res.status(500).json({ error: "Failed to create discount", details: queryErr.message });
//                     }

//                     res.json({ success: true, segment: segmentData.segment, discount: discountNode });
//                 }
//             );
//         });

//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ error: "Internal server error", details: error.response?.data || error.message });
//     }
// };

const createFixedAmountDiscount = async (req, res) => {
    const {
        title,
        percentage,
        fixedAmount,
        minimumAmount,
        minimumItem,
        code,
        expireDate,
        segmentQuery,
        tag = null,
        segmentId,
    } = req.body;

    if (!title || !code || (!percentage && !fixedAmount)) {
        return res.status(400).json({
            error: "Missing title, code, or discount value (percentage or fixedAmount)."
        });
    }

    try {
        let minimumRequirement = null;
        if (minimumItem) {
            minimumRequirement = {
                quantity: { greaterThanOrEqualToQuantity: String(minimumItem) },
            };
        } else if (minimumAmount) {
            minimumRequirement = {
                subtotal: { greaterThanOrEqualToSubtotal: String(minimumAmount) },
            };
        }

        let customerGets = { items: { all: true } };

        if (fixedAmount) {
            customerGets.value = {
                fixedAmount: {
                    amount: String(fixedAmount),
                    appliesOnEachItem: false,
                },
            };
        } else if (percentage) {
            customerGets.value = {
                percentage: percentage / 100,
            };
        }

        const mutation = `
            mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
                discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
                    codeDiscountNode {
                        id
                        codeDiscount {
                            ... on DiscountCodeBasic {
                                title
                                codes(first: 10) {
                                    nodes { code }
                                }
                            }
                        }
                    }
                    userErrors { field message }
                }
            }
        `;

        const payload = {
            query: mutation,
            variables: {
                basicCodeDiscount: {
                    title,
                    code: code.replace(/\s+/g, "_").toUpperCase(),
                    customerGets,
                    appliesOncePerCustomer: true,
                    startsAt: new Date().toISOString(),
                    endsAt: expireDate,
                    usageLimit: 1,
                    customerSelection: { all: true },
                    ...(minimumRequirement && { minimumRequirement }),
                },
            },
        };

        const response = await axios.post(GRAPHQL_URL, payload, {
            headers: {
                "X-Shopify-Access-Token": API_TOKEN,
                "Content-Type": "application/json",
            },
        });

        const discountCreation = response.data.data.discountCodeBasicCreate;

        if (discountCreation.userErrors.length > 0) {
            return res.status(400).json({
                error: "Discount creation failed",
                details: discountCreation.userErrors,
            });
        }

        const discountNode = discountCreation.codeDiscountNode;
        const discountId = discountNode.id;
        const savedCode = discountNode.codeDiscount.codes.nodes[0]?.code || code;

        // Format expireDate to SQL datetime
        let formattedExpireDate = null;
        if (expireDate) {
            const d = new Date(expireDate);
            formattedExpireDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
        }

        // ✅ Use mysql2 pool.promise() and await
        const connection = wowomartPool.promise();
        const insertQuery = `
            INSERT INTO wowomart_segment_discount_create 
            (title, percentage, fixedAmount, segmentQuery, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            title || null,
            percentage || null,
            fixedAmount || null,
            segmentQuery || null,
            minimumAmount || null,
            minimumItem || null,
            savedCode || null,
            formattedExpireDate || null,
            tag || null,
            segmentId || null,
            discountId || null,
        ];

        await connection.query(insertQuery, values);

        return res.json({ success: true, discount: discountNode });

    } catch (error) {
        console.error("Error creating discount:", error);
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
};


const createDiscountForSegment = async (req, res) => {
    const { title, percentage, segmentQuery, discountEnd, code, expireDate, tag } = req.body;

    if (!title || !percentage || !code || !expireDate) {
        return res.status(400).json({ error: "Missing title, percentage, code, or expireDate." });
    }

    let Query = tag ? `customer_tags CONTAINS '${tag}'` : segmentQuery + discountEnd;

    try {
        // 1. Create segment
        const segmentMutation = `
            mutation {
                segmentCreate(name: "${title} Segment", query: "${Query}") {
                    segment { id name query }
                    userErrors { field message }
                }
            }
        `;

        const segmentResponse = await axios.post(GRAPHQL_URL, { query: segmentMutation }, {
            headers: {
                "X-Shopify-Access-Token": API_TOKEN,
                "Content-Type": "application/json"
            }
        });

        const segmentData = segmentResponse.data.data.segmentCreate;
        if (segmentData.userErrors.length > 0) {
            return res.status(400).json({ error: "Segment creation failed", details: segmentData.userErrors });
        }

        const segmentId = segmentData.segment.id;

        // 2. Create discount
        const discountMutation = `
            mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
                discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
                    codeDiscountNode {
                        id
                        codeDiscount {
                            ... on DiscountCodeBasic {
                                title
                                codes(first: 10) { nodes { code } }
                            }
                        }
                    }
                    userErrors { field message }
                }
            }
        `;

        const payload = {
            query: discountMutation,
            variables: {
                basicCodeDiscount: {
                    title,
                    code: code.replace(/\s+/g, "_").toUpperCase(),
                    customerGets: {
                        value: { percentage: percentage / 100 },
                        items: { all: true }
                    },
                    customerSelection: { customerSegments: { add: [segmentId] } },
                    appliesOncePerCustomer: true,
                    startsAt: new Date().toISOString(),
                    endsAt: expireDate,
                    usageLimit: 1
                }
            }
        };

        const discountResponse = await axios.post(GRAPHQL_URL, payload, {
            headers: {
                "X-Shopify-Access-Token": API_TOKEN,
                "Content-Type": "application/json"
            }
        });

        const discountData = discountResponse.data.data.discountCodeBasicCreate;
        if (discountData.userErrors.length > 0) {
            return res.status(400).json({ error: "Discount creation failed", details: discountData.userErrors });
        }

        const discountNode = discountData.codeDiscountNode;
        const discountId = discountNode.id;
        const savedCode = discountNode.codeDiscount.codes.nodes[0]?.code || code;

        // 3. Format expireDate
        let formattedExpireDate = null;
        if (expireDate) {
            const dateObj = new Date(expireDate);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = String(dateObj.getSeconds()).padStart(2, '0');
            formattedExpireDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        // 4. Use mysql2/promise to insert data
        const connection = await wowomartPool.getConnection();
        try {
            const insertQuery = `
                INSERT INTO wowomart_segment_discount_create 
                (title, percentage, segmentQuery, discountEnd, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const insertValues = [
                title || null,
                percentage || null,
                Query || null,
                discountEnd || null,
                null,  // minimumAmount
                null,  // minimumItem
                savedCode || null,
                formattedExpireDate || null,
                tag || null,
                segmentId || null,
                discountId || null
            ];

            await connection.query(insertQuery, insertValues);
            res.json({ success: true, segment: segmentData.segment, discount: discountNode });

        } catch (queryErr) {
            console.error("Insert error:", queryErr);
            res.status(500).json({ error: "Database insert failed", details: queryErr.message });
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "Internal server error", details: error.response?.data || error.message });
    }
};


const createFixedAmountDiscountForSegment = async (req, res) => {
    const { title, percentage, fixedAmount, segmentQuery, discountEnd, code, expireDate, tag } = req.body;

    if (!title || !code || !expireDate || (!percentage && !fixedAmount)) {
        return res.status(400).json({ error: "Missing title, code, expireDate, and either percentage or fixedAmount." });
    }

    let customerGets = null;
    if (percentage) {
        customerGets = {
            value: { percentage: percentage / 100 },
            items: { all: true }
        };
    } else if (fixedAmount) {
        customerGets = {
            value: { amount: { amount: fixedAmount, currencyCode: "USD" } },
            items: { all: true }
        };
    }

    let Query = tag ? `customer_tags CONTAINS '${tag}'` : segmentQuery + discountEnd;

    try {
        // Segment creation
        const segmentMutation = `
            mutation {
                segmentCreate(name: "${title} Segment", query: "${Query}") {
                    segment { id name query }
                    userErrors { field message }
                }
            }
        `;
        const segmentResponse = await axios.post(GRAPHQL_URL, { query: segmentMutation }, {
            headers: {
                "X-Shopify-Access-Token": API_TOKEN,
                "Content-Type": "application/json"
            }
        });

        const segmentData = segmentResponse.data.data.segmentCreate;
        if (segmentData.userErrors.length > 0) {
            return res.status(400).json({ error: "Segment creation failed", details: segmentData.userErrors });
        }

        const segmentId = segmentData.segment.id;

        // Discount creation
        const discountMutation = `
            mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
                discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
                    codeDiscountNode {
                        id
                        codeDiscount {
                            ... on DiscountCodeBasic {
                                title
                                codes(first: 10) { nodes { code } }
                            }
                        }
                    }
                    userErrors { field message }
                }
            }
        `;

        const payload = {
            query: discountMutation,
            variables: {
                basicCodeDiscount: {
                    title,
                    code: code.replace(/\s+/g, "_").toUpperCase(),
                    customerGets,
                    customerSelection: { customerSegments: { add: [segmentId] } },
                    appliesOncePerCustomer: true,
                    startsAt: new Date().toISOString(),
                    endsAt: expireDate,
                    usageLimit: 1
                }
            }
        };

        const discountResponse = await axios.post(GRAPHQL_URL, payload, {
            headers: {
                "X-Shopify-Access-Token": API_TOKEN,
                "Content-Type": "application/json"
            }
        });

        const discountData = discountResponse.data.data.discountCodeBasicCreate;
        if (discountData.userErrors.length > 0) {
            return res.status(400).json({ error: "Discount creation failed", details: discountData.userErrors });
        }

        const discountNode = discountData.codeDiscountNode;
        const discountId = discountNode.id;
        const savedCode = discountNode.codeDiscount.codes.nodes[0]?.code || code;

        const dateObj = new Date(expireDate);
        const formattedExpireDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;

        // 👇 mysql2 promise-based insertion
        const insertQuery = `
            INSERT INTO wowomart_segment_discount_create 
            (title, percentage, fixedAmount, segmentQuery, discountEnd, minimumAmount, minimumItem, code, expireDate, tag, segmentId, discountId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            title || null,
            percentage || null,
            fixedAmount || null,
            Query || null,
            discountEnd,
            null,
            null,
            savedCode || null,
            formattedExpireDate || null,
            tag || null,
            segmentId || null,
            discountId || null
        ];

        const [result] = await wowomartPool.query(insertQuery, values);

        return res.json({ success: true, segment: segmentData.segment, discount: discountNode });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error", details: error.response?.data || error.message });
    }
};


const updateTags = async (req, res) => {
    try {
        const { update, customerId, tags } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: "customerId is required" });
        }

        const graphqlUrl = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_GRAPHQL}/graphql.json`;

        if (update === 0) {
            const restUrl = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_REST}/customers/${customerId}.json`;
            const restResponse = await axios.put(restUrl, { customer: { id: customerId, tags } }, {
                headers: {
                    "X-Shopify-Access-Token": API_TOKEN,
                    "Content-Type": "application/json"
                }
            });
            return res.json({ success: true, method: "REST", data: restResponse.data });
        } else if (update === 1) {
            const query = `mutation tagsAdd($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          node { id ... on Customer { tags } }
          userErrors { field message }
        }
      }`;
            const variables = { id: `gid://shopify/Customer/${customerId}`, tags };
            const gqlRes = await axios.post(graphqlUrl, { query, variables }, {
                headers: { "X-Shopify-Access-Token": API_TOKEN, "Content-Type": "application/json" }
            });
            return res.json({ success: true, method: "GraphQL", data: gqlRes.data });
        } else if (update === 2) {
            const query = `mutation tagsRemove($id: ID!, $tags: [String!]!) {
        tagsRemove(id: $id, tags: $tags) {
          node { id ... on Customer { tags } }
          userErrors { field message }
        }
      }`;
            const variables = { id: `gid://shopify/Customer/${customerId}`, tags };
            const gqlRes = await axios.post(graphqlUrl, { query, variables }, {
                headers: { "X-Shopify-Access-Token": API_TOKEN, "Content-Type": "application/json" }
            });
            return res.json({ success: true, method: "GraphQL", data: gqlRes.data });
        } else {
            return res.status(400).json({ error: "Invalid update parameter. Use 0 for REST, 1 for GraphQL add, 2 for GraphQL remove" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update customer", details: error.response?.data || error.message });
    }
};


// GET all segment discounts
const getAllSegmentDiscounts = async (req, res) => {
    try {
        const discounts = await shopifyDiscountModel.getAllSegmentDiscounts();
        res.json({ success: true, data: discounts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch segment discounts', error: error.message });
    }
};

// GET one segment discount by ID
const getSegmentDiscountById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: 'ID is required' });
    }

    try {
        const discount = await shopifyDiscountModel.getSegmentDiscountById(id);

        if (!discount) {
            return res.status(404).json({ success: false, message: 'Segment discount not found' });
        }

        res.json({ success: true, data: discount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch segment discount', error: error.message });
    }
};

const getCouponsByTag = async (req, res) => {
    try {
        const result = await shopifyDiscountModel.getByTag();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// controllers/discountController.js


const deleteDiscountController = async (req, res) => {
    try {
        const { discountId } = req.body;

        if (!discountId) {
            return res.status(400).json({
                success: false,
                error: "discountId is required.",
            });
        }

        const result = await deleteShopifyDiscount(discountId);
        console.log(result);

        if (result.success === true) {
            // If deletion was successful
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data, // You can include only what’s needed
            });
        } else {
            // If deletion failed
            return res.status(500).json({
                success: false,
                error: result.error || "Failed to delete discount.",
                details: result.details || null,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message || "Something went wrong.",
        });
    }
};




module.exports = {
    createDiscount,
    createFixedAmountDiscount,
    createDiscountForSegment,
    createFixedAmountDiscountForSegment,
    updateTags,
    getAllSegmentDiscounts,
    getSegmentDiscountById,
    getCouponsByTag,
    deleteDiscountController
};