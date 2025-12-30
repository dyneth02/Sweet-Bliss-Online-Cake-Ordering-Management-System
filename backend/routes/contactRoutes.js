import express from 'express';
import Contact from '../models/Contact.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// POST /contact - Submit a new contact form
router.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Create new contact entry
        const contact = new Contact({
            name,
            email,
            subject,
            message
        });

        // Save to database
        await contact.save();

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully!',
            data: contact
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// GET /contact - Get all contact submissions (admin only)
router.get('/contact', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        // Get all contacts, sorted by creation date (newest first)
        const contacts = await Contact.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact submissions',
            error: error.message
        });
    }
});

// PUT /contact/:id - Update contact status (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { status } = req.body;
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        // Update status and response date if status is changed to 'responded' or 'resolved'
        contact.status = status;
        if (['responded', 'resolved'].includes(status)) {
            contact.responseDate = new Date();
        }

        await contact.save();

        res.status(200).json({
            success: true,
            message: 'Contact status updated successfully',
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update contact status',
            error: error.message
        });
    }
});

export default router; 