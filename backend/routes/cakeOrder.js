import express from 'express';
import Cake from '../models/cakes.model.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const CakeRouter = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};

// Configure multer for cake image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/cake_images';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, "cake_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'));
        }
    }
});

//Get a cake
CakeRouter.get("/cakes/:email", async (req, res) => {
    const cakeId = req.params.id;

    if (!cakeId) {
        return res.status(400).json({message: "Please provide a cake id"});
    }

    try {
        const Cake = await Cake.find({ "_id": cakeId })
        res.status(200).json(Cake);
    }
    catch (error) {
        res.status(400).json({message: error.message});
    }
})

//Create a cake with image upload
CakeRouter.post("/create_cake", upload.single('image'), async (req, res) => {
    try {
        const {
            user_email,
            natureOfEvent,
            baseTypeOfCake,
            dateOfRequirement,
            cakeSize,
            baseColors,
            pickupOption,
            toppings,
            writingsOnTop,
            additionalNotes,
            price
        } = req.body;

        // Validate required fields
        if (!user_email || !natureOfEvent || !baseTypeOfCake || !dateOfRequirement || !cakeSize) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ 
                success: false,
                message: "Please provide all required fields" 
            });
        }

        let parsedBaseColors, parsedToppings;

        try {
            parsedBaseColors = JSON.parse(baseColors);
            parsedToppings = JSON.parse(toppings);

            // Validate that they are arrays
            if (!Array.isArray(parsedBaseColors) || !Array.isArray(parsedToppings)) {
                throw new Error('baseColors and toppings must be arrays');
            }
        } catch (parseError) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: `Invalid format for arrays: ${parseError.message}`
            });
        }

        const newCake = new Cake({
            user_email,
            natureOfEvent,
            baseTypeOfCake,
            dateOfRequirement,
            cakeSize,
            baseColors: parsedBaseColors,
            pickupOption,
            toppings: parsedToppings,
            writingsOnTop,
            imageUrl: req.file ? `/uploads/cake_images/${req.file.filename}` : '',
            additionalNotes,
            price: Number(price)
        });

        await newCake.save();

        res.status(201).json({
            success: true,
            message: "Cake Created Successfully",
            data: newCake
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ 
            success: false,
            message: `This Error is from backend : ${error.message}` 
        });
    }
});

//Get a specific user's Cake to the cart
CakeRouter.get("/get_cake/:user_email", async (req, res) => {
    const { user_email } = req.params;

    if (!user_email) {
        return res.status(400).json({ message: "User email is required" });
    }

    try {
        const userCake = await Cake.find({ user_email:user_email });

        if (userCake.length === 0) {
            return res.status(404).json({ message: "No orders found for this user" });
        }

        res.status(200).json({ success: true, data: userCake });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default CakeRouter;
