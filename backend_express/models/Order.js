const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Liên kết tới Model User
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Liên kết tới Model Product
            quantity: { type: Number, default: 1 }
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered'], default: 'Pending' },
    shippingAddress: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);