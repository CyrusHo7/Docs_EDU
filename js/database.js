// ============================================
// DATABASE - QUẢN LÝ LOCALSTORAGE
// ============================================

// Khởi tạo database
function initDatabase() {
    console.log("🔄 Đang khởi tạo database...");
    
    // Users
    if (!localStorage.getItem(DB_KEYS.USERS)) {
        const users = [
            {
                id: 1,
                name: "Admin",
                email: "admin@edudocs.vn",
                password: "admin123",
                role: "admin",
                createdAt: new Date().toISOString(),
                isActive: true
            },
            {
                id: 2,
                name: "Nguyễn Văn Học",
                email: "user@edudocs.vn",
                password: "user123",
                role: "user",
                createdAt: new Date().toISOString(),
                isActive: true
            },
            {
                id: 3,
                name: "Phạm Minh Thông",
                email: "phamminhthong2392008@gmail.com",
                password: "123456",
                role: "user",
                createdAt: new Date().toISOString(),
                isActive: true
            }
        ];
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        console.log("✅ Đã tạo users mẫu");
    }
    
    // Carts
    if (!localStorage.getItem(DB_KEYS.CARTS)) {
        localStorage.setItem(DB_KEYS.CARTS, JSON.stringify({}));
    }
    
    // Orders
    if (!localStorage.getItem(DB_KEYS.ORDERS)) {
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
    }
    
    // Bills
    if (!localStorage.getItem(DB_KEYS.BILLS)) {
        localStorage.setItem(DB_KEYS.BILLS, JSON.stringify([]));
    }
    
    // Downloads
    if (!localStorage.getItem(DB_KEYS.DOWNLOADS)) {
        localStorage.setItem(DB_KEYS.DOWNLOADS, JSON.stringify({}));
    }
    
    // Documents - khởi tạo trong initializeDocuments()
}

// Khởi tạo dữ liệu tài liệu
function initializeDocuments() {
    const savedDocs = localStorage.getItem(DB_KEYS.DOCUMENTS);
    
    if (savedDocs) {
        DOCUMENTS = JSON.parse(savedDocs);
        console.log(`📚 Đã tải ${DOCUMENTS.length} tài liệu từ localStorage`);
    } else {
        // Dữ liệu mẫu
        DOCUMENTS = [
            {
                id: 1,
                name: "Toàn tập công thức Toán THPT",
                category: "math",
                price: 99000,
                originalPrice: 149000,
                description: "Tổng hợp đầy đủ công thức Toán từ lớp 10 đến 12.",
                file: "documents/toan-tap-cong-thuc-toan-thpt.pdf",
                driveLink: "", // Link drive sẽ được admin cung cấp
                type: DOCUMENT_TYPES.PDF,
                pages: 156,
                format: "PDF",
                downloads: 2456,
                rating: 4.8,
                author: "TS. Nguyễn Văn Toán",
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: "JavaScript Masterclass 2024",
                category: "programming",
                price: 199000,
                description: "Khóa học JavaScript từ cơ bản đến nâng cao.",
                file: "documents/javascript-masterclass.zip",
                driveLink: "https://drive.google.com/drive/folders/1AbcDefGhIjKlMnOpQrStUvWxYz",
                type: DOCUMENT_TYPES.ZIP,
                pages: 420,
                format: "PDF + Source Code",
                downloads: 3890,
                rating: 4.9,
                author: "DevMaster Academy",
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: "IELTS Writing Band 8.0+ Guide",
                category: "language",
                price: 129000,
                description: "Bộ đề IELTS Writing kèm bài mẫu band 8.0+.",
                file: "documents/ielts-writing-band8.pdf",
                driveLink: "https://drive.google.com/drive/folders/2BcdEfgHijKlMnOpQrStUvWxYz",
                type: DOCUMENT_TYPES.PDF,
                pages: 210,
                format: "PDF",
                downloads: 1876,
                rating: 4.7,
                author: "Cambridge IELTS Team",
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                name: "Python cho Data Science - Video Course",
                category: "programming",
                price: 299000,
                description: "Khóa học video Python ứng dụng trong Data Science.",
                file: "https://www.youtube.com/playlist?list=PL-abc123def456ghi789",
                driveLink: "",
                type: DOCUMENT_TYPES.VIDEO,
                pages: 0,
                format: "Video Course",
                downloads: 1567,
                rating: 4.8,
                author: "Data Science Pro",
                videoUrl: "https://www.youtube.com/playlist?list=PL-abc123def456ghi789",
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                name: "Vật lý lượng tử cơ bản",
                category: "science",
                price: 159000,
                description: "Tài liệu và video bài giảng về vật lý lượng tử.",
                file: "documents/vat-ly-luong-tu.pdf",
                driveLink: "https://drive.google.com/drive/folders/3CdeFghIjkLmNoPqRsTuVwXyZ",
                type: DOCUMENT_TYPES.LINK,
                pages: 320,
                format: "PDF + Video Links",
                downloads: 1123,
                rating: 4.6,
                author: "GS. Trần Văn Lý",
                featured: true,
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem(DB_KEYS.DOCUMENTS, JSON.stringify(DOCUMENTS));
        console.log("📚 Đã tạo dữ liệu tài liệu mẫu");
    }
    
    // Cập nhật số lượng category
    updateCategoryCounts();
}

// Cập nhật số lượng tài liệu trong mỗi category
function updateCategoryCounts() {
    CATEGORIES.forEach(category => {
        if (category.id === 'all') {
            category.count = DOCUMENTS.length;
        } else {
            category.count = DOCUMENTS.filter(doc => doc.category === category.id).length;
        }
    });
}

// ============================================
// BILL DATABASE FUNCTIONS
// ============================================

function getAllBills() {
    const bills = localStorage.getItem(DB_KEYS.BILLS);
    return bills ? JSON.parse(bills) : [];
}

function saveBill(bill) {
    const bills = getAllBills();
    const billId = 'BILL' + Date.now().toString().slice(-8);
    const newBill = {
        ...bill,
        id: billId,
        createdAt: new Date().toISOString(),
        status: ORDER_STATUS.PENDING, // Mặc định là chờ xác nhận
        confirmedAt: null,
        confirmedBy: null
    };
    
    bills.push(newBill);
    localStorage.setItem(DB_KEYS.BILLS, JSON.stringify(bills));
    return newBill;
}

function updateBill(billId, updates) {
    const bills = getAllBills();
    const index = bills.findIndex(bill => bill.id === billId);
    
    if (index !== -1) {
        bills[index] = { ...bills[index], ...updates };
        localStorage.setItem(DB_KEYS.BILLS, JSON.stringify(bills));
        return bills[index];
    }
    return null;
}

function getUserBills(userId) {
    const bills = getAllBills();
    return bills.filter(bill => bill.userId === userId);
}

function getBillById(billId) {
    const bills = getAllBills();
    return bills.find(bill => bill.id === billId);
}

// ============================================
// ORDER FUNCTIONS - VỚI TRẠNG THÁI PHÊ DUYỆT
// ============================================

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    
    // Thêm driveLink nếu chưa có
    if (!order.driveLink) {
        order.driveLink = '';
    }
    
    orders.push(order);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return order;
}

function updateOrder(orderId, updates) {
    const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    const index = orders.findIndex(order => order.id === orderId);
    
    if (index !== -1) {
        orders[index] = { ...orders[index], ...updates };
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
        return orders[index];
    }
    return null;
}

function getUserOrders(userId) {
    const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    return orders.filter(order => order.userId === userId);
}

function getAllOrders() {
    return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
}

// Phê duyệt hoặc từ chối đơn hàng
function processOrder(orderId, action, adminName, driveLink = '') {
    const orders = JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || '[]');
    const index = orders.findIndex(order => order.id === orderId);
    
    if (index === -1) return null;
    
    let status, message;
    
    if (action === 'approve') {
        status = ORDER_STATUS.APPROVED;
        message = `Đơn hàng đã được phê duyệt bởi ${adminName}`;
        
        // Cập nhật link drive nếu có
        if (driveLink) {
            orders[index].driveLink = driveLink;
        }
        
        // Thêm vào downloads với trạng thái approved
        addToDownloads(orders[index].userId, orders[index], orders[index].billId, 'approved');
        
    } else if (action === 'reject') {
        status = ORDER_STATUS.REJECTED;
        message = `Đơn hàng đã bị từ chối bởi ${adminName}`;
        
        // Cập nhật bill status
        const bill = getBillById(orders[index].billId);
        if (bill) {
            updateBill(bill.id, { 
                status: ORDER_STATUS.REJECTED,
                confirmedAt: new Date().toISOString(),
                confirmedBy: adminName,
                rejectionReason: 'Đơn hàng bị từ chối bởi admin'
            });
        }
        
    } else if (action === 'complete') {
        status = ORDER_STATUS.COMPLETED;
        message = `Đơn hàng đã hoàn thành bởi ${adminName}`;
    }
    
    orders[index].status = status;
    orders[index].processedBy = adminName;
    orders[index].processedAt = new Date().toISOString();
    orders[index].processMessage = message;
    
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    
    return orders[index];
}

// ============================================
// DOWNLOAD FUNCTIONS - VỚI DRIVE LINK
// ============================================

function addToDownloads(userId, order, billId, status = 'pending') {
    const downloads = JSON.parse(localStorage.getItem(DB_KEYS.DOWNLOADS) || '{}');
    
    if (!downloads[userId]) {
        downloads[userId] = [];
    }
    
    order.items.forEach(item => {
        const doc = DOCUMENTS.find(d => d.id === item.id);
        if (doc) {
            // Kiểm tra xem đã tồn tại chưa
            const existing = downloads[userId].find(d => 
                d.documentId === doc.id && d.orderId === order.id
            );
            
            if (!existing) {
                const downloadItem = {
                    documentId: doc.id,
                    name: doc.name,
                    file: doc.file,
                    type: doc.type,
                    format: doc.format,
                    orderId: order.id,
                    purchasedDate: order.date || new Date().toISOString(),
                    status: status,
                    billId: billId,
                    downloadDate: null,
                    driveLink: order.driveLink || doc.driveLink || '',
                    videoUrl: doc.videoUrl || '',
                    isVideo: doc.type === DOCUMENT_TYPES.VIDEO
                };
                
                // Nếu đã approved, thêm ngày xác nhận
                if (status === 'approved') {
                    downloadItem.confirmedDate = new Date().toISOString();
                }
                
                downloads[userId].push(downloadItem);
                
                // Tăng số lượt tải của tài liệu
                doc.downloads = (doc.downloads || 0) + 1;
            }
        }
    });
    
    // Cập nhật số lượt tải trong database
    localStorage.setItem(DB_KEYS.DOCUMENTS, JSON.stringify(DOCUMENTS));
    localStorage.setItem(DB_KEYS.DOWNLOADS, JSON.stringify(downloads));
    
    // Trả về downloads của user
    return downloads[userId] || [];
}

function getUserDownloads(userId) {
    const downloads = JSON.parse(localStorage.getItem(DB_KEYS.DOWNLOADS) || '{}');
    return downloads[userId] || [];
}

function updateDownloadStatus(userId, documentId, downloadDate = null) {
    const downloads = JSON.parse(localStorage.getItem(DB_KEYS.DOWNLOADS) || '{}');
    
    if (downloads[userId]) {
        const downloadIndex = downloads[userId].findIndex(d => d.documentId === documentId);
        if (downloadIndex !== -1 && downloadDate) {
            downloads[userId][downloadIndex].downloadDate = downloadDate;
            localStorage.setItem(DB_KEYS.DOWNLOADS, JSON.stringify(downloads));
            return true;
        }
    }
    return false;
}

// ============================================
// CART FUNCTIONS
// ============================================

function loadCart() {
    if (currentUser) {
        const carts = JSON.parse(localStorage.getItem(DB_KEYS.CARTS) || '{}');
        cart = carts[currentUser.id] || [];
        updateCartCount();
    } else {
        cart = [];
        updateCartCount();
    }
}

function saveCart() {
    if (currentUser) {
        const carts = JSON.parse(localStorage.getItem(DB_KEYS.CARTS) || '{}');
        carts[currentUser.id] = cart;
        localStorage.setItem(DB_KEYS.CARTS, JSON.stringify(carts));
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) cartCount.textContent = count;
}

function updateQuantity(docId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(docId);
        return;
    }
    
    const item = cart.find(item => item.id === docId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        renderCart();
    }
}

function removeFromCart(docId) {
    const item = cart.find(item => item.id === docId);
    if (item) {
        cart = cart.filter(item => item.id !== docId);
        saveCart();
        updateCartCount();
        renderCart();
        showToast('Đã xóa sản phẩm khỏi giỏ hàng!', 'info');
    }
}

// ============================================
// USER FUNCTIONS - VỚI TÍNH NĂNG XOÁ
// ============================================

function getAllUsers() {
    const users = localStorage.getItem(DB_KEYS.USERS);
    return users ? JSON.parse(users).filter(user => user.isActive !== false) : [];
}

function getAllUsersIncludingInactive() {
    const users = localStorage.getItem(DB_KEYS.USERS);
    return users ? JSON.parse(users) : [];
}

function getUserById(userId) {
    const users = getAllUsers();
    return users.find(user => user.id === userId);
}

function updateUser(userId, updates) {
    const users = getAllUsersIncludingInactive();
    const index = users.findIndex(user => user.id === userId);
    
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
        
        // Nếu là user hiện tại, cập nhật currentUser
        if (currentUser && currentUser.id === userId) {
            currentUser = users[index];
            localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        }
        
        return users[index];
    }
    return null;
}

function deleteUser(userId) {
    const users = getAllUsersIncludingInactive();
    const index = users.findIndex(user => user.id === userId);
    
    if (index === -1) return false;
    
    // Không cho xóa chính mình
    if (currentUser && currentUser.id === userId) {
        showToast('Không thể xóa tài khoản của chính bạn!', 'error');
        return false;
    }
    
    // Soft delete: đánh dấu isActive = false
    users[index].isActive = false;
    users[index].deletedAt = new Date().toISOString();
    users[index].deletedBy = currentUser ? currentUser.name : 'System';
    
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    
    return true;
}

function restoreUser(userId) {
    const users = getAllUsersIncludingInactive();
    const index = users.findIndex(user => user.id === userId);
    
    if (index === -1) return false;
    
    users[index].isActive = true;
    users[index].restoredAt = new Date().toISOString();
    users[index].restoredBy = currentUser ? currentUser.name : 'System';
    
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    
    return true;
}
