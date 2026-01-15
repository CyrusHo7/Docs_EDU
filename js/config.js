// ============================================
// CONFIG - CẤU HÌNH HẰNG SỐ VÀ BIẾN TOÀN CỤC
// ============================================

// Database keys
const DB_KEYS = {
    USERS: 'edudocs_users',
    CURRENT_USER: 'edudocs_current_user',
    CARTS: 'edudocs_carts',
    ORDERS: 'edudocs_orders',
    BILLS: 'edudocs_bills',
    DOWNLOADS: 'edudocs_downloads',
    DOCUMENTS: 'edudocs_documents'
};

// Biến toàn cục
let currentUser = null;
let cart = [];
let currentOrder = null;
let currentDownloads = [];
let selectedCategory = "all";
let currentBillView = null;

// Dữ liệu tài liệu - sẽ được khởi tạo từ database
let DOCUMENTS = [];

// Danh mục
const CATEGORIES = [
    { id: "all", name: "Tất cả", icon: "fas fa-th", color: "#4361ee", count: 0 },
    { id: "math", name: "Toán học", icon: "fas fa-calculator", color: "#4cc9f0", count: 0 },
    { id: "programming", name: "Lập trình", icon: "fas fa-code", color: "#7209b7", count: 0 },
    { id: "language", name: "Ngoại ngữ", icon: "fas fa-language", color: "#f72585", count: 0 },
    { id: "science", name: "Khoa học", icon: "fas fa-flask", color: "#f8961e", count: 0 },
    { id: "video", name: "Video", icon: "fas fa-video", color: "#f94144", count: 0 }
];

// Loại tài liệu
const DOCUMENT_TYPES = {
    PDF: 'pdf',
    VIDEO: 'video',
    ZIP: 'zip',
    LINK: 'link'
};

// Trạng thái đơn hàng
const ORDER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed'
};