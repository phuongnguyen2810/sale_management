const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 }
        }
    ],
    totalAmount: { type: Number, required: true },
    
    // --- CÁC TRƯỜNG MỚI CẦN BỔ SUNG ---
    receiverName: { type: String, required: true }, // Tên người nhận
    phone: { type: String, required: true },        // Số điện thoại
    shippingAddress: { type: String, required: true }, // Địa chỉ chi tiết
    deliveryDate: { type: Date, required: true },   // Ngày giao hàng
    deliveryTime: { type: String },                 // Giờ giao hàng (08:30, 14:00...)
    notes: { type: String },                        // Ghi chú thêm
    // ---------------------------------

    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'], default: 'Pending' }
}, { timestamps: true }); // timestamps sẽ tự tạo createdAt và updatedAt cho bạn

module.exports = mongoose.model('Order', orderSchema);