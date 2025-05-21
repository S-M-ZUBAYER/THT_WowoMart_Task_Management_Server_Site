// services/shopifyDiscountService.js

// const axios = require("axios");
// const dotenv = require("dotenv");
// const wowomartPool = require('../../wowomartDb/config/db'); // Make sure this is your MySQL pool config

// dotenv.config();

// const SHOPIFY_STORE = "1f9df1-0f.myshopify.com";
// const API_VERSION_GRAPHQL = "2024-10";
// const API_TOKEN = process.env.API_TOKEN;

// const deleteShopifyDiscount = async (discountId) => {
//   try {
//     if (!API_TOKEN || !SHOPIFY_STORE || !API_VERSION_GRAPHQL) {
//       throw new Error("Shopify config or API token is missing.");
//     }

//     const isValidGid = (id) =>
//       typeof id === "string" && id.startsWith("gid://shopify/");
//     if (!isValidGid(discountId)) {
//       throw new Error("Invalid discountId format. Must be a valid Shopify GID.");
//     }

//     const graphqlUrl = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_GRAPHQL}/graphql.json`;

//     const detectQuery = `
//       query getDiscountNode($id: ID!) {
//         node(id: $id) {
//           id
//           __typename
//         }
//       }
//     `;

//     const detectResponse = await axios.post(
//       graphqlUrl,
//       {
//         query: detectQuery,
//         variables: { id: discountId },
//       },
//       {
//         headers: {
//           "X-Shopify-Access-Token": API_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (detectResponse.data.errors) {
//       throw new Error("Failed to detect discount type.");
//     }

//     const node = detectResponse.data?.data?.node;
//     if (!node) {
//       throw new Error(`Discount with ID ${discountId} not found.`);
//     }

//     const discountType = node.__typename;
//     let deleteMutation = "";
//     let deleteMutationName = "";

//     if (discountType === "DiscountAutomaticApp") {
//       deleteMutationName = "discountAutomaticAppDelete";
//       deleteMutation = `
//         mutation discountAutomaticAppDelete($id: ID!) {
//           discountAutomaticAppDelete(id: $id) {
//             deletedDiscountId
//             userErrors {
//               field
//               message
//             }
//           }
//         }
//       `;
//     } else if (discountType === "DiscountCodeApp") {
//       deleteMutationName = "discountCodeAppDelete";
//       deleteMutation = `
//         mutation discountCodeAppDelete($id: ID!) {
//           discountCodeAppDelete(id: $id) {
//             deletedDiscountId
//             userErrors {
//               field
//               message
//             }
//           }
//         }
//       `;
//     } else if (discountType === "DiscountCodeNode") {
//       deleteMutationName = "discountCodeDelete";
//       deleteMutation = `
//         mutation discountCodeDelete($id: ID!) {
//           discountCodeDelete(id: $id) {
//             userErrors {
//               field
//               message
//             }
//           }
//         }
//       `;
//     } else {
//       throw new Error(`Unsupported discount type: ${discountType || "Unknown"}`);
//     }

//     const deleteResponse = await axios.post(
//       graphqlUrl,
//       {
//         query: deleteMutation,
//         variables: { id: discountId },
//       },
//       {
//         headers: {
//           "X-Shopify-Access-Token": API_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const mutationResult = deleteResponse.data.data[deleteMutationName];

//     if (mutationResult.userErrors?.length > 0) {
//       throw new Error(
//         `Failed due to user errors: ${JSON.stringify(mutationResult.userErrors)}`
//       );
//     }

//     // Delete from MySQL database
//     const [dbResult] = await wowomartPool.query(
//       "DELETE FROM wowomart_segment_discount_create WHERE discountId = ?",
//       [discountId]
//     );

//     return {
//       success: true,
//       message: "Discount deletion completed successfully.",
//       data: {
//         discount: {
//           success: true,
//           message: `Discount with ID ${discountId} deleted from Shopify and database.`,
//           discountId,
//         },
//         dbResult,
//       },
//     };
//   } catch (error) {
//     return {
//       success: false,
//       error: "Failed to delete discount.",
//       details: error.response?.data || error.message,
//     };
//   }
// };

// module.exports = { deleteShopifyDiscount };


const axios = require("axios");
const dotenv = require("dotenv");
const wowomartPool = require('../../wowomartDb/config/db'); // MySQL pool config

dotenv.config();

const SHOPIFY_STORE = "1f9df1-0f.myshopify.com";
const API_VERSION_GRAPHQL = "2024-10";
const API_TOKEN = process.env.API_TOKEN;

const deleteShopifyDiscount = async (discountId) => {
  try {
    // Validate config
    if (!API_TOKEN || !SHOPIFY_STORE || !API_VERSION_GRAPHQL) {
      throw new Error("Shopify config or API token is missing.");
    }

    // Validate GID format
    const isValidGid = (id) =>
      typeof id === "string" && id.startsWith("gid://shopify/");
    if (!isValidGid(discountId)) {
      throw new Error("Invalid discountId format. Must be a valid Shopify GID.");
    }

    const graphqlUrl = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION_GRAPHQL}/graphql.json`;

    // Step 1: Detect discount type
    const detectQuery = `
      query getDiscountNode($id: ID!) {
        node(id: $id) {
          id
          __typename
        }
      }
    `;

    const detectResponse = await axios.post(
      graphqlUrl,
      {
        query: detectQuery,
        variables: { id: discountId },
      },
      {
        headers: {
          "X-Shopify-Access-Token": API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    if (detectResponse.data.errors) {
      throw new Error("Failed to detect discount type.");
    }

    const node = detectResponse.data?.data?.node;
    if (!node) {
      throw new Error(`Discount with ID ${discountId} not found.`);
    }

    const discountType = node.__typename;
    let deleteMutation = "";
    let deleteMutationName = "";

    // Step 2: Prepare the delete mutation based on type
    if (discountType === "DiscountAutomaticApp") {
      deleteMutationName = "discountAutomaticAppDelete";
      deleteMutation = `
        mutation discountAutomaticAppDelete($id: ID!) {
          discountAutomaticAppDelete(id: $id) {
            deletedDiscountId
            userErrors {
              field
              message
            }
          }
        }
      `;
    } else if (discountType === "DiscountCodeApp") {
      deleteMutationName = "discountCodeAppDelete";
      deleteMutation = `
        mutation discountCodeAppDelete($id: ID!) {
          discountCodeAppDelete(id: $id) {
            deletedDiscountId
            userErrors {
              field
              message
            }
          }
        }
      `;
    } else if (discountType === "DiscountCodeNode") {
      deleteMutationName = "discountCodeDelete";
      deleteMutation = `
        mutation discountCodeDelete($id: ID!) {
          discountCodeDelete(id: $id) {
            userErrors {
              field
              message
            }
          }
        }
      `;
    } else {
      throw new Error(`Unsupported discount type: ${discountType || "Unknown"}`);
    }

    // Step 3: Execute delete mutation
    const deleteResponse = await axios.post(
      graphqlUrl,
      {
        query: deleteMutation,
        variables: { id: discountId },
      },
      {
        headers: {
          "X-Shopify-Access-Token": API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const mutationData = deleteResponse.data?.data;
    if (!mutationData || !mutationData[deleteMutationName]) {
      throw new Error("Unexpected response format from Shopify mutation.");
    }

    const mutationResult = mutationData[deleteMutationName];
    if (mutationResult.userErrors?.length > 0) {
      throw new Error(
        `Failed due to user errors: ${JSON.stringify(mutationResult.userErrors)}`
      );
    }

    // Step 4: Delete from MySQL database
    const [dbResult] = await wowomartPool.query(
      "DELETE FROM wowomart_segment_discount_create WHERE discountId = ?",
      [discountId]
    );

    if (dbResult.affectedRows === 0) {
      throw new Error("Discount deleted from Shopify, but no matching record found in database.");
    }

    return {
      success: true,
      message: "Discount deletion completed successfully.",
      data: {
        discount: {
          success: true,
          message: `Discount with ID ${discountId} deleted from Shopify and database.`,
          discountId,
        },
        dbResult,
      },
    };
  } catch (error) {
    console.error("Error deleting discount:", error.response?.data || error.message);

    return {
      success: false,
      error: "Failed to delete discount.",
      details: error.response?.data || error.message,
    };
  }
};

module.exports = { deleteShopifyDiscount };
