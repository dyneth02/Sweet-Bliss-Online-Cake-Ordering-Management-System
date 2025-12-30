import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    stockLevel: {
        type: Number,
        required: true,
    },
    availability: {
        type: String,
        required: true,
    }
});

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export default Inventory;
