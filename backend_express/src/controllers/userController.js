const User = require('../models/User');
const Order = require('../models/Order'); // Phải gọi bảng Order vào để đếm đơn hàng

// Đăng ký người dùng mới
exports.createUser = async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: 'customer' // ÉP CỨNG Ở ĐÂY, ai đăng ký cũng chỉ là khách!
        });
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: "Lỗi đăng ký: " + error.message });
    }
};

// Lấy danh sách tất cả người dùng (Kèm thống kê VIP)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Ẩn mật khẩu

        // Dùng Promise.all để lặp qua từng user và đi đếm đơn hàng
        const usersWithStats = await Promise.all(users.map(async (user) => {
            
            // Tìm tất cả đơn hàng của user này (Bỏ qua những đơn đã Hủy)
            const userOrders = await Order.find({ 
                user: user._id, 
                status: 'Delivered',
            });

            // Tính tổng số đơn
            const totalOrders = userOrders.length;
            
            // Tính tổng tiền bằng hàm reduce
            const totalSpent = userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

            // Trả về một Object mới gom cả thông tin User lẫn Thống kê
            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                totalOrders: totalOrders,
                totalSpent: totalSpent
            };
        }));

        // Trả danh sách xịn này về cho Front-end
        res.json(usersWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Tlogins
exports.login = async (req, res) => {
    try {
        // Tìm user có email và password khớp với dữ liệu gửi lên
        const user = await User.findOne({ email: req.body.email, password: req.body.password });
        
        if (user) {
            // Trả về thông tin user (đặc biệt là cái _id)
            res.json({ 
                message: "Đăng nhập thành công", 
                user: { id: user._id, role: user.role, username: user.username } 
            });
        } else {
            res.status(401).json({ message: "Sai email hoặc mật khẩu!" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm vào cuối userController.js

// Cập nhật người dùng
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.json({ message: "Xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy 1 người dùng theo ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};