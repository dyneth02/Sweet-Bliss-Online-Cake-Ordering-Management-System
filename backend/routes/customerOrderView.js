import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/orders.model.js';

const OrderRouter = express.Router();

//Get a specific user's Orders
OrderRouter.get("/get_orders/:user_email", async (req, res) => {
    const { user_email } = req.params;

    if (!user_email) {
        return res.status(400).json({ message: "User email is required" });
    }

    try {
        const userOrders = await Order.find({ user_email:user_email });

        if (userOrders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user" });
        }

        res.status(200).json({ success: true, data: userOrders });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//Create a cake
OrderRouter.post("/create_order", async (req, res) => {
    const { user_email, items, total_price, status, order_date } = req.body;

    if (!user_email || !items || !total_price || !status || !order_date) {
        return res.status(400).json({message: "Please provide all the required fields"});
    }

    try {
        const newOrder = new Order({ user_email, items, total_price, status, order_date })
        await newOrder.save();
        res.status(201).json({ success: true, message: "Order Created Successfully", data: newOrder});
    }
    catch (error) {
        res.status(500).json({message: error.message});
    }
});

// Create order from cart items
OrderRouter.post("/create_order_from_cart", async (req, res) => {
    const { user_email, customCakes, storeItems } = req.body;

    try {
        // Transform custom cakes to order items
        const cakeItems = customCakes.map(cake => ({
            itemType: 'CakeItem',
            quantity: 1,
            natureOfEvent: cake.natureOfEvent,
            baseTypeOfCake: cake.baseTypeOfCake,
            dateOfRequirement: cake.dateOfRequirement,
            cakeSize: cake.cakeSize,
            baseColors: cake.baseColors,
            pickupOption: cake.pickupOption,
            toppings: cake.toppings,
            writingsOnTop: cake.writingsOnTop,
            imageUrl: cake.imageUrl,
            additionalNotes: cake.additionalNotes,
            price: Number(cake.price)
        }));

        // Transform store items to order items
        const inventoryItems = storeItems.map(item => ({
            itemType: 'InventoryItem',
            itemId: item._id,
            quantity: Number(item.quantity),
            itemName: item.itemName,
            image: item.image,
            unitPrice: Number(item.price),
            price: Number(item.price) * Number(item.quantity)
        }));

        // Calculate total price
        const totalPrice = [
            ...cakeItems.map(item => item.price),
            ...inventoryItems.map(item => item.price)
        ].reduce((sum, price) => sum + price, 0);

        // Create new order
        const newOrder = new Order({
            user_email,
            items: [...cakeItems, ...inventoryItems],
            total_price: totalPrice,
            status: 'pending',
            order_date: new Date()
        });

        console.log('Order before save:', JSON.stringify(newOrder, null, 2));

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                orderId: newOrder._id,
                total: totalPrice
            }
        });
    } catch (error) {
        console.error('Order creation error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            validationErrors: error.errors
        });

        res.status(500).json({
            success: false,
            message: "Failed to create order. Please try again.",
            error: error.message
        });
    }
});

export default OrderRouter;
