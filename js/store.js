// ============================================
// STORE - CỬA HÀNG & DANH MỤC
// ============================================

function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    // Cập nhật số lượng category
    updateCategoryCounts();
    
    let html = '';
    CATEGORIES.forEach(category => {
        const isActive = category.id === selectedCategory;
        html += `
            <div class="category-card ${isActive ? 'active' : ''}" 
                 data-category-id="${category.id}"
                 style="border-color: ${category.color}">
                <div class="category-icon">
                    <i class="${category.icon}" style="color: ${category.color}"></i>
                </div>
                <h3 class="category-title">${category.name}</h3>
                <span class="category-count">${category.count} tài liệu</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderDocuments() {
    const container = document.getElementById('documentsGrid');
    if (!container) return;
    
    // Lọc theo category
    let filteredDocs = [...DOCUMENTS];
    if (selectedCategory !== 'all') {
        filteredDocs = filteredDocs.filter(doc => doc.category === selectedCategory);
    }
    
    // Lọc theo search
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (search) {
        filteredDocs = filteredDocs.filter(doc => 
            doc.name.toLowerCase().includes(search) ||
            doc.description.toLowerCase().includes(search) ||
            doc.author.toLowerCase().includes(search)
        );
    }
    
    // Sắp xếp
    const sort = document.getElementById('sortSelect')?.value || 'newest';
    switch(sort) {
        case 'price-low':
            filteredDocs.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredDocs.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            filteredDocs.sort((a, b) => b.downloads - a.downloads);
            break;
        default:
            filteredDocs.sort((a, b) => b.id - a.id);
    }
    
    // Render
    if (filteredDocs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search fa-3x"></i>
                </div>
                <h3>Không tìm thấy tài liệu</h3>
                <p>Thử tìm kiếm với từ khóa khác</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredDocs.forEach(doc => {
        const category = CATEGORIES.find(c => c.id === doc.category) || CATEGORIES[0];
        const isVideo = doc.type === DOCUMENT_TYPES.VIDEO;
        const isDriveLink = doc.type === DOCUMENT_TYPES.LINK || doc.driveLink;
        
        html += `
            <div class="document-card">
                <div class="doc-image" style="background: linear-gradient(135deg, ${category.color}20, ${category.color}40)">
                    <i class="${isVideo ? 'fas fa-video' : 'fas fa-file-pdf'}" style="color: ${category.color}"></i>
                    ${doc.featured ? '<span class="doc-badge" style="background: var(--accent);">NỔI BẬT</span>' : ''}
                    ${isVideo ? '<span class="doc-badge" style="background: var(--danger);">VIDEO</span>' : ''}
                    ${isDriveLink ? '<span class="doc-badge" style="background: var(--primary);">DRIVE LINK</span>' : ''}
                    ${doc.originalPrice ? `<span class="doc-badge" style="background: var(--warning);">-${Math.round((1 - doc.price/doc.originalPrice) * 100)}%</span>` : ''}
                </div>
                <div class="doc-content">
                    <span class="doc-category" style="color: ${category.color}">${getCategoryName(doc.category)}</span>
                    <h3 class="doc-title">
                        ${doc.name} 
                        ${isVideo ? '<i class="fas fa-video" style="color: var(--danger); font-size: 0.8em; margin-left: 5px;"></i>' : ''}
                    </h3>
                    <p class="doc-description">${doc.description}</p>
                    
                    <div class="doc-meta">
                        <span><i class="fas fa-user"></i> ${doc.author}</span>
                        <span><i class="fas fa-file"></i> ${doc.format}</span>
                        <span><i class="fas fa-download"></i> ${doc.downloads.toLocaleString()}</span>
                        <span><i class="fas fa-star" style="color: #f9c74f"></i> ${doc.rating}</span>
                    </div>
                    
                    <div class="doc-price">
                        ${formatPrice(doc.price)}
                        ${doc.originalPrice ? 
                            `<small style="display: block; font-size: 0.9rem; color: #999; text-decoration: line-through;">
                                ${formatPrice(doc.originalPrice)}
                            </small>` : ''
                        }
                    </div>
                    
                    <div class="doc-actions">
                        <button class="btn-outline" onclick="previewDocument(${doc.id})">
                            <i class="fas fa-eye"></i> Xem trước
                        </button>
                        <button class="btn-primary" onclick="addToCart(${doc.id})">
                            <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function previewDocument(docId) {
    const doc = DOCUMENTS.find(d => d.id === docId);
    if (!doc) {
        showToast('Không tìm thấy tài liệu!', 'error');
        return;
    }
    
    const isVideo = doc.type === DOCUMENT_TYPES.VIDEO;
    
    // Tạo modal xem trước
    const modalHTML = `
        <div class="modal active" id="previewModal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="${isVideo ? 'fas fa-video' : 'fas fa-eye'}"></i> Xem trước: ${doc.name}</h3>
                    <button class="close-modal" onclick="closeModal('previewModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="preview-content">
                        <div class="preview-header">
                            <div class="preview-category">
                                <i class="${CATEGORIES.find(c => c.id === doc.category)?.icon || 'fas fa-file'}" 
                                   style="color: ${CATEGORIES.find(c => c.id === doc.category)?.color || '#4361ee'}"></i>
                                ${getCategoryName(doc.category)}
                                ${isVideo ? '<span class="status" style="background: var(--danger); margin-left: 10px;">VIDEO</span>' : ''}
                            </div>
                            <div class="preview-price">
                                ${formatPrice(doc.price)}
                            </div>
                        </div>
                        
                        <h4>Mô tả chi tiết:</h4>
                        <p class="preview-description">${doc.description}</p>
                        
                        ${isVideo ? `
                            <div class="preview-notice" style="background: rgba(249, 65, 68, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                                <i class="fas fa-info-circle" style="color: var(--danger);"></i>
                                <strong>Sau khi mua:</strong> Bạn sẽ nhận được link YouTube để xem video
                            </div>
                        ` : ''}
                        
                        <div class="preview-details">
                            <div class="detail-item">
                                <i class="fas fa-user"></i>
                                <span><strong>Tác giả:</strong> ${doc.author}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-file"></i>
                                <span><strong>Định dạng:</strong> ${doc.format}</span>
                            </div>
                            ${doc.pages ? `
                                <div class="detail-item">
                                    <i class="fas fa-file-alt"></i>
                                    <span><strong>Số trang:</strong> ${doc.pages} trang</span>
                                </div>
                            ` : ''}
                            <div class="detail-item">
                                <i class="fas fa-download"></i>
                                <span><strong>Lượt tải:</strong> ${doc.downloads.toLocaleString()}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-star" style="color: #f9c74f"></i>
                                <span><strong>Đánh giá:</strong> ${doc.rating}/5.0</span>
                            </div>
                            ${doc.driveLink ? `
                                <div class="detail-item">
                                    <i class="fas fa-link"></i>
                                    <span><strong>Drive Link:</strong> Có sẵn sau khi mua</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="preview-actions">
                            <button class="btn-outline" onclick="closeModal('previewModal')">
                                <i class="fas fa-times"></i> Đóng
                            </button>
                            <button class="btn-primary" onclick="addToCart(${doc.id}); closeModal('previewModal')">
                                <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Đóng khi click bên ngoài
    const modal = document.getElementById('previewModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('previewModal');
        }
    });
}

function getCategoryName(categoryId) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
}

// Export functions
window.previewDocument = previewDocument;