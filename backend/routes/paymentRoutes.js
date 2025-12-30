import express from 'express';
import Card from '../models/card.model.js';
import Order from '../models/orders.model.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Verify card details
router.post("/verify-card", async (req, res) => {
    try {
        const { cardNumber, cardName, expiryDate, cvv } = req.body;
        
        // Format card number by removing spaces
        const formattedCardNumber = cardNumber.replace(/\s/g, '');
        
        // Convert frontend date format (MMYY) to database format (YYYY-MM)
        const month = expiryDate.substring(0, 2);
        const year = '20' + expiryDate.substring(2);
        const formattedExpiryDate = `${year}-${month}`;

        const card = await Card.findOne({
            CardNum: formattedCardNumber,
            name: cardName,
            expiryDate: formattedExpiryDate,
            cvv: cvv
        });

        if (!card) {
            return res.status(400).json({
                success: false,
                message: "Invalid card details"
            });
        }

        res.status(200).json({
            success: true,
            message: "Card verified successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Generate invoice
router.get("/generate-invoice/:orderId", async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });
        
        const filename = `invoice-${order._id}.pdf`;
        const filepath = path.join('uploads', 'invoices', filename);

        // Ensure directory exists
        if (!fs.existsSync(path.join('uploads', 'invoices'))) {
            fs.mkdirSync(path.join('uploads', 'invoices'), { recursive: true });
        }

        doc.pipe(fs.createWriteStream(filepath));

        // Add logo and company info
        doc.image('public/images/logo.png', 50, 45, { width: 100 })
           .fillColor('#444444')
           .fontSize(20)
           .text('Sweet Bliss', 200, 57)
           .fontSize(10)
           .text('123 Bakery Street', 200, 87)
           .text('Colombo, Sri Lanka', 200, 100)
           .text('Tel: +94 11 234 5678', 200, 113)
           .moveDown();

        // Add colored line
        doc.moveTo(50, 140)
           .lineTo(550, 140)
           .strokeColor('#ff69b4')
           .lineWidth(2)
           .stroke();

        // Add invoice details
        doc.fontSize(20)
           .fillColor('#444444')
           .text('INVOICE', 50, 160);

        doc.fontSize(10)
           .text(`Invoice Number: ${order._id}`, 50, 200)
           .text(`Date: ${new Date(order.order_date).toLocaleDateString()}`, 50, 215)
           .text(`Customer: ${order.user_email}`, 50, 230)
           .moveDown();

        // Add table headers with background
        const tableTop = 280;
        doc.fillColor('#444444')
           .fontSize(10)
           .text('Item', 50, tableTop)
           .text('Quantity', 250, tableTop)
           .text('Unit Price', 350, tableTop)
           .text('Total', 450, tableTop);

        // Add colored line under headers
        doc.moveTo(50, tableTop + 15)
           .lineTo(550, tableTop + 15)
           .strokeColor('#ff69b4')
           .lineWidth(1)
           .stroke();

        let tableY = tableTop + 30;
        let totalAmount = 0;

        // Add items
        order.items.forEach(item => {
            const itemName = item.itemType === 'CakeItem' 
                ? `Custom ${item.baseTypeOfCake} (${item.natureOfEvent})`
                : item.itemName;
            const unitPrice = item.itemType === 'CakeItem' ? item.price : item.price;
            const total = item.quantity * unitPrice;
            totalAmount += total;

            doc.fontSize(10)
               .fillColor('#666666')
               .text(itemName, 50, tableY)
               .text(item.quantity.toString(), 250, tableY)
               .text(`$${unitPrice.toFixed(2)}`, 350, tableY)
               .text(`$${total.toFixed(2)}`, 450, tableY);

            tableY += 20;
        });

        // Add total line
        doc.moveTo(50, tableY + 10)
           .lineTo(550, tableY + 10)
           .strokeColor('#ff69b4')
           .lineWidth(1)
           .stroke();

        // Add total amount
        doc.fontSize(12)
           .fillColor('#444444')
           .text('Total Amount:', 350, tableY + 30)
           .fontSize(12)
           .text(`$${order.total_price.toFixed(2)}`, 450, tableY + 30);

        // Add footer
        doc.fontSize(10)
           .fillColor('#666666')
           .text('Thank you for your business!', 50, doc.page.height - 100, {
               align: 'center'
           })
           .moveDown()
           .text('For any questions about this invoice, please contact', {
               align: 'center'
           })
           .text('support@sweetbliss.com | +94 11 234 5678', {
               align: 'center'
           });

        // Add decorative bottom border
        doc.moveTo(50, doc.page.height - 50)
           .lineTo(550, doc.page.height - 50)
           .strokeColor('#ff69b4')
           .lineWidth(2)
           .stroke();

        doc.end();

        res.json({
            success: true,
            invoiceUrl: `/uploads/invoices/${filename}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;