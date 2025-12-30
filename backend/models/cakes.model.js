import mongoose from 'mongoose';
const { Schema } = mongoose;

const cakeSchema = new Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    user_email: {
        type: String,
        required: true,
    },
    natureOfEvent: {
        type: String,
        required: true
    },

    baseTypeOfCake: {
        type: String,
        required: true
    },

    dateOfRequirement: {
        type: Date,
        required: true
    },

    cakeSize: {
        type: String,
        required: true
    },

    baseColors: {
        type: [String],
        default: []
    },

    pickupOption: {
        type: String,
        required: true
    },

    toppings: {
        type: [String],
        default: []
    },

    writingsOnTop: {
        type: String,
        default: ''
    },

    imageUrl: {
        type: String,
        default: ''
    },

    additionalNotes: {
        type: String,
        default: ''
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    }

    ,createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the model from the schema
const Cake = mongoose.model('Cake', cakeSchema);

export default Cake;
