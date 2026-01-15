// ============================================
// UTILS - HÀM TIỆN ÍCH
// ============================================

function showSection(sectionId) {
    console.log(`🔄 Chuyển đến section: ${sectionId}`);
    
    // Cập nhật URL hash
    window.location.hash = sectionId;
    
    // Ẩn tất cả sections
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Hiện section được chọn
    const targetSection = document.getElementById(sectionId + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Auto scroll to top
        window.scrollTo(0, 0);
        
        // Load dữ liệu nếu cần
        switch(sectionId) {
            case 'cart':
                renderCart();
                break;
            case 'my-docs':
                renderMyDocuments();
                break;
            case 'payment':
                setupUpload();
                break;
            case 'admin':
                // Không cần load gì thêm
                break;
        }
    }
    
    // Cập nhật navigation
    if (sectionId !== 'login' && sectionId !== 'register' && sectionId !== 'payment') {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const navLink = document.querySelector(`[href="#${sectionId}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.error('Toast element not found');
        return;
    }
    
    toast.textContent = message;
    toast.className = 'toast';
    
    // Type-based styling
    switch(type) {
        case 'success':
            toast.style.background = 'linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%)';
            break;
        case 'error':
            toast.style.background = 'linear-gradient(135deg, #f94144 0%, #f72585 100%)';
            break;
        case 'warning':
            toast.style.background = 'linear-gradient(135deg, #f8961e 0%, #f9c74f 100%)';
            break;
        case 'info':
            toast.style.background = 'linear-gradient(135deg, #4895ef 0%, #4361ee 100%)';
            break;
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showConfirmModal(title, message, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const closeBtn = document.querySelector('.close-modal');
    
    if (!modal || !modalTitle || !modalMessage) return;
    
    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    
    // Remove old event listeners by cloning
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newCloseBtn = closeBtn.cloneNode(true);
    
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    // Add new event listeners
    newConfirmBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        if (typeof onConfirm === 'function') onConfirm();
    });
    
    newCancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        if (typeof onCancel === 'function') onCancel();
    });
    
    newCloseBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        if (typeof onCancel === 'function') onCancel();
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            if (typeof onCancel === 'function') onCancel();
        }
    });
    
    // Show modal
    modal.classList.add('active');
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return 'N/A';
    }
}

function formatDateTime(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function setupEventListeners() {
    console.log("🔄 Đang thiết lập event listeners...");
    
    // Đăng nhập/Đăng ký
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Chuyển đổi giữa login/register
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('register');
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('login');
        });
    }
    
    // Đăng xuất
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('href').substring(1);
            
            if (!currentUser && (section !== 'store' && section !== 'login' && section !== 'register')) {
                showToast('Vui lòng đăng nhập để sử dụng tính năng này!', 'error');
                showSection('login');
                return;
            }
            
            showSection(section);
        });
    });
    
    // Categories
    document.addEventListener('click', function(e) {
        if (e.target.closest('.category-card')) {
            const card = e.target.closest('.category-card');
            const categoryId = card.dataset.categoryId;
            
            // Cập nhật active state
            document.querySelectorAll('.category-card').forEach(c => {
                c.classList.remove('active');
            });
            card.classList.add('active');
            
            // Cập nhật filter
            selectedCategory = categoryId;
            renderDocuments();
        }
    });
    
    // Store filters
    const sortSelect = document.getElementById('sortSelect');
    const searchInput = document.getElementById('searchInput');
    
    if (sortSelect) {
        sortSelect.addEventListener('change', renderDocuments);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', renderDocuments);
    }
    
    // Cart
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }
    
    // Continue shopping
    document.addEventListener('click', function(e) {
        if (e.target.closest('.continue-shopping') || 
            e.target.closest('[href="#store"]') || 
            (e.target.tagName === 'A' && e.target.getAttribute('href') === '#store')) {
            e.preventDefault();
            showSection('store');
        }
    });
    
    // My documents filters
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const filter = this.dataset.filter;
            document.querySelectorAll('.filter-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            renderMyDocuments(filter);
        });
    });
    
    // My documents search
    const searchMyDocs = document.getElementById('searchMyDocs');
    if (searchMyDocs) {
        searchMyDocs.addEventListener('input', () => {
            const activeTab = document.querySelector('.filter-tab.active');
            const filter = activeTab ? activeTab.dataset.filter : 'all';
            renderMyDocuments(filter);
        });
    }
    
    // Password visibility toggle
    setupPasswordToggles();
    
    // Mobile nav toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
        
        // Close menu on resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navMenu.style.display = 'flex';
            } else {
                navMenu.style.display = 'none';
            }
        });
    }
    
    // Hash change
    window.addEventListener('hashchange', handleHashChange);
    
    // Initial hash
    if (window.location.hash) {
        handleHashChange();
    }
    
    console.log("✅ Event listeners đã sẵn sàng!");
}

function setupPasswordToggles() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        // Kiểm tra đã có toggle chưa
        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('password-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
            toggleBtn.setAttribute('aria-label', 'Hiện mật khẩu');
            
            // Đặt vị trí
            input.parentNode.style.position = 'relative';
            toggleBtn.style.position = 'absolute';
            toggleBtn.style.right = '1rem';
            toggleBtn.style.top = '50%';
            toggleBtn.style.transform = 'translateY(-50%)';
            toggleBtn.style.background = 'none';
            toggleBtn.style.border = 'none';
            toggleBtn.style.color = 'var(--gray)';
            toggleBtn.style.cursor = 'pointer';
            toggleBtn.style.zIndex = '2';
            toggleBtn.style.fontSize = '1rem';
            
            input.parentNode.appendChild(toggleBtn);
            
            // Thêm event listener
            toggleBtn.addEventListener('click', function() {
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                    this.setAttribute('aria-label', 'Ẩn mật khẩu');
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                    this.setAttribute('aria-label', 'Hiện mật khẩu');
                }
            });
        }
    });
}

function handleHashChange() {
    const hash = window.location.hash.substring(1) || 'store';
    
    // Nếu chưa đăng nhập, chỉ cho phép vào login/register/store
    if (!currentUser && (hash !== 'login' && hash !== 'register' && hash !== 'store')) {
        showSection('login');
        return;
    }
    
    // Kiểm tra section hợp lệ
    const validSections = ['login', 'register', 'store', 'cart', 'payment', 'my-docs', 'admin'];
    if (validSections.includes(hash)) {
        showSection(hash);
    } else {
        showSection('store');
    }
}

// Export functions
window.showSection = showSection;
window.showToast = showToast;
window.showConfirmModal = showConfirmModal;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatFileSize = formatFileSize;
window.validateEmail = validateEmail;
window.setupEventListeners = setupEventListeners;