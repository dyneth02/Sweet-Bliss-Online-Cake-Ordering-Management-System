import express from 'express';
import Inventory from '../models/inventory.model.js';
import Cart from '../models/cart.model.js';
const router = express.Router();



// Get all store items
router.get('/store', async (req, res) => {
    try {
        // Remove the stock level filter to show all items
        const items = await Inventory.find().select('itemName image unitPrice stockLevel availability');
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Add item to cart
router.post('/cart/add', async (req, res) => {
    try {
        const { email, itemName, quantity = 1 } = req.body;

        if (!email || !itemName) {
            return res.status(400).json({
                success: false,
                message: 'Email and item ID are required'
            });
        }

        // Find the product in inventory
        const product = await Inventory.findOne({ itemName: req.body.itemName });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if product is in stock
        if (product.stockLevel < quantity || product.availability === 'Out of Stock') {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock or has insufficient quantity'
            });
        }

        // Check if item already exists in cart for this user
        const existingCartItem = await Cart.findOne({
            email: email,
            itemName: product.itemName
        });

        if (existingCartItem) {
            // Update quantity if item already exists in cart
            existingCartItem.quantity = (existingCartItem.quantity || 0) + quantity;
            await existingCartItem.save();

            res.status(200).json({
                success: true,
                message: 'Cart updated successfully',
                data: existingCartItem
            });
        } else {
            // Create new cart item
            const cartItem = new Cart({
                email: email,
                itemName: product.itemName,
                image: product.image,
                unitPrice: product.unitPrice,
                status: product.availability,
                quantity: quantity
            });

            await cartItem.save();

            res.status(201).json({
                success: true,
                message: 'Item added to cart successfully',
                data: cartItem
            });
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add item to cart'
        });
    }
});

// Add this new endpoint to update stock level
router.put('/store/update-stock', async (req, res) => {
    try {
        const { itemName, quantity } = req.body;

        if (!itemName || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Item name and quantity are required'
            });
        }

        const item = await Inventory.findOne({ itemName });
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        if (item.stockLevel < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Update stock level
        item.stockLevel -= quantity;
        
        // Update availability if stock becomes 0
        if (item.stockLevel === 0) {
            item.availability = 'Out of Stock';
        }

        await item.save();

        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            data: item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
