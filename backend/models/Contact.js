import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxLength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxLength: [1000, 'Message cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'responded', 'resolved'],
        default: 'pending'
    },
    responseDate: {
        type: Date
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact; 