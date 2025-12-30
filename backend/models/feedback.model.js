import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    image: {
        type: String,  // Store the image URL/path
        default: null
    },
    verifiedPurchase: {
        type: Boolean,
        default: true
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    user_email: {
        type: String,
        ref: 'Customer',
        required: true
    },
    isReported: {
        type: Boolean,
        default: false
    },
    reportDetails: {
        reason: {
            type: String,
            enum: ['Inappropriate content', 'Fake review', 'Spam', 'Harassment', 'False information', 'Other'],
            default: null
        },
        reportedAt: {
            type: Date,
            default: null
        },
        reportedBy: {
            type: String,  // email of the user who reported
            default: null
        },
        status: {
            type: String,
            enum: ['clean', 'reported', 'hidden'],
            default: 'clean'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
feedbackSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Create indexes for better query performance
feedbackSchema.index({ user_email: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ rating: -1 });
feedbackSchema.index({ isReported: 1 }); // Add index for reported feedbacks_Images

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
