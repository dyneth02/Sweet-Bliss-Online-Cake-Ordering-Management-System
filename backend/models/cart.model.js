import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    items: [{
        type: {
            type: String,
            required: true,
            enum: ['store', 'cake']
        },
        itemName: String,
        image: String,
        unitPrice: Number,
        quantity: Number,
        // Custom cake specific fields
        natureOfEvent: String,
        baseTypeOfCake: String,
        dateOfRequirement: Date,
        cakeSize: String,
        baseColors: [String],
        pickupOption: String,
        toppings: [String],
        writingsOnTop: String,
        imageUrl: String,
        additionalNotes: String,
        price: Number
    }],
    totalAmount: {
        type: Number,
        default: 0
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

// Calculate total amount before saving
CartSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => {
        if (item.type === 'store') {
            return total + (item.unitPrice * item.quantity);
        } else {
            return total + item.price;
        }
    }, 0);
    this.updatedAt = new Date();
    next();
});

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;
