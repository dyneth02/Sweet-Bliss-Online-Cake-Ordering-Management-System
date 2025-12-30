import express from 'express';
import Cake from '../models/cakes.model.js';

const CakeRouter = express.Router();

// Get all cakes
CakeRouter.get("/cakes", async (req, res) => {
    try {
        const allCakes = await Cake.find({})
            .sort({ createdAt: -1 }); // Sort by creation date, newest first
        res.status(200).json({
            success: true,
            data: allCakes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get cake by ID
CakeRouter.get("/cakes/:id", async (req, res) => {
    try {
        const cake = await Cake.findById(req.params.id);
        if (!cake) {
            return res.status(404).json({
                success: false,
                message: "Cake not found"
            });
        }
        res.status(200).json({
            success: true,
            data: cake
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update cake status
CakeRouter.put("/cakes/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const cake = await Cake.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!cake) {
            return res.status(404).json({
                success: false,
                message: "Cake not found"
            });
        }
        res.status(200).json({
            success: true,
            data: cake
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete cake
CakeRouter.delete("/cakes/:id", async (req, res) => {
    try {
        const cake = await Cake.findByIdAndDelete(req.params.id);
        if (!cake) {
            return res.status(404).json({
                success: false,
                message: "Cake not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Cake deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default CakeRouter;