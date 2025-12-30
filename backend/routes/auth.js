import express from 'express';
import jwt from 'jsonwebtoken';
import { loginLimiter } from '../middleware/rateLimiter.js';
import validatePassword from '../middleware/validatePassword.js';
import Customer from '../models/customer.model.js';
import { upload } from '../config/profileImageConfig.js';

const router = express.Router();

// Register with profile image upload
router.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
        const {
            firstName, lastName, username, email, password,
            address, phone
        } = req.body;

        // Input validation
        if (!firstName?.trim() || !lastName?.trim() || !username?.trim() || 
            !email?.trim() || !password?.trim() || !address?.trim() || !phone?.trim()) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Password validation
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ message: 'Password validation failed', errors: passwordErrors });
        }

        // Check if user exists
        const existingUser = await Customer.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email or username'
            });
        }

        // Get profile image path if uploaded
        const profilePicture = req.file ? `/uploads/profile_images/${req.file.filename}` : null;

        // Create new customer
        const customer = new Customer({
            firstName,
            lastName,
            username,
            email,
            password,
            address,
            phone,
            profilePicture
        });

        await customer.save();

        // Create token
        const token = jwt.sign(
            { userId: customer._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: customer._id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                username: customer.username,
                address: customer.address,
                phone: customer.phone,
                profilePicture: customer.profilePicture
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error in registration',
            error: error.message
        });
    }
});

// Login with rate limiting
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const customer = await Customer.findOne({ email });
        if (!customer) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password (direct comparison since we're not hashing)
        if (password !== customer.password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Create token
        const token = jwt.sign(
            { userId: customer._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: customer._id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                username: customer.username,
                address: customer.address,
                phone: customer.phone,
                profilePicture: customer.profilePicture
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error in login',
            error: error.message
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// Update profile picture
router.put('/profile-picture', upload.single('profileImage'), async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming auth middleware sets this
        
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const profilePicture = `/uploads/profile_images/${req.file.filename}`;
        
        const customer = await Customer.findByIdAndUpdate(
            userId,
            { profilePicture },
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json({
            message: 'Profile picture updated successfully',
            profilePicture: customer.profilePicture
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error updating profile picture',
            error: error.message
        });
    }
});

export default router;





