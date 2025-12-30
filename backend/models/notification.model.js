import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    email: {
        type: Number,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    type: {
        type: Number,
        required: true,
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
