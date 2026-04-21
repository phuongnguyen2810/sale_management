// 1. Khai báo các thư viện
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Dòng này cực quan trọng để đọc file .env

const app = express();

// 2. Middleware (Các phần mềm trung gian)
app.use(cors()); // Cho phép Front-end truy cập vào Back-end
app.use(express.json()); // Cho phép Server đọc được dữ liệu JSON gửi lên

// 3. Kết nối MongoDB
const uri = process.env.MONGODB_URI; // Lấy link từ file .env
mongoose.connect(uri)
    .then(() => console.log("✅ Kết nối MongoDB thành công !"))
    .catch(err => console.error("❌ Lỗi kết nối DB rồi:", err));




// 4. Định nghĩa Route 
app.use('/api/products', require('./src/routes/productRoutes')); // Bổ sung dòng này
app.use('/api/users', require('./src/routes/userRoutes'));   // Bổ sung dòng này
app.use('/api/orders', require('./src/routes/orderRoutes')); // Bổ sung dòng này
app.use('/api/categories', require('./src/routes/categoryRoutes'));

// 5. Khởi chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang bay tại cổng: http://localhost:${PORT}`);
});