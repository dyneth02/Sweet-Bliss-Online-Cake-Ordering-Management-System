import express from 'express';
import Feedback from '../models/feedback.model.js';
import upload from '../config/multerConfig.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/feedbacks';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Get all feedbacks
router.get('/feedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({})
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: feedbacks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching feedbacks',
            error: error.message
        });
    }
});

// Create new feedback with image upload
router.post('/add_feedbacks', upload.single('image'), async (req, res) => {
    try {
        const { userName, description, rating, user_email } = req.body;

        // Validate required fields
        if (!userName || !description || !rating || !user_email) {
            // If there's an uploaded file, delete it
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Create feedback object
        const feedbackData = {
            userName,
            description,
            rating: Number(rating),
            user_email,
            // Update the image path to match multer config
            image: req.file ? `/uploads/feedbacks_Images/${req.file.filename}` : null
        };

        const feedback = new Feedback(feedbackData);
        await feedback.save();

        res.status(201).json({
            success: true,
            message: 'Feedback added successfully',
            data: feedback
        });
    } catch (error) {
        // If there's an uploaded file, delete it on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error adding feedback',
            error: error.message
        });
    }
});

// Delete feedback
router.delete('/delete_feedbacks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const feedback = await Feedback.findById(id);
        
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        // Delete associated image if it exists
        if (feedback.image) {
            // Update the path to match the correct directory
            const imagePath = path.join(process.cwd(), 'uploads', 'feedbacks_Images', 
                path.basename(feedback.image));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await feedback.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Feedback and associated image deleted successfully',
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting feedback',
            error: error.message
        });
    }
});

// Update feedback status
router.put('/update_feedbacks/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason, reportedBy } = req.body;

        if (!['hide', 'clean'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be either "hide" or "clean"'
            });
        }

        const status = action === 'hide' ? 'hidden' : 'clean';

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id,
            {
                $set: {
                    isReported: true, // Set isReported to true
                    'reportDetails.status': status,
                    'reportDetails.reason': reason,
                    'reportDetails.reportedBy': reportedBy,
                    'reportDetails.reportedAt': new Date(), // Add reportedAt timestamp
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (!updatedFeedback) {
            return res.status(404).json({
                success: false,
                message: 'Feedback not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Feedback status updated successfully',
            data: updatedFeedback
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating feedback status',
            error: error.message
        });
    }
});

export default router;






