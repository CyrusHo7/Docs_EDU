// ============================================
// INIT - KHỞI TẠO ỨNG DỤNG
// ============================================

// Khởi tạo ứng dụng
function initApp() {
    console.log("🔄 Đang khởi tạo ứng dụng...");
    
    // Ẩn loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 500);
    }, 800);
    
    // Khởi tạo database
    initDatabase();
    
    // Khởi tạo dữ liệu tài liệu
    initializeDocuments();
    
    // Tải giao diện
    loadTemplates();
    
    // Kiểm tra đăng nhập
    checkLoginStatus();
    
    // Thiết lập event listeners
    setupEventListeners();
    
    console.log("✅ Ứng dụng đã sẵn sàng!");
}

// Tải templates HTML
function loadTemplates() {
    // Tải sections chính
    loadMainSections();
    
    // Tải footer
    loadFooter();
}

// Tải sections chính
function loadMainSections() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <!-- Login Section -->
        <section id="loginSection" class="section active">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h2><i class="fas fa-sign-in-alt"></i> Đăng nhập</h2>
                        <p>Đăng nhập để mua và tải tài liệu</p>
                    </div>
                    
                    <form id="loginForm" class="auth-form">
                        <div class="input-group">
                            <i class="fas fa-envelope"></i>
                            <input type="email" id="email" placeholder="Email của bạn" required>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="password" placeholder="Mật khẩu" required>
                            <button type="button" class="password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-large">
                            <i class="fas fa-sign-in-alt"></i> Đăng nhập
                        </button>
                        
                        <div class="auth-divider">
                            <span>hoặc</span>
                        </div>
                        
                        <div class="auth-links">
                            <p>Chưa có tài liệu khoản? <a href="#" id="showRegister">Đăng ký ngay</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <!-- Register Section -->
        <section id="registerSection" class="section">
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h2><i class="fas fa-user-plus"></i> Đăng ký tài khoản</h2>
                        <p>Tạo tài khoản để mua tài liệu</p>
                    </div>
                    
                    <form id="registerForm" class="auth-form">
                        <div class="input-group">
                            <i class="fas fa-user"></i>
                            <input type="text" id="regName" placeholder="Họ và tên" required>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-envelope"></i>
                            <input type="email" id="regEmail" placeholder="Email" required>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="regPassword" placeholder="Mật khẩu (ít nhất 6 ký tự)" required minlength="6">
                            <button type="button" class="password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-lock"></i>
                            <input type="password" id="regConfirmPassword" placeholder="Xác nhận mật khẩu" required>
                            <button type="button" class="password-toggle">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-large">
                            <i class="fas fa-user-plus"></i> Đăng ký
                        </button>
                        
                        <div class="auth-links">
                            <p>Đã có tài khoản? <a href="#" id="showLogin">Đăng nhập ngay</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <!-- Store Section -->
        <section id="storeSection" class="section">
            <div class="container">
                <h2 class="section-title">
                    <i class="fas fa-book-open"></i>
                    Cửa hàng tài liệu
                </h2>
                
                <!-- Categories -->
                <div class="categories-section">
                    <div class="categories-grid" id="categoriesGrid">
                        <!-- Categories sẽ được tải bằng JS -->
                    </div>
                </div>
                
                <!-- Documents Grid -->
                <div class="documents-section">
                    <div class="section-header">
                        <h3 class="section-subtitle">Tài liệu nổi bật</h3>
                        
                        <div class="filters">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="searchInput" placeholder="Tìm tài liệu...">
                            </div>
                            
                            <select id="sortSelect" class="filter-select">
                                <option value="newest">Mới nhất</option>
                                <option value="price-low">Giá thấp → cao</option>
                                <option value="price-high">Giá cao → thấp</option>
                                <option value="popular">Phổ biến</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="documents-grid" id="documentsGrid">
                        <!-- Documents sẽ được tải bằng JS -->
                    </div>
                </div>
            </div>
        </section>

        <!-- Cart Section -->
        <section id="cartSection" class="section">
            <div class="container">
                <div class="cart-header">
                    <h2 class="section-title">
                        <i class="fas fa-shopping-cart"></i>
                        Giỏ hàng
                    </h2>
                    <a href="#store" class="continue-shopping">
                        <i class="fas fa-arrow-left"></i> Tiếp tục mua sắm
                    </a>
                </div>
                
                <div class="cart-container">
                    <div class="cart-items" id="cartItems">
                        <!-- Giỏ hàng trống -->
                        <div class="empty-cart" id="emptyCart">
                            <div class="empty-icon">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <h3>Giỏ hàng trống</h3>
                            <p>Hãy thêm tài liệu vào giỏ hàng</p>
                            <a href="#store" class="btn-primary">
                                <i class="fas fa-store"></i> Đến cửa hàng
                            </a>
                        </div>
                    </div>
                    
                    <div class="cart-summary" id="cartSummary" style="display: none;">
                        <h3><i class="fas fa-receipt"></i> Tóm tắt đơn hàng</h3>
                        
                        <div class="summary-details">
                            <div class="summary-row">
                                <span>Tạm tính:</span>
                                <span id="subtotal">0 ₫</span>
                            </div>
                            <div class="summary-row">
                                <span>Phí xử lý:</span>
                                <span id="processingFee">5,000 ₫</span>
                            </div>
                            <div class="summary-row total">
                                <span>Tổng cộng:</span>
                                <span id="cartTotal">0 ₫</span>
                            </div>
                        </div>
                        
                        <button id="checkoutBtn" class="btn-success btn-large">
                            <i class="fas fa-credit-card"></i> Thanh toán
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Payment Section -->
        <section id="paymentSection" class="section">
            <div class="container">
                <div class="payment-container">
                    <div class="payment-header">
                        <h2 class="section-title">
                            <i class="fas fa-qrcode"></i>
                            Thanh toán
                        </h2>
                        <p class="payment-subtitle">Chuyển khoản và upload bill để nhận tài liệu ngay</p>
                    </div>
                    
                    <div class="payment-content">
                        <!-- Left: QR Code cố định -->
                        <div class="payment-info">
                            <div class="qr-display">
                                <div class="qr-code">
                                    <img src="assets/images/owner-qr.png" alt="Mã QR thanh toán" id="qrImage">
                                </div>
                                <p class="qr-note">Quét mã QR để chuyển khoản</p>
                            </div>
                            
                            <div class="payment-details">
                                <h4><i class="fas fa-info-circle"></i> Thông tin chuyển khoản</h4>
                                <div class="detail-item">
                                    <span>Ngân hàng:</span>
                                    <span>Vietcombank</span>
                                </div>
                                <div class="detail-item">
                                    <span>Số tài khoản:</span>
                                    <span>1903 8858 6868</span>
                                </div>
                                <div class="detail-item">
                                    <span>Chủ tài khoản:</span>
                                    <span>Hồ Hoàng Trí</span>
                                </div>
                                <div class="detail-item">
                                    <span>Số tiền:</span>
                                    <strong id="paymentAmount" class="price">0 ₫</strong>
                                </div>
                                <div class="detail-item">
                                    <span>Nội dung CK:</span>
                                    <code id="paymentNote">EDUDOCS_<span id="orderCode">000001</span></code>
                                </div>
                                <div class="detail-item">
                                    <span>Mã đơn hàng:</span>
                                    <strong id="paymentOrderId">#EDU000001</strong>
                                </div>
                            </div>
                            
                            <div class="payment-notice">
                                <i class="fas fa-info-circle"></i>
                                <p>Sau khi chuyển khoản, upload bill để <strong>nhận tài liệu ngay</strong> (tự động xác nhận)</p>
                            </div>
                        </div>
                        
                        <!-- Right: Upload Bill -->
                        <div class="upload-section">
                            <div class="upload-header">
                                <h4><i class="fas fa-upload"></i> Upload Bill xác nhận</h4>
                                <p class="upload-subtitle">Upload bill để <strong>tự động nhận tài liệu ngay</strong></p>
                            </div>
                            
                            <div class="upload-area" id="uploadArea">
                                <div class="upload-icon">
                                    <i class="fas fa-file-invoice-dollar"></i>
                                </div>
                                <h3>Kéo thả ảnh bill vào đây</h3>
                                <p>Hoặc nhấn để chọn file</p>
                                <input type="file" id="billFile" accept="image/*" hidden>
                                <button class="btn-primary" id="selectBillBtn">
                                    <i class="fas fa-folder-open"></i> Chọn file
                                </button>
                                <p class="upload-hint">Hỗ trợ: JPG, PNG (tối đa 5MB)</p>
                            </div>
                            
                            <div class="file-preview" id="filePreview" style="display: none;">
                                <div class="preview-container">
                                    <img id="previewImage" src="" alt="Preview">
                                    <div class="preview-overlay">
                                        <button id="removeFileBtn" class="btn-danger btn-small">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="file-info">
                                    <h4 id="fileName">bill.jpg</h4>
                                    <p id="fileSize">0 KB</p>
                                </div>
                            </div>
                            
                            <div class="upload-actions">
                                <button id="cancelPaymentBtn" class="btn-secondary">
                                    <i class="fas fa-times"></i> Hủy
                                </button>
                                <button id="confirmUploadBtn" class="btn-success" disabled>
                                    <i class="fas fa-check"></i> Xác nhận Upload
                                </button>
                            </div>
                            
                            <div class="payment-instructions">
                                <h4><i class="fas fa-info-circle"></i> Hướng dẫn thanh toán:</h4>
                                <ol>
                                    <li>Chuyển khoản đến thông tin bên trái</li>
                                    <li>Chụp ảnh bill/ screenshot chuyển khoản</li>
                                    <li>Upload ảnh bill vào form bên phải</li>
                                    <li>Nhấn "Xác nhận Upload"</li>
                                    <li><strong>Tài liệu sẽ tự động có trong mục "Tài liệu đã mua"</strong></li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- My Documents Section -->
        <section id="myDocsSection" class="section">
            <div class="container">
                <div class="my-docs-header">
                    <h2 class="section-title">
                        <i class="fas fa-download"></i>
                        Tài liệu của tôi
                    </h2>
                    <div class="stats">
                        <div class="stat-item">
                            <i class="fas fa-book"></i>
                            <span>Tổng: <strong id="totalDocs">0</strong> tài liệu</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Đã thanh toán: <strong id="confirmedDocs">0</strong></span>
                        </div>
                    </div>
                </div>
                
                <div class="my-docs-container">
                    <div class="filter-section">
                        <div class="filter-tabs">
                            <button class="filter-tab active" data-filter="all">
                                <i class="fas fa-th"></i> Tất cả
                            </button>
                            <button class="filter-tab" data-filter="recent">
                                <i class="fas fa-history"></i> Mới nhất
                            </button>
                            <button class="filter-tab" data-filter="downloaded">
                                <i class="fas fa-download"></i> Đã tải
                            </button>
                        </div>
                        
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="searchMyDocs" placeholder="Tìm tên tài liệu...">
                        </div>
                    </div>
                    
                    <div id="myDocsContent">
                        <!-- Danh sách tài liệu sẽ được tải -->
                        <div class="empty-state" id="emptyMyDocs">
                            <div class="empty-icon">
                                <i class="fas fa-box-open"></i>
                            </div>
                            <h3>Chưa có tài liệu nào</h3>
                            <p>Hãy mua tài liệu để bắt đầu học tập!</p>
                            <a href="#store" class="btn-primary">
                                <i class="fas fa-store"></i> Đến cửa hàng
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Admin Section -->
        <section id="adminSection" class="section">
            <div class="container">
                <h2 class="section-title">
                    <i class="fas fa-cog"></i>
                    Quản lý hệ thống
                </h2>
                
                <div class="admin-panel">
                    <div class="admin-card" onclick="showDocumentManager()">
                        <div class="admin-icon">
                            <i class="fas fa-book"></i>
                        </div>
                        <h3>Quản lý tài liệu</h3>
                        <p>Thêm, sửa, xóa tài liệu</p>
                    </div>
                    
                    <div class="admin-card" onclick="showUserManager()">
                        <div class="admin-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3>Quản lý người dùng</h3>
                        <p>Xem danh sách người dùng</p>
                    </div>
                    
                    <div class="admin-card" onclick="showOrderManager()">
                        <div class="admin-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <h3>Quản lý đơn hàng</h3>
                        <p>Xem tất cả đơn hàng</p>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Tải footer
function loadFooter() {
    const footerContent = document.getElementById('footerContent');
    if (!footerContent) return;
    
    footerContent.innerHTML = `
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-section">
                    <div class="footer-logo">
                        <i class="fas fa-graduation-cap"></i>
                        <h3>EduDocs</h3>
                    </div>
                    <p class="footer-description">
                        Cửa hàng tài liệu học tập chất lượng cao
                    </p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                        <a href="#"><i class="fab fa-telegram"></i></a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Thông tin thanh toán</h4>
                    <div class="bank-info">
                        <p><i class="fas fa-university"></i> Techcombank</p>
                        <p><i class="fas fa-credit-card"></i> 1903 8858 6868</p>
                        <p><i class="fas fa-user"></i> NGUYEN VAN A</p>
                        <p><i class="fas fa-qrcode"></i> Quét mã QR để chuyển khoản</p>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Hỗ trợ khách hàng</h4>
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> support@edudocs.vn</p>
                        <p><i class="fas fa-phone"></i> 1900 1234</p>
                        <p><i class="fas fa-clock"></i> Xác nhận tự động 24/7</p>
                        <p><i class="fas fa-bolt"></i> Nhận tài liệu ngay sau upload</p>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Danh mục tài liệu</h4>
                    <ul class="footer-links">
                        <li><a href="#"><i class="fas fa-calculator"></i> Toán học</a></li>
                        <li><a href="#"><i class="fas fa-code"></i> Lập trình</a></li>
                        <li><a href="#"><i class="fas fa-language"></i> Ngoại ngữ</a></li>
                        <li><a href="#"><i class="fas fa-flask"></i> Khoa học</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2024 EduDocs. Thanh toán tự động - Nhận tài liệu ngay!</p>
                <p class="footer-note">Tất cả tài liệu có bản quyền và chỉ dùng cho mục đích học tập</p>
            </div>
        </div>
    `;
}

// Kiểm tra đăng nhập
function checkLoginStatus() {
    try {
        const savedUser = localStorage.getItem(DB_KEYS.CURRENT_USER);
        
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            console.log(`✅ Đã đăng nhập: ${currentUser.name}`);
            
            updateUserUI();
            loadCart();
            loadUserDownloads(); // Tải downloads
            
            // Kiểm tra hash để chuyển đến trang đúng
            const hash = window.location.hash.substring(1);
            const validSections = ['store', 'cart', 'my-docs', 'payment', 'admin'];
            
            if (hash && validSections.includes(hash)) {
                showSection(hash);
            } else {
                showSection('store');
            }
        } else {
            console.log("ℹ️ Chưa đăng nhập");
            showSection('login');
        }
    } catch (error) {
        console.error("❌ Lỗi khi kiểm tra đăng nhập:", error);
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
        showSection('login');
    }
}

// Khởi chạy khi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
