import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/orders.model.js';

const OrderRouter = express.Router();

// Get all orders
OrderRouter.get("/orders", async (req, res) => {
    try {
        const allOrder = await Order.find({})
        res.status(200).json(allOrder);
    }
    catch (error) {
        res.status(400).json({message: error.message});
    }
});

// Get order by ID
OrderRouter.get("/orders/:id", async (req, res) => {
    try {
        const orderId = req.params.id;
        
        console.log('Received order ID:', orderId); // Debug log

        if (!orderId) {
            return res.status(400).json({ 
                success: false, 
                message: "Order ID is required" 
            });
        }

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            console.log('Invalid ObjectId format for:', orderId); // Debug log
            return res.status(400).json({ 
                success: false, 
                message: "Invalid order ID format" 
            });
        }

        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error in get order by ID:', error); // Debug log
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
});

// Delete an Order
OrderRouter.delete("/orders/:id", async (req, res) => {
    try {
        const deleteAnItem = await Order.findByIdAndDelete(req.params.id)
        if (!deleteAnItem) return res.status(404).json({message: "Order not found"})
        res.status(200).json({message:"Item deleted Successfully", data:deleteAnItem});
    }
    catch (error) {
        res.status(500).json({message: "Internal Server Error", error: error.message});
    }
});

// Update order status
OrderRouter.put("/orders/:id/status", async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid order ID format" 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
});

// Get count of pending orders
OrderRouter.get("/orders/pending/count", async (req, res) => {
    try {
        const count = await Order.countDocuments({ status: 'pending' });
        
        res.status(200).json({
            success: true,
            count: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching pending orders count",
            error: error.message
        });
    }
});

// Get monthly revenue from completed orders
OrderRouter.get("/monthly-revenue", async (req, res) => {
    try {
        const now = new Date();
        
        // Current month range
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        // Previous month range
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // Get current month orders
        const currentMonthOrders = await Order.find({
            status: 'completed',
            order_date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        });

        // Get previous month orders
        const previousMonthOrders = await Order.find({
            status: 'completed',
            order_date: {
                $gte: startOfPrevMonth,
                $lte: endOfPrevMonth
            }
        });

        const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + order.total_price, 0);
        const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + order.total_price, 0);

        // Calculate growth percentage
        const growth = previousMonthRevenue === 0 
            ? 100 // If previous month was 0, consider it 100% growth
            : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

        res.status(200).json({
            success: true,
            data: {
                currentMonthRevenue,
                previousMonthRevenue,
                growth: Number(growth.toFixed(2)),
                orderCount: currentMonthOrders.length,
                month: startOfMonth.toLocaleString('default', { month: 'long' }),
                year: startOfMonth.getFullYear()
            }
        });
    } catch (error) {
        console.error('Monthly revenue calculation error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to calculate monthly revenue",
            error: error.message
        });
    }
});

export default OrderRouter;
