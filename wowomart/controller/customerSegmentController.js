const axios = require('axios');
const { getSegmentDiscounts } = require('../model/customerSegmentModel');
const wowomartPool = require('../../wowomartDb/config/db');

// const getShopifyCustomerSegment = async (req, res) => {
//     const customerId = req.params.id;
//     const shopifyToken = process.env.API_TOKEN;
//     console.log(customerId);

//     try {
//         // Step 1: Get customer data from Shopify
//         const response = await axios.get(
//             `https://1f9df1-0f.myshopify.com/admin/api/2023-10/customers/${customerId}.json`,
//             {
//                 headers: {
//                     'X-Shopify-Access-Token': shopifyToken,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

//         const customer = response.data.customer;
//         const totalSpent = parseFloat(customer.total_spent);
//         const ordersCount = parseInt(customer.orders_count);
//         const createdAtISO = new Date(customer.created_at).toISOString().split("T")[0];
//         let createdAtMatch = null;
//         let smallestGreaterDate = null;
//         let minimumAmountMatch = null;
//         let closestSmallerAmount = null;
//         let minimumItemMatch = null;
//         let closestSmallerItem = null;

//         // Step 2: Get all segment discounts
//         getSegmentDiscounts((err, rows) => {
//             if (err) return res.status(500).json({ message: 'DB error', error: err });
//             rows.forEach(row => {

//                 // Check coupon according to the customer account creation duration
//                 if (row.segmentQuery) {
//                     const match = row.segmentQuery.match(/customer_added_date\s*<=\s*(\d{4}-\d{2}-\d{2})/);
//                     if (match) {
//                         const segmentDateStr = match[1];
//                         const segmentDate = new Date(segmentDateStr);

//                         if (segmentDate.toISOString().split("T")[0] === createdAtISO) {
//                             // Exact match
//                             createdAtMatch = row;
//                         } else if (segmentDate > new Date(createdAtISO)) {
//                             if (!smallestGreaterDate || segmentDate < new Date(smallestGreaterDate.segmentQuery.match(/(\d{4}-\d{2}-\d{2})/)[1])) {
//                                 smallestGreaterDate = row;
//                             }
//                         }
//                     }
//                 }
//             });

//             // If exact match not found, use smallest greater
//             if (!createdAtMatch && smallestGreaterDate) {
//                 createdAtMatch = smallestGreaterDate;
//             }


//             // Check coupon according to the customer account total spent
//             if (totalSpent !== null && totalSpent > 0) {
//                 rows.forEach(row => {
//                     if (row.minimumAmount !== null && row.minimumAmount !== undefined) {
//                         const rowAmount = parseFloat(row.minimumAmount);

//                         if (rowAmount === totalSpent) {
//                             minimumAmountMatch = row;
//                         } else if (rowAmount < totalSpent) {
//                             if (
//                                 !closestSmallerAmount ||
//                                 rowAmount > parseFloat(closestSmallerAmount.minimumAmount)
//                             ) {
//                                 closestSmallerAmount = row;
//                             }
//                         }
//                     }
//                 });

//                 // If exact match not found, use closest smaller
//                 if (!minimumAmountMatch && closestSmallerAmount) {
//                     minimumAmountMatch = closestSmallerAmount;
//                 }
//             }


//             // Check coupon according to the customer account orders items
//             if (ordersCount !== null && ordersCount > 0) {
//                 rows.forEach(row => {
//                     if (row.minimumItem !== null && row.minimumItem !== undefined) {
//                         const rowItem = parseInt(row.minimumItem);

//                         if (rowItem === ordersCount) {
//                             minimumItemMatch = row;
//                         } else if (rowItem < ordersCount) {
//                             if (
//                                 !closestSmallerItem ||
//                                 rowItem > parseInt(closestSmallerItem.minimumItem)
//                             ) {
//                                 closestSmallerItem = row;
//                             }
//                         }
//                     }
//                 });

//                 // If exact match not found, use closest smaller item
//                 if (!minimumItemMatch && closestSmallerItem) {
//                     minimumItemMatch = closestSmallerItem;
//                 }
//             }

//             let tagMatch = null;

//             if (customer.tags && customer.tags.trim() !== "") {
//                 const customerTags = customer.tags.split(',').map(tag => tag.trim());

//                 const tagMatchedRows = rows.filter(row => {
//                     return row.tag && customerTags.includes(row.tag.trim());
//                 });

//                 if (tagMatchedRows.length > 0) {
//                     tagMatch = tagMatchedRows.reduce((max, curr) => {
//                         return parseFloat(curr.percentage || 0) > parseFloat(max.percentage || 0) ? curr : max;
//                     });
//                 }
//             }

//             // Gather the 3 matching rows
//             const candidateSegments = [createdAtMatch, minimumAmountMatch, minimumItemMatch, tagMatch].filter(Boolean);

//             if (candidateSegments.length === 0) {
//                 return res.status(404).json({ message: 'No matching segments found' });
//             }

//             // Return the one with the highest percentage
//             const topSegment = candidateSegments.reduce((best, curr) => {
//                 return parseFloat(curr.percentage || 0) > parseFloat(best.percentage || 0) ? curr : best;
//             });


//             return res.status(200).json({
//                 message: 'Top matching segment found',
//                 topSegment,
//             });
//         });
//     } catch (error) {
//         return res.status(500).json({ message: 'Shopify API error', error: error.message });
//     }
// };


const getShopifyCustomerSegment = async (req, res) => {
    const customerId = req.params.id;
    const shopifyToken = process.env.API_TOKEN;

    try {
        const response = await axios.get(
            `https://1f9df1-0f.myshopify.com/admin/api/2023-10/customers/${customerId}.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': shopifyToken,
                    'Content-Type': 'application/json',
                },
            }
        );

        const customer = response.data.customer;
        const totalSpent = parseFloat(customer.total_spent);
        const ordersCount = parseInt(customer.orders_count);
        const createdAtISO = new Date(customer.created_at).toISOString().split("T")[0];

        const rows = await getSegmentDiscounts(); // ✅ async call

        let createdAtMatch = null;
        let smallestGreaterDate = null;
        let minimumAmountMatch = null;
        let closestSmallerAmount = null;
        let minimumItemMatch = null;
        let closestSmallerItem = null;

        rows.forEach(row => {
            if (row.segmentQuery) {
                const match = row.segmentQuery.match(/customer_added_date\s*<=\s*(\d{4}-\d{2}-\d{2})/);
                if (match) {
                    const segmentDateStr = match[1];
                    const segmentDate = new Date(segmentDateStr);

                    if (segmentDate.toISOString().split("T")[0] === createdAtISO) {
                        createdAtMatch = row;
                    } else if (segmentDate > new Date(createdAtISO)) {
                        if (!smallestGreaterDate || segmentDate < new Date(smallestGreaterDate.segmentQuery.match(/(\d{4}-\d{2}-\d{2})/)[1])) {
                            smallestGreaterDate = row;
                        }
                    }
                }
            }
        });

        if (!createdAtMatch && smallestGreaterDate) {
            createdAtMatch = smallestGreaterDate;
        }

        if (totalSpent !== null && totalSpent > 0) {
            rows.forEach(row => {
                if (row.minimumAmount !== null && row.minimumAmount !== undefined) {
                    const rowAmount = parseFloat(row.minimumAmount);

                    if (rowAmount === totalSpent) {
                        minimumAmountMatch = row;
                    } else if (rowAmount < totalSpent) {
                        if (!closestSmallerAmount || rowAmount > parseFloat(closestSmallerAmount.minimumAmount)) {
                            closestSmallerAmount = row;
                        }
                    }
                }
            });

            if (!minimumAmountMatch && closestSmallerAmount) {
                minimumAmountMatch = closestSmallerAmount;
            }
        }

        if (ordersCount !== null && ordersCount > 0) {
            rows.forEach(row => {
                if (row.minimumItem !== null && row.minimumItem !== undefined) {
                    const rowItem = parseInt(row.minimumItem);

                    if (rowItem === ordersCount) {
                        minimumItemMatch = row;
                    } else if (rowItem < ordersCount) {
                        if (!closestSmallerItem || rowItem > parseInt(closestSmallerItem.minimumItem)) {
                            closestSmallerItem = row;
                        }
                    }
                }
            });

            if (!minimumItemMatch && closestSmallerItem) {
                minimumItemMatch = closestSmallerItem;
            }
        }

        let tagMatch = null;
        if (customer.tags && customer.tags.trim() !== "") {
            const customerTags = customer.tags.split(',').map(tag => tag.trim());

            const tagMatchedRows = rows.filter(row => {
                return row.tag && customerTags.includes(row.tag.trim());
            });

            if (tagMatchedRows.length > 0) {
                tagMatch = tagMatchedRows.reduce((max, curr) => {
                    return parseFloat(curr.percentage || 0) > parseFloat(max.percentage || 0) ? curr : max;
                });
            }
        }

        const candidateSegments = [createdAtMatch, minimumAmountMatch, minimumItemMatch, tagMatch].filter(Boolean);

        if (candidateSegments.length === 0) {
            return res.status(404).json({ message: 'No matching segments found' });
        }

        const topSegment = candidateSegments.reduce((best, curr) => {
            return parseFloat(curr.percentage || 0) > parseFloat(best.percentage || 0) ? curr : best;
        });

        return res.status(200).json({
            message: 'Top matching segment found',
            topSegment,
        });

    } catch (error) {
        return res.status(500).json({ message: 'Shopify API error', error: error.message });
    }
};


// const getShopifyCustomerSegmentByEmail = async (req, res) => {
//     const email = req.params.email;
//     const shopifyToken = process.env.API_TOKEN;

//     try {
//         // Step 1: Get customerId using email
//         const idResponse = await axios.get(
//             `https://grozziieget.zjweiting.com:3091/CustomerService-Chat/api/dev/user/shopifyCustomerid/${email}`
//         );

//         if (
//             idResponse.data.status !== 'success' ||
//             !idResponse.data.data ||
//             typeof idResponse.data.data !== 'string'
//         ) {
//             return res.status(404).json({ message: 'Customer ID not found for email' });
//         }

//         // Extract numeric ID from Shopify GID
//         const gid = idResponse.data.data;
//         const customerId = gid.split('/').pop(); // e.g. "7275617288246"

//         // Step 2: Get customer data from Shopify
//         const response = await axios.get(
//             `https://1f9df1-0f.myshopify.com/admin/api/2023-10/customers/${customerId}.json`,
//             {
//                 headers: {
//                     'X-Shopify-Access-Token': shopifyToken,
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

//         const customer = response.data.customer;
//         const totalSpent = parseFloat(customer.total_spent);
//         const ordersCount = parseInt(customer.orders_count);
//         const createdAtISO = new Date(customer.created_at).toISOString().split("T")[0];
//         let createdAtMatch = null;
//         let smallestGreaterDate = null;
//         let minimumAmountMatch = null;
//         let closestSmallerAmount = null;
//         let minimumItemMatch = null;
//         let closestSmallerItem = null;

//         // Step 2: Get all segment discounts
//         getSegmentDiscounts((err, rows) => {
//             if (err) return res.status(500).json({ message: 'DB error', error: err });
//             rows.forEach(row => {

//                 // Check coupon according to the customer account creation duration
//                 if (row.segmentQuery) {
//                     const match = row.segmentQuery.match(/customer_added_date\s*<=\s*(\d{4}-\d{2}-\d{2})/);
//                     if (match) {
//                         const segmentDateStr = match[1];
//                         const segmentDate = new Date(segmentDateStr);

//                         if (segmentDate.toISOString().split("T")[0] === createdAtISO) {
//                             // Exact match
//                             createdAtMatch = row;
//                         } else if (segmentDate > new Date(createdAtISO)) {
//                             if (!smallestGreaterDate || segmentDate < new Date(smallestGreaterDate.segmentQuery.match(/(\d{4}-\d{2}-\d{2})/)[1])) {
//                                 smallestGreaterDate = row;
//                             }
//                         }
//                     }
//                 }
//             });

//             // If exact match not found, use smallest greater
//             if (!createdAtMatch && smallestGreaterDate) {
//                 createdAtMatch = smallestGreaterDate;
//             }


//             // Check coupon according to the customer account total spent
//             if (totalSpent !== null && totalSpent > 0) {
//                 rows.forEach(row => {
//                     if (row.minimumAmount !== null && row.minimumAmount !== undefined) {
//                         const rowAmount = parseFloat(row.minimumAmount);

//                         if (rowAmount === totalSpent) {
//                             minimumAmountMatch = row;
//                         } else if (rowAmount < totalSpent) {
//                             if (
//                                 !closestSmallerAmount ||
//                                 rowAmount > parseFloat(closestSmallerAmount.minimumAmount)
//                             ) {
//                                 closestSmallerAmount = row;
//                             }
//                         }
//                     }
//                 });

//                 // If exact match not found, use closest smaller
//                 if (!minimumAmountMatch && closestSmallerAmount) {
//                     minimumAmountMatch = closestSmallerAmount;
//                 }
//             }


//             // Check coupon according to the customer account orders items
//             if (ordersCount !== null && ordersCount > 0) {
//                 rows.forEach(row => {
//                     if (row.minimumItem !== null && row.minimumItem !== undefined) {
//                         const rowItem = parseInt(row.minimumItem);

//                         if (rowItem === ordersCount) {
//                             minimumItemMatch = row;
//                         } else if (rowItem < ordersCount) {
//                             if (
//                                 !closestSmallerItem ||
//                                 rowItem > parseInt(closestSmallerItem.minimumItem)
//                             ) {
//                                 closestSmallerItem = row;
//                             }
//                         }
//                     }
//                 });

//                 // If exact match not found, use closest smaller item
//                 if (!minimumItemMatch && closestSmallerItem) {
//                     minimumItemMatch = closestSmallerItem;
//                 }
//             }

//             let tagMatch = null;

//             if (customer.tags && customer.tags.trim() !== "") {
//                 const customerTags = customer.tags.split(',').map(tag => tag.trim());

//                 const tagMatchedRows = rows.filter(row => {
//                     return row.tag && customerTags.includes(row.tag.trim());
//                 });

//                 if (tagMatchedRows.length > 0) {
//                     tagMatch = tagMatchedRows.reduce((max, curr) => {
//                         return parseFloat(curr.percentage || 0) > parseFloat(max.percentage || 0) ? curr : max;
//                     });
//                 }
//             }

//             // Gather the 3 matching rows
//             const candidateSegments = [createdAtMatch, minimumAmountMatch, minimumItemMatch, tagMatch].filter(Boolean);

//             if (candidateSegments.length === 0) {
//                 return res.status(404).json({ message: 'No matching segments found' });
//             }

//             // Return the one with the highest percentage
//             const topSegment = candidateSegments.reduce((best, curr) => {
//                 return parseFloat(curr.percentage || 0) > parseFloat(best.percentage || 0) ? curr : best;
//             });


//             return res.status(200).json({
//                 message: 'Top matching segment found',
//                 topSegment,
//             });
//         });
//     } catch (error) {
//         return res.status(500).json({ message: 'Shopify API error', error: error.message });
//     }
// };



const getShopifyCustomerSegmentByEmail = async (req, res) => {
    const email = req.params.email;
    const shopifyToken = process.env.API_TOKEN;

    try {
        // Step 1: Get customerId using email
        const idResponse = await axios.get(
            `https://grozziieget.zjweiting.com:3091/CustomerService-Chat/api/dev/user/shopifyCustomerid/${email}`
        );

        if (
            idResponse.data.status !== 'success' ||
            !idResponse.data.data ||
            typeof idResponse.data.data !== 'string'
        ) {
            return res.status(404).json({ message: 'Customer ID not found for email' });
        }

        const gid = idResponse.data.data;
        const customerId = gid.split('/').pop();

        // Step 2: Get customer data from Shopify
        const response = await axios.get(
            `https://1f9df1-0f.myshopify.com/admin/api/2023-10/customers/${customerId}.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': shopifyToken,
                    'Content-Type': 'application/json',
                },
            }
        );

        const customer = response.data.customer;
        const totalSpent = parseFloat(customer.total_spent);
        const ordersCount = parseInt(customer.orders_count);
        const createdAtISO = new Date(customer.created_at).toISOString().split("T")[0];

        let createdAtMatch = null;
        let smallestGreaterDate = null;
        let minimumAmountMatch = null;
        let closestSmallerAmount = null;
        let minimumItemMatch = null;
        let closestSmallerItem = null;

        // Step 3: Get all segment discounts using MySQL2
        const [rows] = await wowomartPool.query('SELECT * FROM wowomart_segment_discount_create'); // update your table name

        // Created date matching
        rows.forEach(row => {
            if (row.segmentQuery) {
                const match = row.segmentQuery.match(/customer_added_date\s*<=\s*(\d{4}-\d{2}-\d{2})/);
                if (match) {
                    const segmentDateStr = match[1];
                    const segmentDate = new Date(segmentDateStr);

                    if (segmentDate.toISOString().split("T")[0] === createdAtISO) {
                        createdAtMatch = row;
                    } else if (segmentDate > new Date(createdAtISO)) {
                        if (!smallestGreaterDate || segmentDate < new Date(smallestGreaterDate.segmentQuery.match(/(\d{4}-\d{2}-\d{2})/)[1])) {
                            smallestGreaterDate = row;
                        }
                    }
                }
            }
        });

        if (!createdAtMatch && smallestGreaterDate) {
            createdAtMatch = smallestGreaterDate;
        }

        // Total spent matching
        if (totalSpent && totalSpent > 0) {
            rows.forEach(row => {
                if (row.minimumAmount !== null && row.minimumAmount !== undefined) {
                    const rowAmount = parseFloat(row.minimumAmount);
                    if (rowAmount === totalSpent) {
                        minimumAmountMatch = row;
                    } else if (rowAmount < totalSpent) {
                        if (!closestSmallerAmount || rowAmount > parseFloat(closestSmallerAmount.minimumAmount)) {
                            closestSmallerAmount = row;
                        }
                    }
                }
            });

            if (!minimumAmountMatch && closestSmallerAmount) {
                minimumAmountMatch = closestSmallerAmount;
            }
        }

        // Order count (minimum item) matching
        if (ordersCount && ordersCount > 0) {
            rows.forEach(row => {
                if (row.minimumItem !== null && row.minimumItem !== undefined) {
                    const rowItem = parseInt(row.minimumItem);
                    if (rowItem === ordersCount) {
                        minimumItemMatch = row;
                    } else if (rowItem < ordersCount) {
                        if (!closestSmallerItem || rowItem > parseInt(closestSmallerItem.minimumItem)) {
                            closestSmallerItem = row;
                        }
                    }
                }
            });

            if (!minimumItemMatch && closestSmallerItem) {
                minimumItemMatch = closestSmallerItem;
            }
        }

        // Tag matching
        let tagMatch = null;
        if (customer.tags && customer.tags.trim() !== "") {
            const customerTags = customer.tags.split(',').map(tag => tag.trim());

            const tagMatchedRows = rows.filter(row => {
                return row.tag && customerTags.includes(row.tag.trim());
            });

            if (tagMatchedRows.length > 0) {
                tagMatch = tagMatchedRows.reduce((max, curr) => {
                    return parseFloat(curr.percentage || 0) > parseFloat(max.percentage || 0) ? curr : max;
                });
            }
        }

        const candidateSegments = [createdAtMatch, minimumAmountMatch, minimumItemMatch, tagMatch].filter(Boolean);

        if (candidateSegments.length === 0) {
            return res.status(404).json({ message: 'No matching segments found' });
        }

        const topSegment = candidateSegments.reduce((best, curr) => {
            return parseFloat(curr.percentage || 0) > parseFloat(best.percentage || 0) ? curr : best;
        });

        return res.status(200).json({
            message: 'Top matching segment found',
            topSegment,
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Shopify or DB error', error: error.message });
    }
};


module.exports = { getShopifyCustomerSegment, getShopifyCustomerSegmentByEmail };
