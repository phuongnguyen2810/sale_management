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
        // Thêm .populate('category') vào đây!
        const products = await Product.find().populate('categories'); 
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hàm cập nhật (Sửa) thông tin sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        // Tìm sản phẩm theo ID (tự động tạo bởi MongoDB) và cập nhật dữ liệu mới từ req.body
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Tham số này giúp trả về dữ liệu MỚI sau khi đã sửa
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm để sửa" });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: "Lỗi cập nhật: " + error.message });
    }
};

// Hàm xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm để xóa" });
        }
        res.json({ message: "Đã xóa sản phẩm thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};