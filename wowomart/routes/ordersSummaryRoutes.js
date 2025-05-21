const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const wowomartPool = require('../../wowomartDb/config/db'); // Ensure this uses mysql2/promise

const upload = multer({ dest: 'uploads/' });

// POST /shopify/upload-csv
router.post('/wowomart/api/shopify/upload-csv', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const filePath = path.resolve(req.file.path);
    const results = [];

    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    const email = row['Email'];
                    const name = row['Name'];
                    const financialStatus = (row['Financial Status'] || '').toLowerCase();
                    const currency = row['Currency'];
                    const fulfilledAt = row['Fulfilled at'];
                    const subtotal = parseFloat(row['Subtotal'] || 0);
                    const shipping = parseFloat(row['Shipping'] || 0);
                    const total = parseFloat(row['Total'] || 0);
                    const lineQty = parseInt(row['Lineitem quantity'] || 0);

                    if (email && financialStatus === 'paid') {
                        results.push({ name, email, currency, fulfilledAt, subtotal, shipping, total, lineQty });
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        for (const data of results) {
            const [existing] = await wowomartPool.execute('SELECT * FROM customer_order_summary WHERE email = ?', [data.email]);

            if (existing.length > 0) {
                // Update existing record
                await wowomartPool.execute(
                    `UPDATE customer_order_summary SET 
                        subtotal = subtotal + ?, 
                        shipping = shipping + ?, 
                        total = total + ?, 
                        lineitem_quantity = lineitem_quantity + ?, 
                        last_fulfilled_at = ? 
                     WHERE email = ?`,
                    [data.subtotal, data.shipping, data.total, data.lineQty, data.fulfilledAt, data.email]
                );
            } else {
                // Insert new record
                await wowomartPool.execute(
                    `INSERT INTO customer_order_summary 
                        (name, email, currency, subtotal, shipping, total, lineitem_quantity, last_fulfilled_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [data.name, data.email, data.currency, data.subtotal, data.shipping, data.total, data.lineQty, data.fulfilledAt]
                );
            }
        }

        fs.unlinkSync(filePath);
        res.status(200).json({ message: 'CSV processed successfully.' });

    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.error('CSV Processing Error:', error);
        res.status(500).json({ message: 'Error processing CSV', error: error.message });
    }
});

module.exports = router;
