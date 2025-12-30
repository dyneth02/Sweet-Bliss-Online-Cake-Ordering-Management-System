import express from 'express';
import Inventory from "../models/inventory.model.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/item_Images';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null,"item_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (validTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
        }
    }
});

router.get('/inventory',async (req,res)=>{
    try{
        const allItems = await Inventory.find({});
        if(!allItems){
            return res.status(404).json({message:"No inventory found"});
        }
        res.status(200).json(allItems);
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message});
    }
});

router.delete('/inventory/:id',async (req,res)=>{
    try{
        const Items = await Inventory.findByIdAndDelete({_id:req.params.id});
        if(!Items){
            return res.status(404).json({message:"Item not Found"});
        }
        res.status(200).json(Items);
    }
    catch(err){
        res.status(500).json({message:"Something went wrong", error:err.message});
    }
});
router.post('/inventory', upload.single('image'), async (req, res) => {
    try {
        const { itemName, unitPrice, stockLevel, availability } = req.body;
        
        if (!itemName || !unitPrice || !stockLevel || !availability) {
            // Delete uploaded file if validation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const imagePath = req.file ? `/uploads/item_Images/${req.file.filename}` : null;

        const newInventory = new Inventory({
            itemName,
            image: imagePath,
            unitPrice,
            stockLevel,
            availability
        });

        await newInventory.save();
        res.status(201).json({
            success: true,
            message: "Item added successfully",
            data: newInventory
        });
    } catch (err) {
        // Delete uploaded file if save fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: err.message
        });
    }
});
router.put('/inventory/update/:id', upload.single('image'), async (req, res) => {
    try {
        const { itemName, unitPrice, stockLevel, availability } = req.body;
        
        // Prepare update data
        const updateData = {
            itemName,
            unitPrice,
            stockLevel,
            availability
        };

        // If a new image was uploaded, add it to the update data
        if (req.file) {
            updateData.image = `/uploads/item_Images/${req.file.filename}`;
            
            // Optionally: Delete the old image file here
            const oldItem = await Inventory.findById(req.params.id);
            if (oldItem && oldItem.image && !oldItem.image.includes('https')) {
                const oldImagePath = path.join(process.cwd(), oldItem.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const updateInventory = await Inventory.findByIdAndUpdate(
            req.params.id, 
            updateData,
            { new: true }
        );

        if (!updateInventory) {
            // Delete uploaded file if update fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ 
                success: false, 
                message: "Inventory not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Inventory updated successfully", 
            data: updateInventory 
        });
    } catch (e) {
        // Delete uploaded file if there's an error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error(e);
        res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: e.message 
        });
    }
});

router.get('/inventory/low-stock/count', async (req, res) => {
    try {
        const count = await Inventory.countDocuments({ stockLevel: { $lte: 10 } });
        
        res.status(200).json({
            success: true,
            count: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching low stock count",
            error: error.message
        });
    }
});

export default router;
