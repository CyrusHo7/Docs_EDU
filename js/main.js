// ============================================
// MAIN - ĐIỀU PHỐI CHÍNH
// ============================================

// Khởi tạo toàn bộ ứng dụng
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 EduDocs - Starting application...");
    
    // Kiểm tra nếu đã khởi tạo
    if (typeof initApp === 'function') {
        initApp();
    } else {
        console.error("❌ initApp function not found!");
    }
});

// Global functions
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.processCheckout = processCheckout;
window.previewDocument = previewDocument;
window.loadUserDownloads = loadUserDownloads;
window.renderMyDocuments = renderMyDocuments;
window.downloadSingleFile = downloadSingleFile;
window.viewBill = viewBill;
window.closeModal = closeModal;
window.showDocumentManager = showDocumentManager;
window.showUserManager = showUserManager;
window.showOrderManager = showOrderManager;

// Debug info
console.log("🌐 EduDocs Application Loaded");
console.log("📚 Documents count:", DOCUMENTS ? DOCUMENTS.length : 0);
console.log("👤 Current user:", currentUser ? currentUser.name : "None");