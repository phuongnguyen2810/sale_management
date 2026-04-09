const Product = require('../models/Product');

// Hàm thêm sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        // Tạo một đối tượng mới từ dữ liệu người dùng gửi (req.body)
        const product = new Product(req.body);
        
        // Lệnh này chính là lúc nó kết nối localhost:27017 để lưu
        const savedProduct = await product.save();
        
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: "Lỗi rồi: " + error.message });
    }
};

// Hàm lấy danh sách sản phẩm (Để sau này hiện lên Web)
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};