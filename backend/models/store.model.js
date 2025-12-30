import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
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
    status: {
        type: String,
        required: true,
    }
});

const Store = mongoose.model('Store', StoreSchema);
export default Store;
