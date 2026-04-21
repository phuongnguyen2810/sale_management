let isLogin = true;

function toggleAuth() {
    isLogin = !isLogin;
    const header = document.getElementById('formHeader');
    const btn = document.getElementById('submitBtn');
    const toggleBtn = document.getElementById('toggleBtn');
    const toggleTextLabel = document.getElementById('toggleTextLabel');
    
    // Lấy cả wrapper và thẻ input bên trong
    const userWrapper = document.getElementById('usernameWrapper');
    const userInp = document.getElementById('username');

    if (isLogin) {
        header.innerText = "Chào mừng trở lại";
        btn.innerHTML = 'Đăng Nhập <i class="fa-solid fa-arrow-right-to-bracket ms-2"></i>';
        btn.classList.remove('register-mode');
        
        toggleTextLabel.innerText = "Chưa có tài khoản?";
        toggleBtn.innerText = "Đăng ký ngay";
        
        userWrapper.style.display = "none";
        userInp.required = false;
    } else {
        header.innerText = "Tạo Tài Khoản Mới";
        btn.innerHTML = 'Đăng Ký <i class="fa-solid fa-user-plus ms-2"></i>';
        btn.classList.add('register-mode');
        
        toggleTextLabel.innerText = "Đã có tài khoản?";
        toggleBtn.innerText = "Đăng nhập tại đây";
        
        userWrapper.style.display = "block"; // Hiện ô nhập Tên
        userInp.required = true;
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    
    const path = isLogin ? 'login' : 'register'; 
    const url = `http://localhost:5000/api/users/${path}`;

    const bodyData = isLogin 
        ? { email, password } 
        : { username, email, password, role: 'customer' };
        
    try {
        // Đổi nút thành trạng thái Đang xử lý
        const btn = document.getElementById('submitBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
        btn.disabled = true;

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        const data = await res.json();
        
        // Khôi phục nút
        btn.innerHTML = originalText;
        btn.disabled = false;

        if (res.ok) {
            if (isLogin) {
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('username', data.user.username);
                window.location.href = 'index.html'; 
            } else {
                alert("🎉 Đăng ký thành công! Mời bạn đăng nhập để tiếp tục.");
                toggleAuth(); 
                document.getElementById('password').value = ''; // Xóa pass đi cho an toàn
            }
        } else {
            alert("Lỗi: " + data.message);
        }
    } catch (err) { 
        alert("Lỗi kết nối Server! Vui lòng kiểm tra lại Backend (cổng 5000).");
        document.getElementById('submitBtn').disabled = false;
    }
});

// Khởi tạo dòng Header chuẩn ban đầu
document.getElementById('formHeader').innerText = "Chào mừng trở lại";