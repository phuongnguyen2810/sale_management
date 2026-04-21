const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "https://via.placeholder.com/150" },
    categories: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true
    }],
    description: { type: String, trim: true },
    stock: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);