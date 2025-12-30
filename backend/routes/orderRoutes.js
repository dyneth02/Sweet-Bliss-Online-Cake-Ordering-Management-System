import express from 'express';
import Order from '../models/orders.model.js';

const router = express.Router();

// ... existing code ...

// Get orders for a specific user
router.get('/myorders/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const decodedEmail = decodeURIComponent(email);
        
        const orders = await Order.find({ user_email: decodedEmail })
            .sort({ created_at: -1 }) // Sort by creation date, newest first
            .exec();

        if (!orders) {
            return res.status(404).json({
                success: false,
                message: 'No orders found for this user'
            });
        }

        res.json({
            success: true,
            data: orders.map(order => ({
                _id: order._id,
                created_at: order.created_at,
                status: order.status,
                total_price: order.total_price,
                items: order.items.map(item => ({
                    itemType: item.itemType,
                    itemName: item.itemName,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image,
                    imageUrl: item.imageUrl,
                    baseTypeOfCake: item.baseTypeOfCake,
                    pickupOption: item.pickupOption
                }))
            }))
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

// Get completed orders count for a user
router.get('/completed-orders-count/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const decodedEmail = decodeURIComponent(email);
        
        const count = await Order.countDocuments({ 
            user_email: decodedEmail,
            status: 'completed'
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Error fetching completed orders count:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching completed orders count',
            error: error.message
        });
    }
});

export default router; 