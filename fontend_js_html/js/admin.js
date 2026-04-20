const API_URL = 'http://localhost:5000/api/products';




// Hàm kiểm tra trạng thái khi vừa vào trang
async function checkAdminAuth() {
    const userId = localStorage.getItem('userId');
    const loginDiv = document.getElementById('adminLogin');
    const dashboardDiv = document.getElementById('adminDashboard');

    // 1. Nếu không có ID trong máy -> Bật màn hình Login luôn, miễn trình bày
    if (!userId) {
        loginDiv.style.display = 'flex';
        dashboardDiv.style.display = 'none';
        return;
    }

    try {
        // 2. Có ID rồi, nhưng phải hỏi Back-end xem ID này quyền gì
        const res = await fetch(`http://localhost:5000/api/users/user/${userId}`);
        const user = await res.json();

        // 3. Nếu Server xác nhận đúng là Admin
        if (res.ok && user.role === 'admin') {
            loginDiv.style.display = 'none';
            dashboardDiv.style.display = 'flex'; // Mở rèm Dashboard
            
            loadCategoriesToSelect(); // Tải dữ liệu vào
            loadProducts();
        } else {
            // Bắt quả tang F12 sửa quyền hoặc ID không phải admin
            alert("❌ Chống hack: Bạn không phải Admin thật sự!");
            localStorage.clear(); // Xóa sạch dấu vết gian lận
            
            loginDiv.style.display = 'flex'; // Ép quay lại màn hình Login
            dashboardDiv.style.display = 'none';
        }
    } catch (err) {
        // Lỗi mạng hoặc Server sập
        console.error("Lỗi xác thực:", err);
        loginDiv.style.display = 'flex';
        dashboardDiv.style.display = 'none';
    }
}

// 1. Hàm chuyển đổi giữa các mục quản lý
function showSection(sectionId) {
    document.getElementById('productSection').style.display = sectionId === 'productSection' ? 'block' : 'none';
    document.getElementById('categorySection').style.display = sectionId === 'categorySection' ? 'block' : 'none';
    document.getElementById('orderSection').style.display = sectionId === 'orderSection' ? 'block' : 'none';
    document.getElementById('userSection').style.display = sectionId === 'userSection' ? 'block' : 'none'; // Thêm dòng này
    
    document.getElementById('nav-prod').classList.toggle('active', sectionId === 'productSection');
    document.getElementById('nav-cat').classList.toggle('active', sectionId === 'categorySection');
    document.getElementById('nav-order').classList.toggle('active', sectionId === 'orderSection');
    document.getElementById('nav-user').classList.toggle('active', sectionId === 'userSection'); // Thêm dòng này

    if (sectionId === 'categorySection') loadCategoriesTable();
    if (sectionId === 'orderSection') loadOrdersTable();
    if (sectionId === 'userSection') loadUsersTable(); // Thêm dòng này để gọi dữ liệu User
}

// Xử lý sự kiện Đăng nhập ngay tại trang Admin
document.getElementById('loginForm').addEventListener('submit', async (e) => {
e.preventDefault();
const email = document.getElementById('adminEmail').value;
const password = document.getElementById('adminPassword').value;

try {
    const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.user.role === 'admin') {
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('username', data.user.username);
        
        alert("Chào Admin!");
        checkAdminAuth(); // Chuyển sang giao diện quản lý ngay lập tức
    } else {
        alert("❌ Bạn không có quyền truy cập khu vực này!");
    }
} catch (err) { alert("Lỗi kết nối server!"); }
});

//<!-- QUẢN LÝ SẢN PHẨM -->
// 1. TẢI DANH SÁCH SẢN PHẨM
async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/all`);
        let products = await res.json();

        // --- BẮT ĐẦU LỌC ---
        const searchInput = document.getElementById('productSearch');
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const categoryFilter = document.getElementById('productCategoryFilter');
        const selectedCat = categoryFilter ? categoryFilter.value : 'ALL';

        // 1. Lọc theo tên sản phẩm
        if (searchTerm !== '') {
            products = products.filter(p => p.name.toLowerCase().includes(searchTerm));
        }

        // 2. Lọc theo danh mục
        if (selectedCat !== 'ALL') {
            products = products.filter(p => 
                // Kiểm tra xem trong mảng categories của sản phẩm có chứa ID danh mục đang chọn không
                p.categories && p.categories.some(c => (c._id || c) === selectedCat)
            );
        }
        // --- KẾT THÚC LỌC ---

        const tbody = document.getElementById('productTableBody');
        tbody.innerHTML = '';
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có sản phẩm nào. Hãy thêm mới!</td></tr>';
            return;
        }
        products.forEach(p => {
            let catNames = p.categories && p.categories.length > 0 
                ? p.categories.map(c => `<span style="background:#eee; padding:3px 8px; border-radius:10px; font-size:12px; margin-right:5px;">${c.name || 'Lỗi'}</span>`).join('') 
                : "Chưa phân loại";
            
            // Lấy danh sách ID để truyền vào form lúc bấm Sửa
            let catIds = p.categories ? p.categories.map(c => c._id || c).join(',') : '';
            tbody.innerHTML += `
                <tr>
                    <td><img src="${p.image}" class="thumb"></td>
                    <td><b>${p.name}</b></td>
                    <td>${catNames}</td>
                    <td style="color:#e44d26; font-weight:bold;">${p.price.toLocaleString('vi-VN')} đ</td>
                    <td>${p.stock}</td>
                    <td>
                        <button class="action-btn btn-edit" onclick="openModal('${p._id}', '${p.name}', ${p.price}, '${catIds}', ${p.stock}, '${p.image}')">Sửa</button>
                        <button class="action-btn btn-delete" onclick="deleteProduct('${p._id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) { console.error(err); }
}

// 2. ĐIỀU KHIỂN POPUP (MODAL)
function openModal(id = '', name = '', price = '', catIds = '', stock = '', image = 'https://via.placeholder.com/150') {
    document.getElementById('productModal').style.display = 'flex';
    
    // Đổ dữ liệu vào form
    document.getElementById('productId').value = id;
    document.getElementById('name').value = name;
    document.getElementById('price').value = price;
    document.getElementById('stock').value = stock;
    document.getElementById('image').value = image;
    // Reset lại toàn bộ checkbox (bỏ tick hết)
    document.querySelectorAll('.cat-checkbox').forEach(cb => cb.checked = false);

    // Tick vào những danh mục mà sản phẩm này đang có
    if (catIds && catIds !== '') {
        const idsArray = catIds.split(',');
        idsArray.forEach(id => {
            const checkbox = document.querySelector(`.cat-checkbox[value="${id.trim()}"]`);
            if(checkbox) checkbox.checked = true;
        });
    }
        // Đổi tiêu đề dựa theo việc có truyền ID vào hay không
        document.getElementById('modalTitle').innerText = id ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm Mới";
    }

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('productForm').reset();
}

// 3. XỬ LÝ THÊM HOẶC SỬA (LƯU FORM)
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectedCategories = Array.from(document.querySelectorAll('.cat-checkbox:checked')).map(cb => cb.value);

    if(selectedCategories.length === 0) {
        alert("Vui lòng chọn ít nhất 1 danh mục!");
        return;
    }
    const id = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        categories: selectedCategories,
        stock: document.getElementById('stock').value,
        image: document.getElementById('image').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/update/${id}` : `${API_URL}/add`;

    try {
        await fetch(url, {
            method: method,
            headers: { 
                'Content-Type': 'application/json',
                'x-user-id': localStorage.getItem('userId')
            },
            body: JSON.stringify(productData)
        });
        
        alert(id ? "Cập nhật thành công!" : "Thêm thành công!");
        closeModal();
        loadProducts(); // Tải lại bảng
    } catch (err) { alert("Lỗi khi lưu sản phẩm!"); }
});

// 4. XỬ LÝ XÓA
async function deleteProduct(id) {
    if (confirm("⚠️ Cảnh báo: Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?")) {
        try {
            await fetch(`${API_URL}/delete/${id}`, { method: 'DELETE', headers: { 'x-user-id': localStorage.getItem('userId') } });
            loadProducts();
        } catch (err) { alert("Lỗi khi xóa!"); }
    }
}

// 5. Tải danh mục vào dropdown trong form
async function loadCategoriesToSelect() {
    try {
        const res = await fetch('http://localhost:5000/api/categories/all');
        const categories = await res.json();
        
        // Render checkbox cho form Thêm/Sửa
        const checkboxDiv = document.getElementById('categoryCheckboxes');
        if (checkboxDiv) {
            checkboxDiv.innerHTML = categories.map(c => `
                <label style="display: inline-block; margin-right: 15px; margin-bottom: 5px;">
                    <input type="checkbox" class="cat-checkbox" value="${c._id}"> ${c.name}
                </label>
            `).join('');
        }

        // Render option cho bộ lọc Sản phẩm ngoài bảng
        const filterSelect = document.getElementById('productCategoryFilter');
        if (filterSelect) {
            filterSelect.innerHTML = `<option value="ALL">Tất cả danh mục</option>` + 
                categories.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
        }
    } catch (err) { console.error("Lỗi:", err); }
}

//<!-- QUẢN LÝ DANH MỤC-->
// 2. Tải danh mục lên bảng quản lý
async function loadCategoriesTable() {
    const res = await fetch('http://localhost:5000/api/categories/all');
    const categories = await res.json();
    const tbody = document.getElementById('categoryTableBody');
    tbody.innerHTML = categories.map(c => `
        <tr>
            <td><b>${c.name}</b></td>
            <td>${c.description || '...'}</td>
            <td>
                <button class="action-btn btn-edit" onclick="openCategoryModal('${c._id}', '${c.name}', '${c.description}')">Sửa</button>
                <button class="action-btn btn-delete" onclick="deleteCategory('${c._id}')">Xóa</button>
            </td>
        </tr>
    `).join('');
}

// 3. Mở/Đóng Modal Danh Mục
function openCategoryModal(id = '', name = '', desc = '') {
    document.getElementById('categoryModal').style.display = 'flex';
    document.getElementById('catId').value = id;
    document.getElementById('catName').value = name;
    document.getElementById('catDesc').value = desc;
    document.getElementById('catModalTitle').innerText = id ? "Sửa Danh Mục" : "Thêm Danh Mục";
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    document.getElementById('categoryForm').reset();
}

// 4. Xử lý Lưu Danh Mục (Add/Update)
document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('catId').value;
    const data = {
        name: document.getElementById('catName').value,
        description: document.getElementById('catDesc').value
    };

    const url = id ? `http://localhost:5000/api/categories/update/${id}` : `http://localhost:5000/api/categories/add`;
    
    await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': localStorage.getItem('userId') },
        body: JSON.stringify(data)
    });
    
    alert("Thành công!");
    closeCategoryModal();
    loadCategoriesTable();
    loadCategoriesToSelect(); // Cập nhật lại list checkbox bên Sản phẩm
});

// 5. Xóa Danh Mục
async function deleteCategory(id) {
    if (confirm("Xóa danh mục này có thể làm mất phân loại của sản phẩm. Bạn chắc chắn chứ?")) {
        await fetch(`http://localhost:5000/api/categories/delete/${id}`, { 
            method: 'DELETE',
            headers: { 'x-user-id': localStorage.getItem('userId') }
        });
        loadCategoriesTable();
        loadCategoriesToSelect();
    }
}


// <!-- QUẢN LÝ ĐƠN HÀNG -->



// 2. Tải danh sách đơn hàng từ Server
async function loadOrdersTable() {
    try {
        const res = await fetch('http://localhost:5000/api/orders/all'); 
        const allOrders = await res.json();
        
        // --- BẮT ĐẦU PHẦN LỌC ---
        const filterValue = document.getElementById('orderStatusFilter').value;
        let ordersToDisplay = allOrders; // Mặc định hiển thị tất cả
        const phoneSearch = document.getElementById('orderPhoneSearch').value.trim(); // Lấy chữ người dùng gõ
        if (filterValue !== 'ALL') {
            // Chỉ giữ lại những đơn có status khớp với lựa chọn
            ordersToDisplay = allOrders.filter(order => order.status === filterValue);
        }
        if (phoneSearch !== '') {
            ordersToDisplay = ordersToDisplay.filter(order => 
                order.phone && order.phone.includes(phoneSearch)
            );
        }
        // --- KẾT THÚC PHẦN LỌC ---

        const tbody = document.getElementById('orderTableBody');
        
        if (ordersToDisplay.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Không có đơn hàng nào ở trạng thái này!</td></tr>`;
            return;
        }

        tbody.innerHTML = ordersToDisplay.map(order => {
            // Gom danh sách tên sản phẩm trong đơn hàng
            const productList = order.products.map(p => 
                `${p.product ? p.product.name : 'Sản phẩm đã xóa'} (x${p.quantity})`
            ).join('<br>');
            
            // Xử lý hiển thị ngày tháng cho đẹp
            const orderDate = new Date(order.createdAt).toLocaleString('vi-VN');
            const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('vi-VN') : 'Chưa chọn';
            
            return `
                <tr>
                    <td>
                        <small>ID: ${order._id.substring(order._id.length - 6).toUpperCase()}</small><br>
                        <small style="color: gray;">${orderDate}</small>
                    </td>
                    <td>
                        <b>${order.receiverName || 'Chưa có tên'}</b><br>
                        <span style="color: #007bff; font-size: 13px;">📞 ${order.phone || 'N/A'}</span><br>
                        <small>📍 ${order.shippingAddress}</small>
                    </td>
                    <td><small>${productList}</small></td>
                    <td>
                        <b style="color:#e44d26;">${order.totalAmount.toLocaleString('vi-VN')}đ</b><br>
                        <small style="background: #eee; padding: 2px 5px; border-radius: 4px;">
                            📅 Giao: ${deliveryDate} ${order.deliveryTime || ''}
                        </small>
                    </td>
                    <td>
                        <select onchange="updateOrderStatus('${order._id}', this.value)" 
                                ${order.status === 'Canceled' ? 'disabled' : ''} 
                                style="padding:5px; border-radius:4px; font-weight: bold; color: ${getStatusColor(order.status)}; border: 2px solid ${getStatusColor(order.status)}; cursor: ${order.status === 'Canceled' ? 'not-allowed' : 'pointer'};">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''} style="color: black;">Chờ duyệt</option>
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''} style="color: black;">Đang gói hàng</option>
                            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''} style="color: black;">Đang giao</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''} style="color: black;">Đã giao</option>
                            <option value="Canceled" ${order.status === 'Canceled' ? 'selected' : ''} style="color: black;">Đã hủy</option>
                        </select>
                        ${order.notes ? `<br><small style="color: red; margin-top: 5px; display: block;">📝: ${order.notes}</small>` : ''}
                    </td>
                    <td>
                        ${order.status !== 'Canceled' ? `<button class="action-btn btn-delete" onclick="deleteOrder('${order._id}')">Xóa</button>` : `<small style="color:gray;">Bị khóa</small>`}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) { 
        console.error("Lỗi tải đơn hàng:", err); 
        document.getElementById('orderTableBody').innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Lỗi tải dữ liệu!</td></tr>`;
    }
}

// 3. Hàm cập nhật trạng thái đơn hàng
async function updateOrderStatus(orderId, newStatus) {
    try {
        const res = await fetch(`http://localhost:5000/api/orders/update/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-user-id': localStorage.getItem('userId') },
            body: JSON.stringify({ status: newStatus })
        });
        if(res.ok) {
            alert("Cập nhật trạng thái thành công!");
            loadOrdersTable();
        }
    } catch (err) { alert("Không thể cập nhật trạng thái!"); }
}
// Hàm tạo màu sắc cho các trạng thái đơn hàng
function getStatusColor(status) {
    switch(status) {
        case 'Pending': return '#ffc107';    // Màu vàng
        case 'Processing': return '#17a2b8'; // Màu xanh ngọc
        case 'Shipped': return '#007bff';    // Màu xanh biển
        case 'Delivered': return '#28a745';  // Màu xanh lá
        case 'Canceled': return '#6c757d';   // Màu xám cho Đã hủy
        default: return '#333';
    }
}

// 4. Hàm xóa/hủy đơn hàng
async function deleteOrder(id) {
    if(confirm("Bạn có chắc muốn xóa vĩnh viễn đơn hàng này?")) {
        await fetch(`http://localhost:5000/api/orders/delete/${id}`, { 
            method: 'DELETE',
            headers: { 'x-user-id': localStorage.getItem('userId') }
        });
        loadOrdersTable();
    }
}


// <!-- QUẢN LÝ NGƯỜI DÙNG -->
// // 1. Tải danh sách User
async function loadUsersTable() {
    try {
        const res = await fetch('http://localhost:5000/api/users/all', {
            headers: { 'x-user-id': localStorage.getItem('userId') }
        });
        let users = await res.json();
        const tbody = document.getElementById('userTableBody');

        // --- BẮT ĐẦU LỌC TÌM KIẾM EMAIL ---
        const roleFilter = document.getElementById('userRoleFilter').value;
        const emailSearch = document.getElementById('userEmailSearch').value.trim().toLowerCase();

        // 1. Lọc theo Quyền (Role)
        if (roleFilter !== 'ALL') {
            users = users.filter(u => u.role === roleFilter);
        }
        // 2. Lọc theo Email
        if (emailSearch !== '') {
            users = users.filter(u => 
                u.email && u.email.toLowerCase().includes(emailSearch)
            );
        }
        // --- KẾT THÚC LỌC ---

        tbody.innerHTML = users.map(u => `
            <tr>
                <td><b>${u.username}</b></td>
                <td><small>${u.email}</small></td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; background: ${u.role === 'admin' ? '#dc3545' : '#28a745'}; color: white;">
                        ${u.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
                    </span>
                </td>
                <td style="font-weight: bold; color: #007bff; font-size: 16px;">${u.totalOrders || 0} <span style="font-size: 12px; color: gray; font-weight: normal;">đơn</span></td>
                <td style="font-weight: bold; color: #e44d26; font-size: 16px;">${u.totalSpent.toLocaleString('vi-VN') || 0} <span style="font-size: 12px; color: gray; font-weight: normal;">đ</span></td>
                <td>
                    ${u.role !== 'admin' 
                        ? `<button class="action-btn btn-delete" onclick="deleteUser('${u._id}')">Cấm / Xóa</button>` 
                        : `<small style="color: gray;">Không thể xóa Admin</small>`}
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error("Lỗi tải users:", err); }
}

// 2. Xóa User
async function deleteUser(id) {
    if(confirm("⚠️ Xóa tài khoản này? (Lưu ý: Không nên xóa khách hàng cũ để giữ lịch sử doanh thu)")) {
        try {
            await fetch(`http://localhost:5000/api/users/delete/${id}`, { 
                method: 'DELETE',
                headers: { 'x-user-id': localStorage.getItem('userId') }
            });
            loadUsersTable(); // Tải lại bảng ngay lập tức
        } catch (err) { alert("Lỗi hệ thống!"); }
    }
}





// 6. ĐĂNG XUẤT ADMIN
function logoutAdmin() {
    localStorage.clear(); // Xóa sạch thông tin
    window.location.href = 'admin.html'; // Hoặc login.html tùy tên file bạn đặt
}

// Chạy khi mở trang
loadCategoriesToSelect();
checkAdminAuth();