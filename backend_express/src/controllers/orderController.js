const Order = require('../models/Order');
const Product = require('../models/Product'); // Phải gọi model Product để tra giá

exports.addOrder = async (req, res) => {
    try {
        const { user, products, shippingAddress, receiverName, phone, deliveryDate, deliveryTime, notes } = req.body;
        let calculatedTotal = 0;;

        // 1. LẶP QUA TỪNG SẢN PHẨM KHÁCH MUA
        for (let item of products) {
            // Tìm sản phẩm trong DB bằng ID
            const productDB = await Product.findById(item.product);
            
            if (!productDB) {
                return res.status(400).json({ message: "Có sản phẩm không tồn tại!" });
            }
            
            // 2. KIỂM TRA TỒN KHO TRƯỚC KHI BÁN
            if (productDB.stock < item.quantity) {
                return res.status(400).json({ message: `Sản phẩm ${productDB.name} chỉ còn ${productDB.stock} cái trong kho.` });
            }

            // 3. TỰ TÍNH TIỀN (Giá DB * Số lượng)
            calculatedTotal += productDB.price * item.quantity;

            // 4. TRỪ HÀNG TRONG KHO
            productDB.stock -= item.quantity;
            await productDB.save(); // Lưu lại số lượng mới
        }

        // 5. TẠO ĐƠN HÀNG VỚI TỔNG TIỀN ĐÃ TÍNH VÀ ĐẦY ĐỦ THÔNG TIN GIAO HÀNG
        const newOrder = new Order({
            user: user,
            products: products,
            totalAmount: calculatedTotal,
            shippingAddress: shippingAddress,
            receiverName: receiverName, // Thêm dòng này
            phone: phone,               // Thêm dòng này
            deliveryDate: deliveryDate, // Thêm dòng này
            deliveryTime: deliveryTime, // Thêm dòng này
            notes: notes                // Thêm dòng này
        });

        await newOrder.save();
        res.status(201).json({ message: "Đặt hàng thành công!", order: newOrder });

    } catch (error) {
        // Mẹo: Sửa chữ "Lỗi hệ thống" thành error.message để lần sau nó báo rõ lỗi gì ra màn hình luôn
        res.status(500).json({ message: "Lỗi hệ thống: " + error.message }); 
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')
            .populate('products.product', 'name price image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        res.json({ message: "Cập nhật thành công", updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        // 1. TÌM ĐƠN HÀNG TRƯỚC KHI XÓA (Để lấy danh sách sản phẩm đã mua)
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng để hủy" });
        }

        // 2. LẶP QUA TỪNG SẢN PHẨM TRONG ĐƠN VÀ CỘNG LẠI VÀO KHO
        for (let item of order.products) {
            const productDB = await Product.findById(item.product);
            
            if (productDB) {
                // Cộng lại số lượng khách đã đặt trả về kho
                productDB.stock += item.quantity; 
                await productDB.save();
            }
        }

        // 3. SAU KHI ĐÃ TRẢ HÀNG XONG XUÔI, MỚI TIẾN HÀNH XÓA ĐƠN
        await Order.findByIdAndDelete(req.params.id);
        
        res.json({ message: "Đã hủy đơn và hoàn trả số lượng vào kho thành công!" });

    } catch (err) {
        res.status(500).json({ message: "Lỗi khi hủy đơn: " + err.message });
    }
};


// API dành cho User tự hủy đơn hàng của mình
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
        }

        // 1. KIỂM TRA TRẠNG THÁI: Chỉ cho hủy nếu đang Pending
        if (order.status !== 'Pending') {
            return res.status(400).json({ message: "Không thể hủy! Đơn hàng này đã được shop xử lý." });
        }

        // 2. TRẢ HÀNG VỀ KHO
        for (let item of order.products) {
            const productDB = await Product.findById(item.product);
            if (productDB) {
                productDB.stock += item.quantity; 
                await productDB.save();
            }
        }

        // 3. ĐỔI TRẠNG THÁI THÀNH "ĐÃ HỦY"
        order.status = 'Canceled';
        await order.save();

        res.json({ message: "Đã hủy đơn hàng thành công!", order });

    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .populate('products.product', 'name price image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};