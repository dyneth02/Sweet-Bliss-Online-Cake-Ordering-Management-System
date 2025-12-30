import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose"
import cors from "cors";
import customerCakes from "./routes/cakeOrder.js";
import customerOrders from "./routes/customerOrderView.js";
import storeRoutes from "./routes/StoreRoutes.js";
import cartRoutes from "./routes/CartRoutes.js";
import InventoryRoutes from "./routes/adminInventoryView.js";
import feedbackRoutes from './routes/feedbackRoutes.js';
import auth from "./routes/auth.js";
import authMiddleware from './middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import adminFeedbacksView from './routes/adminFeedbacksView.js';
import paymentRoutes from './routes/paymentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import OrderRouter from './routes/adminOrdersView.js';
import CakeRouter from './routes/adminCakesView.js';
import contactRoutes from './routes/contactRoutes.js';
import vacationModeRouter from './routes/vacationMode.js';
import aiDesignRoutes from './routes/aiDesignRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const server = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async ()=>{
    try{
        await mongoose.connect(MONGO_URI,{
        });
        console.log("🔥 MongoDB Connected Successfully!");
    }
     catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
    }
};

connectDB();

server.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Add both possible Vite default ports
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

server.use(express.json({ limit: '50mb' }));

// Serve static files from uploads directory
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from public directory
server.use(express.static(path.join(__dirname, 'public')));

// Public routes
server.use("/auth", auth);
server.use("/admin", contactRoutes);

// Protected routes
server.use("/customer", feedbackRoutes);
server.use("/customer", storeRoutes);
server.use("/customer", customerCakes);
server.use("/customer", customerOrders);
server.use("/customer", orderRoutes);
server.use("/admin", OrderRouter);
server.use("/admin", CakeRouter);
server.use("/admin", InventoryRoutes);
server.use("/admin", adminFeedbacksView);
server.use("/api", cartRoutes);
server.use("/payment", paymentRoutes);
server.use('/api/vacation-mode', vacationModeRouter);
server.use('/api/ai-design', aiDesignRoutes);

server.get("/", (req, res) => {
    res.send("<h1>Sweet Bliss</h1>");
})

server.listen(PORT, (error) => {
    if (!error) {
        console.log(`Server is running on port ${PORT}`);
    } else {
        console.error("Error starting server:", error);
    }
});
