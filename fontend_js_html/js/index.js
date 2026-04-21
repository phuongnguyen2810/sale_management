// 1. Fetch Dữ liệu với Animation
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:5000/api/products/all');
        const products = await response.json();
        
        const productListDiv = document.getElementById('productList');
        productListDiv.innerHTML = ''; 
        
        products.forEach((p, index) => {
            // Căn chỉnh độ trễ animation cho từng thẻ (0.1s, 0.2s,...)
            const delay = index * 0.1;
            
            productListDiv.innerHTML += `
                <div class="col-sm-6 col-md-4 col-lg-3 animate-item" style="animation-delay: ${delay}s">
                    <div class="card product-card h-100">
                        <div class="product-img-wrap">
                            <img src="${p.image}" class="product-img" alt="${p.name}">
                        </div>
                        <div class="card-body d-flex flex-column p-4">
                            <h3 class="product-title mb-2">${p.name}</h3>
                            <p class="price mb-3">${p.price.toLocaleString('vi-VN')} ₫</p>
                            
                            <div class="d-flex justify-content-between align-items-center mb-4 mt-auto">
                                <span class="stock-badge">
                                    <i class="fa-solid fa-boxes-stacked me-1"></i> Còn ${p.stock}
                                </span>
                            </div>

                            <button class="btn btn-gradient w-100" onclick="addToCart('${p._id}', '${p.name}', ${p.price})">
                                Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        document.getElementById('productList').innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-triangle-exclamation text-danger" style="font-size: 4rem;"></i>
                <h4 class="mt-3 fw-bold text-dark">Chưa kết nối Server</h4>
                <p class="text-muted">Vui lòng kiểm tra lại cổng 5000 của Backend.</p>
            </div>`;
    }
}

// 2. Xử lý User Info cực mượt
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

// 3. Đếm Giỏ Hàng
function updateCartCount() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const cartKey = `cart_${userId}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    document.getElementById('cartCount').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// 4. Đăng xuất
function logout() {
    localStorage.clear();
    window.location.reload(); 
}

// 5. Thêm vào giỏ hàng
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

// Khởi động
checkLogin();
updateCartCount();  
fetchProducts();