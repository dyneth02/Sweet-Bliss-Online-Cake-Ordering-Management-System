import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    CardNum: {
        type: String,
        required: true,
        unique: true
    },
    expiryDate: {
        type: String,
        required: true
    },
    cvv: {
        type: String,
        required: true
    }
});

const Card = mongoose.model('Card', cardSchema);

export default Card;