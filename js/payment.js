// ============================================
// PAYMENT - THANH TOÁN & UPLOAD BILL (CHỜ ADMIN DUYỆT)
// ============================================

function setupUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const billFile = document.getElementById('billFile');
    const selectBillBtn = document.getElementById('selectBillBtn');
    
    if (!uploadArea || !billFile || !selectBillBtn) return;
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'rgba(67, 97, 238, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'rgba(67, 97, 238, 0.05)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'rgba(67, 97, 238, 0.05)';
        
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // Click to select
    selectBillBtn.addEventListener('click', () => billFile.click());
    uploadArea.addEventListener('click', () => billFile.click());
    
    billFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Remove file
    const removeBtn = document.getElementById('removeFileBtn');
    if (removeBtn) {
        removeBtn.addEventListener('click', resetUpload);
    }
    
    // Confirm upload (CHỜ ADMIN DUYỆT)
    const confirmBtn = document.getElementById('confirmUploadBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmPaymentUpload);
    }
    
    // Cancel payment
    const cancelBtn = document.getElementById('cancelPaymentBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            showSection('cart');
            resetUpload();
        });
    }
}

function handleFileUpload(file) {
    // Validate file
    if (!file.type.match('image.*')) {
        showToast('Vui lòng chọn file ảnh (JPG, PNG)!', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('File quá lớn (>5MB)!', 'error');
        return;
    }
    
    // Preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImage = document.getElementById('previewImage');
        if (previewImage) previewImage.src = e.target.result;
        
        const uploadArea = document.getElementById('uploadArea');
        const filePreview = document.getElementById('filePreview');
        
        if (uploadArea) uploadArea.style.display = 'none';
        if (filePreview) filePreview.style.display = 'block';
        
        // File info
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
        
        // Kích hoạt nút xác nhận
        const confirmBtn = document.getElementById('confirmUploadBtn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check"></i> Xác nhận Upload';
        }
        
        showToast('✅ File đã sẵn sàng! Nhấn "Xác nhận Upload" để gửi yêu cầu.', 'success');
    };
    reader.readAsDataURL(file);
}

function resetUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const billFile = document.getElementById('billFile');
    const confirmBtn = document.getElementById('confirmUploadBtn');
    
    if (uploadArea) uploadArea.style.display = 'block';
    if (filePreview) filePreview.style.display = 'none';
    if (billFile) billFile.value = '';
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Xác nhận Upload';
    }
}

function confirmPaymentUpload() {
    if (!currentOrder) {
        showToast('Không có đơn hàng nào!', 'error');
        return;
    }
    
    // Lấy ảnh bill
    const previewImage = document.getElementById('previewImage');
    if (!previewImage || !previewImage.src) {
        showToast('Vui lòng upload bill trước!', 'error');
        return;
    }
    
    // Hiển thị loading
    const confirmBtn = document.getElementById('confirmUploadBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi yêu cầu...';
    }
    
    // Xử lý thanh toán (CHỜ ADMIN DUYỆT)
    setTimeout(() => {
        processPaymentRequest();
    }, 1500);
}

function processPaymentRequest() {
    try {
        // Lấy ảnh bill
        const previewImage = document.getElementById('previewImage');
        
        // 1. Tạo bill với trạng thái "pending" - chờ admin duyệt
        const bill = {
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            orderId: currentOrder.id,
            amount: currentOrder.total,
            imageData: previewImage.src,
            status: ORDER_STATUS.PENDING, // CHỜ ADMIN DUYỆT
            date: new Date().toISOString(),
            confirmedAt: null,
            confirmedBy: null
        };
        
        // 2. Lưu bill
        const savedBill = saveBill(bill);
        
        // 3. Lưu order với trạng thái pending
        currentOrder.status = ORDER_STATUS.PENDING;
        currentOrder.billId = savedBill.id;
        const savedOrder = saveOrder(currentOrder);
        
        // 4. Thêm vào downloads với trạng thái "pending" (chờ admin duyệt)
        addToDownloads(currentUser.id, currentOrder, savedBill.id, 'pending');
        
        // 5. Reset cart
        cart = [];
        saveCart();
        updateCartCount();
        
        // 6. Load lại downloads
        loadUserDownloads();
        
        // 7. Reset upload
        resetUpload();
        
        // 8. Hiển thị thông báo thành công
        showToast('✅ Đã gửi yêu cầu thanh toán! Vui lòng chờ admin xác nhận.', 'success');
        
        // 9. Chuyển đến trang tài liệu đã mua
        setTimeout(() => {
            showSection('my-docs');
        }, 1000);
        
    } catch (error) {
        console.error('Lỗi khi xử lý thanh toán:', error);
        showToast('❌ Lỗi khi xử lý thanh toán. Vui lòng thử lại!', 'error');
        
        const confirmBtn = document.getElementById('confirmUploadBtn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check"></i> Xác nhận Upload';
        }
    }
}

// Export functions
window.setupUpload = setupUpload;