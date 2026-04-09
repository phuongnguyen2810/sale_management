const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Sau này mình sẽ mã hóa cái này
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);