// ============================================
// AUTH - ĐĂNG NHẬP & ĐĂNG KÝ
// ============================================

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Đăng nhập thành công
        currentUser = user;
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
        
        updateUserUI();
        loadCart();
        loadUserDownloads(); // Tải downloads
        
        showToast(`Chào mừng ${user.name} trở lại!`, 'success');
        
        setTimeout(() => {
            showSection('store');
        }, 1000);
    } else {
        showToast('Email hoặc mật khẩu không chính xác!', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validate
    if (!name || !email || !password || !confirmPassword) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Email không hợp lệ!', 'error');
        return;
    }
    
    // Kiểm tra email tồn tại
    const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    if (users.find(u => u.email === email)) {
        showToast('Email này đã được đăng ký!', 'error');
        return;
    }
    
    // Tạo user mới
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    // Lưu user
    users.push(newUser);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    
    // Tự động đăng nhập
    currentUser = newUser;
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(newUser));
    
    updateUserUI();
    loadCart();
    loadUserDownloads(); // Tải downloads
    
    showToast('Đăng ký thành công!', 'success');
    
    setTimeout(() => {
        showSection('store');
    }, 1000);
}

function handleLogout() {
    showConfirmModal(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất không?',
        () => {
            currentUser = null;
            localStorage.removeItem(DB_KEYS.CURRENT_USER);
            cart = [];
            updateCartCount();
            updateUserUI();
            
            showToast('Đã đăng xuất!', 'info');
            
            setTimeout(() => {
                showSection('login');
            }, 500);
        }
    );
}

function updateUserUI() {
    const userSection = document.getElementById('userSection');
    const userName = document.getElementById('userName');
    const adminLink = document.getElementById('adminLink');
    
    if (currentUser) {
        userName.textContent = currentUser.name;
        if (userSection) userSection.style.display = 'flex';
        
        // Hiện/ẩn link admin
        if (adminLink) {
            adminLink.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
        }
    } else {
        if (userName) userName.textContent = 'Khách';
        if (userSection) userSection.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}