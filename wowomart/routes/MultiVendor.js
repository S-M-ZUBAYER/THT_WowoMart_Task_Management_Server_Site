const express = require('express');
const wowomartPool = require('../../wowomartDb/config/db');
const nodemailer = require('nodemailer');

const router = express.Router();

// Utility: error handling
const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};

// Nodemailer setup
const transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    port: 465,
    secure: true,
    auth: {
        user: "yingdanong765@gmail.com",
        pass: "printernoble.com"
    }
});

// Email sender
const sendMail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"S M Zubayer" <business@wowomart.com>',
            to,
            subject,
            text,
            html
        });
        console.log("Email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};

// Send email endpoint
router.post('/wowomart/api/send-email', async (req, res) => {
    const { to, subject, text } = req.body;
    if (!to || !subject || !text) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await sendMail(to, subject, text);
    if (response.success) {
        res.json({ message: "Email sent successfully", messageId: response.messageId });
    } else {
        res.status(500).json({ error: "Failed to send email", details: response.error });
    }
});

// Add MultiVendor Payment Info
router.post('/wowomart/api/multiVendorPaymentInfo/apply', async (req, res) => {
    const { email, amount, paymentId, Duration, currency, purpose } = req.body;
    const paymentTime = new Date();

    if (!email || !amount || !paymentId || !Duration || !currency || !purpose) {
        return res.status(400).json({
            statusCode: 400,
            status: "failed",
            message: "Required fields missing"
        });
    }

    try {
        const query = `
      INSERT INTO multiVendorPaymentInfo 
      (email, paymentStatus, amount, paymentTime, Duration, currency, account_creation_status, subscriptionStatus, purpose, paymentId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const values = [email, true, amount, paymentTime, Duration, currency, false, true, purpose, paymentId];
        const [result] = await wowomartPool.execute(query, values);

        res.status(201).json({
            statusCode: 201,
            status: "success",
            message: "MultiVendor payment info added successfully"
        });
    } catch (error) {
        handleError(res, error, "Error adding MultiVendor payment info");
    }
});

// Update MultiVendor Payment Info
router.put("/wowomart/api/multiVendorPaymentInfo/update", async (req, res) => {
    const { amount, email, currency, purpose, Duration, paymentId, paymentTime, paymentStatus, account_creation_status, disableStatus } = req.body;

    if (!amount || !email || !currency || !purpose || !Duration || !paymentId || !paymentTime || account_creation_status === undefined || paymentStatus === undefined || disableStatus === undefined) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "All required fields must be provided"
        });
    }

    try {
        const query = `
      UPDATE multiVendorPaymentInfo
      SET amount = ?, currency = ?, account_creation_status = ?, paymentTime = ?, purpose = ?, Duration = ?, paymentId = ?, paymentStatus = ?, subscriptionStatus = ?, disableStatus = ?
      WHERE email = ?
    `;
        const [result] = await wowomartPool.execute(query, [amount, currency, account_creation_status, paymentTime, purpose, Duration, paymentId, paymentStatus, true, disableStatus, email]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "No record found for the provided email"
            });
        }

        res.json({ status: 200, success: true, message: "Payment info updated successfully" });
    } catch (error) {
        handleError(res, error, "Error updating payment info");
    }
});

// Update account_creation_status by email
router.put("/wowomart/api/multiVendorPaymentInfo/accountCreationUpdate/:email", async (req, res) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ status: 400, success: false, message: "Email is required" });
    }

    try {
        const [result] = await wowomartPool.execute(
            `UPDATE multiVendorPaymentInfo SET account_creation_status = ? WHERE email = ?`,
            [true, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Email not found" });
        }

        res.json({ status: 200, success: true, message: "Account creation status updated" });
    } catch (error) {
        handleError(res, error, "Error updating account creation status");
    }
});

// Update subscriptionStatus and paymentTime by email
router.put("/wowomart/api/multiVendorPaymentInfo/subscriptionStatusUpdate/:email", async (req, res) => {
    const { email } = req.params;
    const paymentTime = new Date();

    if (!email) {
        return res.status(400).json({ status: 400, success: false, message: "Email is required" });
    }

    try {
        const [result] = await wowomartPool.execute(
            `UPDATE multiVendorPaymentInfo SET subscriptionStatus = ?, paymentTime = ? WHERE email = ?`,
            [true, paymentTime, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, success: false, message: "Email not found" });
        }

        res.json({ status: 200, success: true, message: "Subscription status updated" });
    } catch (error) {
        handleError(res, error, "Error updating subscription status");
    }
});

// Bulk update subscriptionStatus for multiple emails
router.put("/wowomart/api/multiVendorPaymentInfo/updateMultipleEmailSubscriptionStatus", async (req, res) => {
    const { emails } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ status: 400, success: false, message: "Emails array is required" });
    }

    const placeholders = emails.map(() => '?').join(', ');

    try {
        const [result] = await wowomartPool.execute(
            `UPDATE multiVendorPaymentInfo SET subscriptionStatus = ? WHERE email IN (${placeholders})`,
            [false, ...emails]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, success: false, message: "No matching emails found" });
        }

        res.json({ status: 200, success: true, message: "Subscription status updated for selected emails" });
    } catch (error) {
        handleError(res, error, "Error bulk updating subscription status");
    }
});

// Update disableStatus by ID
router.put("/wowomart/api/multiVendorPaymentInfo/updateDisableStatus/:id", async (req, res) => {
    const { id } = req.params;
    const { disableStatus } = req.body;

    if (disableStatus === undefined) {
        return res.status(400).json({ status: 400, success: false, message: "disableStatus is required" });
    }

    try {
        const [result] = await wowomartPool.execute(
            `UPDATE multiVendorPaymentInfo SET disableStatus = ? WHERE id = ?`,
            [disableStatus, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, success: false, message: "ID not found" });
        }

        res.json({ status: 200, success: true, message: "Disable status updated successfully" });
    } catch (error) {
        handleError(res, error, "Error updating disable status");
    }
});

// Get all records
router.get('/wowomart/api/multiVendorPaymentInfo/all', async (req, res) => {
    try {
        const [rows] = await wowomartPool.execute(`SELECT * FROM multiVendorPaymentInfo`);
        res.json({ status: 200, success: true, data: rows });
    } catch (error) {
        handleError(res, error, "Error fetching payment info");
    }
});

module.exports = router;
