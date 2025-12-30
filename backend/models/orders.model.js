import mongoose from 'mongoose';
const { Schema } = mongoose;

const baseItemSchema = new Schema({
    quantity: { type: Number, required: true, min: 1 }
}, {
    discriminatorKey: 'itemType',
    _id: false
});

const orderSchema = new Schema({
    user_email:   { type: String, ref: 'User', required: true },
    items: {
        type: [baseItemSchema],
        validate: [arr => arr.length > 0, 'At least one item is required']
    },
    total_price:  { type: Number, required: true, min: 0 },
    status:       { type: String, enum: ['pending','completed'], default: 'pending' },
    order_date:   { type: Date,   required: true }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderSchema.path('items').discriminator('CakeItem', new Schema({
    natureOfEvent:    { type: String, required: true },
    baseTypeOfCake:   { type: String, required: true },
    dateOfRequirement:{ type: Date,   required: true },
    cakeSize:         { type: String, required: true },
    baseColors:       { type: [String], default: [] },
    pickupOption:     { type: String, required: true },
    toppings:         { type: [String], default: [] },
    writingsOnTop:    { type: String, default: '' },
    imageUrl:         { type: String, default: '' },
    additionalNotes:  { type: String, default: '' },
    price:            { type: Number, required: true, min: 0 }
}, { _id: false }));

orderSchema.path('items').discriminator('InventoryItem', new Schema({
    itemName:    { type: String, required: true },
    image:       { type: String, required: true },
    price:   { type: Number, required: true },
    quantity:  { type: Number, required: true }
}, { _id: false }));

const Order = mongoose.model('Order', orderSchema);

export default Order;
