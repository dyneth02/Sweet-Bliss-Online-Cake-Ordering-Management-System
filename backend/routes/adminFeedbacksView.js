import express from 'express';
import Feedback from '../models/feedback.model.js';

const FeedbackRouter = express.Router();

// Get latest non-reported feedbacks - Place this BEFORE the /:id route
FeedbackRouter.get("/feedbacks/latest", async (req, res) => {
    try {
        const latestFeedbacks = await Feedback.find({ isReported: false })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('userName description rating createdAt');
        
        res.status(200).json({
            success: true,
            data: latestFeedbacks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching latest feedbacks",
            error: error.message
        });
    }
});

// Get all feedbacks
FeedbackRouter.get("/feedbacks", async (req, res) => {
    try {
        const allFeedbacks = await Feedback.find({})
            .sort({ createdAt: -1 }); // Sort by newest first
        
        res.status(200).json(allFeedbacks);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching feedbacks",
            error: error.message
        });
    }
});

// Get feedback by ID - Place this AFTER the /latest route
FeedbackRouter.get("/feedbacks/:id", async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching feedback",
            error: error.message
        });
    }
});

// Delete feedback
FeedbackRouter.delete("/feedbacks/:id", async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        // If feedback has an image, you might want to delete it from storage here
        if (feedback.image) {
            // Add image deletion logic here if needed
        }

        res.status(200).json({
            message: "Feedback deleted successfully",
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting feedback",
            error: error.message
        });
    }
});

// Update feedback report status
FeedbackRouter.put("/feedbacks/:id/report", async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, reportedBy, status } = req.body;

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            {
                isReported: true,
                reportDetails: {
                    reason,
                    reportedBy,
                    status,
                    reportedAt: new Date()
                }
            },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        res.status(200).json({
            message: "Feedback report status updated successfully",
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating feedback report status",
            error: error.message
        });
    }
});

// Update feedback status (approve/reject reported feedback)
FeedbackRouter.put("/feedbacks/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be 'approved', 'rejected', or 'pending'"
            });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            {
                'reportDetails.status': status,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        res.status(200).json({
            message: "Feedback status updated successfully",
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating feedback status",
            error: error.message
        });
    }
});

// Clear report status
FeedbackRouter.put("/feedbacks/:id/clear-report", async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            {
                isReported: false,
                reportDetails: {
                    reason: null,
                    reportedBy: null,
                    status: 'clean',
                    reportedAt: null
                }
            },
            { new: true }
        );

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        res.status(200).json({
            message: "Report cleared successfully",
            data: feedback
        });
    } catch (error) {
        res.status(500).json({
            message: "Error clearing report",
            error: error.message
        });
    }
});

// Get count of reported feedbacks
FeedbackRouter.get("/feedbacks/reported/count", async (req, res) => {
    try {
        const count = await Feedback.countDocuments({ isReported: true });
        
        res.status(200).json({
            success: true,
            count: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching reported feedback count",
            error: error.message
        });
    }
});

export default FeedbackRouter;




