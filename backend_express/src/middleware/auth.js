const User = require('../models/User'); // Gọi bảng User vào

exports.isAdmin = async (req, res, next) => {
    try {
        // 1. Chỉ lấy ID người dùng từ Front-end gửi lên
        const userId = req.headers['x-user-id']; 

        if (!userId) {
            return res.status(401).json({ message: "Vui lòng đăng nhập!" });
        }

        // 2. Tự xuống Database tìm ông user này
        const userDB = await User.findById(userId);

        // 3. Kiểm tra quyền thật sự trong Database
        if (userDB && userDB.role === 'admin') {
            next(); // Đúng là admin "auth" -> Cho phép làm tiếp
        } else {
            // Dù F12 có sửa thành admin, nhưng DB vẫn là customer thì chặn ngay
            res.status(403).json({ message: "Phát hiện gian lận! Bạn không có quyền Admin thật sự." });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống xác thực" });
    }
};