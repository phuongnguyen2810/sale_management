const userId = localStorage.getItem('userId');

if (!userId) {
    alert("Bạn cần đăng nhập để xem trang này!");
    window.location.href = 'login.html';
}

// 1. Lấy thông tin cá nhân
async function fetchUserProfile() {
    try {
        const res = await fetch(`http://localhost:5000/api/users/user/${userId}`);
        if (res.ok) {
            const user = await res.json();
            document.getElementById('displayUsername').innerText = user.username;
            document.getElementById('pUsername').innerText = user.username;
            document.getElementById('pEmail').innerText = user.email;
            document.getElementById('pRole').innerHTML = `<i class="fa-solid fa-shield-halved me-1"></i> ` + user.role;
            
            // Lấy chữ cái đầu làm Avatar
            document.getElementById('avatarLetter').innerText = user.username.charAt(0).toUpperCase();
        }
    } catch (err) { console.error(err); }
}

// 2. Lấy danh sách đơn hàng
async function fetchMyOrders() {
    try {
        const res = await fetch(`http://localhost:5000/api/orders/user/${userId}`);
        const orders = await res.json();
        const tbody = document.getElementById('myOrdersTable');
        
        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <i class="fa-solid fa-receipt text-muted" style="font-size: 3rem; opacity: 0.3;"></i>
                        <h6 class="mt-3 fw-bold text-muted">Chưa có đơn hàng nào</h6>
                        <p class="text-muted small">Bạn hãy ra trang chủ mua sắm nhé!</p>
                    </td>
                </tr>`;
            return;
        }

        // Cấu hình UI cho các Trạng thái bằng Class của Bootstrap
        const statusConfig = {
            'Pending': { text: 'Chờ duyệt', class: 'bg-warning text-dark' },
            'Processing': { text: 'Đang đóng gói', class: 'bg-info text-white' },
            'Shipped': { text: 'Đang giao hàng', class: 'bg-primary text-white' },
            'Delivered': { text: 'Đã nhận', class: 'bg-success text-white' },
            'Canceled': { text: 'Đã hủy', class: 'bg-secondary text-white text-decoration-line-through' }
        };

        tbody.innerHTML = orders.map(order => {
            const productList = order.products.map(p => 
                `<div class="text-truncate" style="max-width: 200px;">
                    <span class="text-primary fw-bold">x${p.quantity}</span> 
                    ${p.product ? p.product.name : '<span class="text-muted">Sản phẩm đã xóa</span>'}
                </div>`
            ).join('');
            
            const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN');
            const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
            const currentStatus = statusConfig[order.status] || { text: order.status, class: 'bg-dark text-white' };

            // Nút Hủy tinh tế hơn
            let actionButton = '';
            if (order.status === 'Pending') {
                actionButton = `
                    <button onclick="cancelMyOrder('${order._id}')" class="btn btn-sm btn-outline-danger rounded-pill mt-2 px-3 fw-bold shadow-sm" style="font-size: 0.75rem;">
                        <i class="fa-solid fa-ban me-1"></i>Hủy đơn
                    </button>`;
            }

            return `
                <tr>
                    <td><span class="order-id">#${order._id.substring(order._id.length - 6).toUpperCase()}</span></td>
                    <td><div class="small">${productList}</div></td>
                    <td class="text-end fw-bold text-danger">${order.totalAmount.toLocaleString('vi-VN')} ₫</td>
                    <td>
                        <div class="small">
                            <div class="text-muted"><i class="fa-regular fa-calendar me-1"></i> Đặt: ${orderDate}</div>
                            <div class="text-primary mt-1"><i class="fa-solid fa-truck me-1"></i> Giao: ${deliveryDate}</div>
                        </div>
                    </td>
                    <td class="text-center">
                        <span class="badge rounded-pill ${currentStatus.class} px-3 py-2 shadow-sm">${currentStatus.text}</span>
                        <div class="mt-1">${actionButton}</div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) { 
        document.getElementById('myOrdersTable').innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4 fw-bold"><i class="fa-solid fa-triangle-exclamation me-2"></i>Lỗi tải dữ liệu!</td></tr>';
    }
}

// Hàm gọi API hủy đơn
async function cancelMyOrder(orderId) {
    if (confirm("⚠️ Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/cancel/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await res.json();
            
            if (res.ok) {
                alert("✅ " + data.message);
                fetchMyOrders(); 
            } else {
                alert("❌ Lỗi: " + data.message);
            }
        } catch (err) {
            alert("Lỗi kết nối Server!");
        }
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// Khởi động
fetchUserProfile();
fetchMyOrders();