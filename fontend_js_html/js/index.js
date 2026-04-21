// Biến toàn cục để lưu trữ danh sách gốc, giúp filter không cần gọi lại API
let allProducts = [];
let allCategories = [];

// 1. Fetch Danh mục (Categories) để đổ vào thanh Filter
async function fetchCategories() {
    try {
        const response = await fetch('http://localhost:5000/api/categories/all');
        allCategories = await response.json();
        
        const filterList = document.getElementById('categoryCheckboxList');
        filterList.innerHTML = ''; // Xóa chữ "Đang tải"
        
        allCategories.forEach(cat => {
            // Render từng thẻ li chứa checkbox
            filterList.innerHTML += `
                <li class="mb-2">
                    <div class="form-check ps-4 custom-control">
                        <input class="form-check-input category-checkbox shadow-none border-secondary" type="checkbox" value="${cat._id}" id="cat_${cat._id}" onchange="applyFilters()" style="cursor: pointer; width: 1.2em; height: 1.2em;">
                        <label class="form-check-label w-100 ms-2" for="cat_${cat._id}" style="cursor: pointer; font-weight: 500;">
                            ${cat.name}
                        </label>
                    </div>
                </li>
            `;
        });
    } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        document.getElementById('categoryCheckboxList').innerHTML = '<li class="text-danger text-center">Lỗi tải dữ liệu</li>';
    }
}

// 2. Fetch Sản phẩm (Products)
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products/all');
        const products = await response.json();
        
        // Lưu dữ liệu vào biến toàn cục để filter nội bộ
        allProducts = products;
        
        // Render toàn bộ sản phẩm lần đầu
        renderProducts(allProducts);
    } catch (error) {
        document.getElementById('productList').innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-triangle-exclamation text-danger" style="font-size: 4rem;"></i>
                <h4 class="mt-3 fw-bold text-dark">Chưa kết nối Server</h4>
                <p class="text-muted">Vui lòng kiểm tra lại cổng 5000 của Backend.</p>
            </div>`;
    }
}

// 3. Hàm Render Sản phẩm (Đã được tách ra để tái sử dụng)
function renderProducts(productsToRender) {
    const productListDiv = document.getElementById('productList');
    productListDiv.innerHTML = ''; 

    // Xử lý UI khi không tìm thấy sản phẩm
    if (productsToRender.length === 0) {
        productListDiv.innerHTML = `
            <div class="col-12 text-center py-5 animate-item">
                <i class="fa-solid fa-box-open text-muted mb-3" style="font-size: 3rem;"></i>
                <h5 class="text-muted fw-bold">Không tìm thấy sản phẩm phù hợp</h5>
                <p class="text-muted small">Vui lòng thử từ khóa hoặc bộ lọc khác.</p>
            </div>`;
        return;
    }
    
    productsToRender.forEach((p, index) => {
        const delay = index * 0.05; // Giảm delay để user filter thấy nhanh hơn
        
        productListDiv.innerHTML += `
            <div class="col-sm-6 col-md-4 col-lg-3 animate-item" style="animation-delay: ${delay}s">
                <div class="card product-card h-100">
                    <div class="product-img-wrap">
                        <img src="${p.image || 'https://via.placeholder.com/200'}" class="product-img" alt="${p.name}">
                    </div>
                    <div class="card-body d-flex flex-column p-4">
                        <h3 class="product-title mb-2">${p.name}</h3>
                        <p class="price mb-3">${(p.price || 0).toLocaleString('vi-VN')} ₫</p>
                        
                        <div class="d-flex justify-content-between align-items-center mb-4 mt-auto">
                            <span class="stock-badge">
                                <i class="fa-solid fa-boxes-stacked me-1"></i> Còn ${p.stock || 0}
                            </span>
                        </div>

                        <button class="btn btn-gradient w-100" onclick="addToCart('${p._id}', '${p.name.replace(/'/g, "\\'")}', ${p.price})">
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// 4. Logic Xử lý Tìm kiếm & Lọc (Đỉnh cao của Client-side filtering)
function applyFilters() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase().trim();
    
    // Lấy tất cả các checkbox ĐÃ ĐƯỢC TICK (checked)
    const checkedBoxes = document.querySelectorAll('.category-checkbox:checked');
    // Chuyển NodeList thành mảng các ID
    const selectedCategoryIds = Array.from(checkedBoxes).map(cb => cb.value);

    const filteredProducts = allProducts.filter(p => {
        // Điều kiện 1: Tên sản phẩm
        const matchSearch = p.name.toLowerCase().includes(searchTerm);

        // Điều kiện 2: Khớp danh mục
        let matchCategory = true; 
        
        if (selectedCategoryIds.length > 0) {
            if (Array.isArray(p.categories)) {
                matchCategory = p.categories.some(cat => selectedCategoryIds.includes(cat._id || cat));
            } else if (p.categories) {
                matchCategory = selectedCategoryIds.includes(p.categories._id || p.categories);
            } else {
                matchCategory = false; 
            }
        }

        return matchSearch && matchCategory;
    });

    renderProducts(filteredProducts);
}

// 5. Xử lý User Info (Giữ nguyên)
function checkLogin() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const userInfoDiv = document.getElementById('userInfo');

    if (userId) {
        userInfoDiv.innerHTML = `
            <div class="d-flex align-items-center bg-white rounded-pill shadow-sm px-3 py-2 border">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-weight: bold;">
                    ${username.charAt(0).toUpperCase()}
                </div>
                <span class="fw-semibold me-3 text-dark">${username}</span>
                <a href="profile.html" class="text-muted text-decoration-none me-3" title="Trang cá nhân">
                    <i class="fa-solid fa-gear"></i>
                </a>
                <button class="btn btn-sm btn-light rounded-pill border" onclick="logout()" title="Đăng xuất">
                    <i class="fa-solid fa-arrow-right-from-bracket text-danger"></i>
                </button>
            </div>
        `;
    } else {
        userInfoDiv.innerHTML = `
            <a href="login.html" class="btn btn-dark rounded-pill px-4 fw-semibold shadow-sm">
                Đăng nhập
            </a>
        `;
    }
}

// 6. Đếm Giỏ Hàng (Giữ nguyên)
function updateCartCount() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const cartKey = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    document.getElementById('cartCount').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// 7. Đăng xuất (Giữ nguyên)
function logout() {
    localStorage.clear();
    window.location.reload(); 
}

// 8. Thêm vào giỏ hàng (Fix lỗi syntax dấu nháy ở tên sản phẩm)
function addToCart(productId, name, price) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("Bạn cần đăng nhập để mua sắm nhé!");
        window.location.href = 'login.html';
        return;
    }

    const cartKey = `cart_${userId}`; 
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    let existingItem = cart.find(item => item.product === productId);
    
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ product: productId, name, price, quantity: 1 });
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
}

// Khởi động các hàm
document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
    updateCartCount();  
    fetchCategories(); // Gọi API lấy danh mục
    fetchProducts();   // Gọi API lấy sản phẩm
});