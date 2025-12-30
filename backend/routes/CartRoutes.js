import express from 'express';
import Cart from '../models/cart.model.js';
import Inventory from "../models/inventory.model.js";

const router = express.Router();

// Get cart items by email
router.get('/cart', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const cart = await Cart.findOne({ email });
        if (!cart) {
            return res.status(200).json({ items: [] });
        }

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add store item to cart
router.post('/cart/add', async (req, res) => {
    try {
        const { email, itemName, quantity = 1 } = req.body;

        if (!email || !itemName) {
            return res.status(400).json({
                success: false,
                message: 'Email and item name are required'
            });
        }

        // Find the product in inventory
        const product = await Inventory.findOne({ itemName });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check stock availability
        if (product.stockLevel < quantity || product.availability === 'Out of Stock') {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock or has insufficient quantity'
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ email });
        if (!cart) {
            cart = new Cart({ email, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.type === 'store' && item.itemName === itemName
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                type: 'store',
                itemName: product.itemName,
                image: product.image,
                unitPrice: product.unitPrice,
                quantity: quantity
            });
        }

        await cart.save();
        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add custom cake to cart
router.post('/cart/add-cake', async (req, res) => {
    try {
        const { email, cakeDetails } = req.body;

        if (!email || !cakeDetails) {
            return res.status(400).json({
                success: false,
                message: 'Email and cake details are required'
            });
        }

        let cart = await Cart.findOne({ email });
        if (!cart) {
            cart = new Cart({ email, items: [] });
        }

        cart.items.push({
            type: 'cake',
            ...cakeDetails
        });

        await cart.save();
        res.status(200).json({
            success: true,
            message: 'Custom cake added to cart successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update item quantity
router.put('/cart/update-quantity', async (req, res) => {
    try {
        const { email, itemId, quantity } = req.body;

        if (!email || !itemId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Email, item ID, and quantity are required'
            });
        }

        const cart = await Cart.findOne({ email });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        if (item.type === 'store') {
            // Check inventory for store items
            const product = await Inventory.findOne({ itemName: item.itemName });
            if (quantity > product.stockLevel) {
                return res.status(400).json({
                    success: false,
                    message: 'Requested quantity exceeds available stock'
                });
            }
        }

        item.quantity = quantity;
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Quantity updated successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Remove item from cart
router.delete('/cart/remove-item', async (req, res) => {
    try {
        const { email, itemId } = req.body;

        if (!email || !itemId) {
            return res.status(400).json({
                success: false,
                message: 'Email and item ID are required'
            });
        }

        const cart = await Cart.findOne({ email });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
