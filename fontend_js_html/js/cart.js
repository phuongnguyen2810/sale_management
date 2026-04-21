function getCartKey() {
    const userId = localStorage.getItem('userId');
    return userId ? `cart_${userId}` : null;
}

function loadCart() {
    const cartKey = getCartKey();
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    let tbody = document.getElementById('cartTableBody');
    let total = 0;
    
    tbody.innerHTML = ''; 
    
    if (!cartKey || cart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    <div class="text-muted mb-3"><i class="fa-solid fa-cart-arrow-down" style="font-size: 3rem; color: #cbd5e1;"></i></div>
                    <h5 class="fw-bold">Giỏ hàng trống</h5>
                    <p class="text-muted">Chưa có sản phẩm nào trong giỏ của bạn.</p>
                </td>
            </tr>`;
        document.getElementById('totalAmount').innerText = '0';
        return 0;
    }

    cart.forEach(item => {
        let itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // HTML render cho từng món đã được nâng cấp xịn xò
        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="fw-bold text-dark fs-6">${item.name}</div>
                </td>
                <td class="fw-semibold text-muted">
                    ${item.price.toLocaleString('vi-VN')} ₫
                </td>
                <td class="text-center">
                    <div class="qty-input-group">
                        <button type="button" class="qty-btn" onclick="updateQuantity('${item.product}', -1)"><i class="fa-solid fa-minus fs-7"></i></button>
                        <input type="text" class="qty-val" value="${item.quantity}" readonly>
                        <button type="button" class="qty-btn" onclick="updateQuantity('${item.product}', 1)"><i class="fa-solid fa-plus fs-7"></i></button>
                    </div>
                </td>
                <td class="fw-bold text-dark text-end">
                    ${itemTotal.toLocaleString('vi-VN')} ₫
                </td>
                <td class="text-center">
                    <button class="btn-delete" onclick="removeItem('${item.product}')" title="Xóa">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    document.getElementById('totalAmount').innerText = total.toLocaleString('vi-VN');
    return total; 
}

function updateQuantity(productId, change) {
    const cartKey = getCartKey();
    if (!cartKey) return;

    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    let itemIndex = cart.findIndex(item => item.product === productId);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart(); 
    }
}

function removeItem(productId) {
    const cartKey = getCartKey();
    if (!cartKey) return;

    if(confirm("Bạn muốn bỏ sản phẩm này khỏi giỏ hàng?")) {
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        cart = cart.filter(item => item.product !== productId);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart();
    }
}

function clearCart() {
    const cartKey = getCartKey();
    if (!cartKey) return;

    if(confirm("Bạn có chắc muốn xóa hết giỏ hàng?")) {
        localStorage.removeItem(cartKey);
        loadCart();
    }
}

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) {
        alert("Bạn phải đăng nhập trước khi thanh toán!");
        window.location.href = 'login.html'; 
        return; 
    }

    const cartKey = `cart_${currentUserId}`;
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    if (cart.length === 0) {
        alert("Giỏ hàng trống, hãy mua gì đó đi!");
        return;
    }

    const orderData = {
        user: currentUserId, 
        products: cart.map(item => ({
            product: item.product, 
            quantity: item.quantity
        })),
        shippingAddress: document.getElementById('address').value,
        receiverName: document.getElementById('receiverName').value,
        phone: document.getElementById('phone').value,
        deliveryDate: document.getElementById('deliveryDate').value,
        deliveryTime: document.getElementById('deliveryTime').value,
        notes: document.getElementById('notes').value
    };

    try {
        const res = await fetch('http://localhost:5000/api/orders/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            alert("🎉 Đặt hàng thành công! Cảm ơn bạn.");
            localStorage.removeItem(cartKey); 
            window.location.href = 'index.html'; 
        } else {
            const err = await res.json();
            alert("Lỗi: " + err.message);
        }
    } catch (error) {
        alert("Lỗi kết nối Server! Nhớ kiểm tra xem Backend (cổng 5000) đã bật chưa nhé.");
    }
});

// Khởi chạy khi load trang
loadCart();