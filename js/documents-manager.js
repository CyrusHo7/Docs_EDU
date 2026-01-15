// ============================================
// DOCUMENTS MANAGER - QUẢN LÝ TÀI LIỆU, ĐƠN HÀNG VÀ NGƯỜI DÙNG (CHO ADMIN)
// ============================================

// Kiểm tra quyền admin
function checkAdminAccess() {
    return currentUser && currentUser.role === 'admin';
}

// Thêm tài liệu mới
function addNewDocument(documentData) {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền thêm tài liệu!', 'error');
        return false;
    }
    
    // Tạo ID mới
    const newId = DOCUMENTS.length > 0 ? Math.max(...DOCUMENTS.map(d => d.id)) + 1 : 1;
    
    const newDocument = {
        id: newId,
        ...documentData,
        downloads: 0,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        featured: documentData.featured || false,
        originalPrice: documentData.originalPrice || null,
        pages: documentData.pages || 0,
        type: documentData.type || DOCUMENT_TYPES.PDF,
        videoUrl: documentData.videoUrl || '',
        driveLink: documentData.driveLink || ''
    };
    
    DOCUMENTS.push(newDocument);
    
    // Lưu vào localStorage
    localStorage.setItem(DB_KEYS.DOCUMENTS, JSON.stringify(DOCUMENTS));
    
    // Cập nhật số lượng category
    updateCategoryCounts();
    
    // Render lại store
    renderCategories();
    renderDocuments();
    
    showToast('✅ Đã thêm tài liệu mới!', 'success');
    return true;
}

// Sửa tài liệu
function updateDocument(id, updates) {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền sửa tài liệu!', 'error');
        return false;
    }
    
    const index = DOCUMENTS.findIndex(doc => doc.id === id);
    
    if (index === -1) {
        showToast('Không tìm thấy tài liệu!', 'error');
        return false;
    }
    
    // Cập nhật tài liệu
    DOCUMENTS[index] = { ...DOCUMENTS[index], ...updates, updatedAt: new Date().toISOString() };
    
    // Lưu vào localStorage
    localStorage.setItem(DB_KEYS.DOCUMENTS, JSON.stringify(DOCUMENTS));
    
    // Cập nhật số lượng category
    updateCategoryCounts();
    
    // Render lại store
    renderCategories();
    renderDocuments();
    
    showToast('✅ Đã cập nhật tài liệu!', 'success');
    return true;
}

// Xóa tài liệu
function deleteDocument(id) {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền xóa tài liệu!', 'error');
        return false;
    }
    
    const documentToDelete = DOCUMENTS.find(doc => doc.id === id);
    if (!documentToDelete) {
        showToast('Không tìm thấy tài liệu!', 'error');
        return false;
    }
    
    showConfirmModal(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa tài liệu "${documentToDelete.name}"?<br><small>Hành động này không thể hoàn tác.</small>`,
        () => {
            DOCUMENTS = DOCUMENTS.filter(doc => doc.id !== id);
            
            // Lưu vào localStorage
            localStorage.setItem(DB_KEYS.DOCUMENTS, JSON.stringify(DOCUMENTS));
            
            // Cập nhật số lượng category
            updateCategoryCounts();
            
            // Render lại store
            renderCategories();
            renderDocuments();
            
            showToast('✅ Đã xóa tài liệu!', 'success');
        }
    );
    
    return true;
}

// Hiển thị modal quản lý tài liệu (cho admin)
function showDocumentManager() {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền truy cập!', 'error');
        return;
    }
    
    const modalHTML = `
        <div class="modal active" id="documentManagerModal">
            <div class="modal-content" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3><i class="fas fa-book"></i> Quản lý tài liệu (${DOCUMENTS.length} tài liệu)</h3>
                    <button class="close-modal" onclick="closeModal('documentManagerModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="admin-toolbar">
                        <button class="btn-primary" onclick="showAddDocumentForm()">
                            <i class="fas fa-plus"></i> Thêm tài liệu mới
                        </button>
                        <div class="search-box" style="min-width: 300px;">
                            <i class="fas fa-search"></i>
                            <input type="text" id="searchAdminDocs" placeholder="Tìm tài liệu..." onkeyup="filterAdminDocuments()">
                        </div>
                    </div>
                    
                    <div class="admin-documents-list" id="adminDocumentsList">
                        <!-- Danh sách tài liệu sẽ được hiển thị ở đây -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Thêm modal vào body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Load danh sách tài liệu
    renderAdminDocumentsList();
    
    // Đóng khi click bên ngoài
    const modal = document.getElementById('documentManagerModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('documentManagerModal');
        }
    });
}

// Render danh sách tài liệu cho admin
function renderAdminDocumentsList() {
    const container = document.getElementById('adminDocumentsList');
    if (!container) return;
    
    if (DOCUMENTS.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="margin: 2rem 0;">
                <i class="fas fa-book fa-3x" style="color: var(--gray); margin-bottom: 1rem;"></i>
                <h3>Chưa có tài liệu nào</h3>
                <p>Nhấn "Thêm tài liệu mới" để bắt đầu</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="admin-table-header">
            <div class="row">
                <div style="flex: 2;"><strong>Tên tài liệu</strong></div>
                <div style="flex: 1;"><strong>Danh mục</strong></div>
                <div style="flex: 1;"><strong>Loại</strong></div>
                <div style="flex: 1;"><strong>Giá</strong></div>
                <div style="flex: 1;"><strong>Lượt tải</strong></div>
                <div style="flex: 1;"><strong>Thao tác</strong></div>
            </div>
        </div>
    `;
    
    DOCUMENTS.forEach(doc => {
        const category = CATEGORIES.find(c => c.id === doc.category) || CATEGORIES[0];
        const docType = doc.type || DOCUMENT_TYPES.PDF;
        const typeBadge = docType === DOCUMENT_TYPES.VIDEO ? '<span class="doc-badge-small" style="background: var(--danger);">Video</span>' :
                         docType === DOCUMENT_TYPES.LINK ? '<span class="doc-badge-small" style="background: var(--primary);">Link</span>' :
                         '<span class="doc-badge-small" style="background: var(--success);">File</span>';
        
        html += `
            <div class="admin-document-item" data-id="${doc.id}">
                <div class="row">
                    <div style="flex: 2;">
                        <strong>${doc.name}</strong>
                        <p class="small">${doc.author}</p>
                        <span class="doc-badge-small" style="background: ${category.color}">${category.name}</span>
                        ${doc.featured ? '<span class="doc-badge-small" style="background: var(--accent);">Nổi bật</span>' : ''}
                        ${typeBadge}
                    </div>
                    <div style="flex: 1;">${getCategoryName(doc.category)}</div>
                    <div style="flex: 1;">${docType.toUpperCase()}</div>
                    <div style="flex: 1;">${formatPrice(doc.price)}</div>
                    <div style="flex: 1;">${doc.downloads.toLocaleString()}</div>
                    <div style="flex: 1;">
                        <button class="btn-small btn-outline" onclick="showEditDocumentForm(${doc.id})" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-small btn-danger" onclick="deleteDocument(${doc.id})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Form thêm tài liệu
function showAddDocumentForm() {
    closeModal('documentManagerModal');
    
    const formHTML = `
        <div class="modal active" id="addDocumentModal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Thêm tài liệu mới</h3>
                    <button class="close-modal" onclick="closeModal('addDocumentModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addDocumentForm" class="auth-form">
                        <div class="input-group">
                            <i class="fas fa-file-alt"></i>
                            <input type="text" id="docName" placeholder="Tên tài liệu *" required>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-tags"></i>
                            <select id="docCategory" required>
                                <option value="">Chọn danh mục *</option>
                                ${CATEGORIES.filter(c => c.id !== 'all').map(c => `
                                    <option value="${c.id}">${c.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-file"></i>
                            <select id="docType" required>
                                <option value="${DOCUMENT_TYPES.PDF}">File (PDF/ZIP)</option>
                                <option value="${DOCUMENT_TYPES.VIDEO}">Video</option>
                                <option value="${DOCUMENT_TYPES.LINK}">Drive Link</option>
                            </select>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-user"></i>
                            <input type="text" id="docAuthor" placeholder="Tác giả *" required>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-align-left"></i>
                            <textarea id="docDescription" placeholder="Mô tả chi tiết *" rows="4" required></textarea>
                        </div>
                        
                        <div class="row">
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-money-bill"></i>
                                <input type="number" id="docPrice" placeholder="Giá (VNĐ) *" min="0" required>
                            </div>
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-tag"></i>
                                <input type="number" id="docOriginalPrice" placeholder="Giá gốc (nếu có)" min="0">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-file"></i>
                                <input type="text" id="docFormat" placeholder="Định dạng *" required>
                            </div>
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-file-alt"></i>
                                <input type="number" id="docPages" placeholder="Số trang" min="0">
                            </div>
                        </div>
                        
                        <div id="videoUrlField" style="display: none;">
                            <div class="input-group">
                                <i class="fas fa-video"></i>
                                <input type="text" id="docVideoUrl" placeholder="Link YouTube/Vimeo">
                                <small style="display: block; margin-top: 5px; color: var(--gray); font-size: 12px;">
                                    Để trống nếu chưa có
                                </small>
                            </div>
                        </div>
                        
                        <div id="driveLinkField" style="display: none;">
                            <div class="input-group">
                                <i class="fas fa-link"></i>
                                <input type="text" id="docDriveLink" placeholder="Link Google Drive">
                                <small style="display: block; margin-top: 5px; color: var(--gray); font-size: 12px;">
                                    Để trống nếu chưa có
                                </small>
                            </div>
                        </div>
                        
                        <div id="fileField">
                            <div class="input-group">
                                <i class="fas fa-link"></i>
                                <input type="text" id="docFile" placeholder="Link file tài liệu">
                                <small style="display: block; margin-top: 5px; color: var(--gray); font-size: 12px;">
                                    Ví dụ: documents/tai-lieu.pdf (có thể để trống)
                                </small>
                            </div>
                        </div>
                        
                        <div class="form-checkbox">
                            <input type="checkbox" id="docFeatured">
                            <label for="docFeatured">Đánh dấu là tài liệu nổi bật</label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('addDocumentModal'); showDocumentManager()">
                                <i class="fas fa-arrow-left"></i> Quay lại
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> Lưu tài liệu
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = formHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Hiển thị/ẩn các field theo loại tài liệu
    const docTypeSelect = document.getElementById('docType');
    if (docTypeSelect) {
        docTypeSelect.addEventListener('change', function() {
            const type = this.value;
            document.getElementById('videoUrlField').style.display = type === DOCUMENT_TYPES.VIDEO ? 'block' : 'none';
            document.getElementById('driveLinkField').style.display = type === DOCUMENT_TYPES.LINK ? 'block' : 'none';
            document.getElementById('fileField').style.display = type === DOCUMENT_TYPES.PDF ? 'block' : 'none';
        });
    }
    
    // Submit form
    const form = document.getElementById('addDocumentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const documentData = {
                name: document.getElementById('docName').value,
                category: document.getElementById('docCategory').value,
                type: document.getElementById('docType').value,
                author: document.getElementById('docAuthor').value,
                description: document.getElementById('docDescription').value,
                price: parseInt(document.getElementById('docPrice').value),
                originalPrice: document.getElementById('docOriginalPrice').value ? 
                    parseInt(document.getElementById('docOriginalPrice').value) : null,
                format: document.getElementById('docFormat').value,
                pages: document.getElementById('docPages').value ? 
                    parseInt(document.getElementById('docPages').value) : 0,
                file: document.getElementById('docFile').value || '',
                featured: document.getElementById('docFeatured').checked,
                videoUrl: document.getElementById('docVideoUrl')?.value || '',
                driveLink: document.getElementById('docDriveLink')?.value || ''
            };
            
            if (addNewDocument(documentData)) {
                closeModal('addDocumentModal');
                setTimeout(() => showDocumentManager(), 300);
            }
        });
    }
    
    // Đóng khi click bên ngoài
    const modal = document.getElementById('addDocumentModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('addDocumentModal');
            setTimeout(() => showDocumentManager(), 300);
        }
    });
}

// Form sửa tài liệu
function showEditDocumentForm(docId) {
    closeModal('documentManagerModal');
    
    const doc = DOCUMENTS.find(d => d.id === docId);
    if (!doc) return;
    
    const formHTML = `
        <div class="modal active" id="editDocumentModal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Sửa tài liệu</h3>
                    <button class="close-modal" onclick="closeModal('editDocumentModal'); setTimeout(() => showDocumentManager(), 300)">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editDocumentForm" class="auth-form">
                        <input type="hidden" id="editDocId" value="${doc.id}">
                        
                        <div class="input-group">
                            <i class="fas fa-file-alt"></i>
                            <input type="text" id="editDocName" value="${doc.name}" required>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-tags"></i>
                            <select id="editDocCategory" required>
                                ${CATEGORIES.filter(c => c.id !== 'all').map(c => `
                                    <option value="${c.id}" ${doc.category === c.id ? 'selected' : ''}>${c.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-file"></i>
                            <select id="editDocType" required>
                                <option value="${DOCUMENT_TYPES.PDF}" ${doc.type === DOCUMENT_TYPES.PDF ? 'selected' : ''}>File (PDF/ZIP)</option>
                                <option value="${DOCUMENT_TYPES.VIDEO}" ${doc.type === DOCUMENT_TYPES.VIDEO ? 'selected' : ''}>Video</option>
                                <option value="${DOCUMENT_TYPES.LINK}" ${doc.type === DOCUMENT_TYPES.LINK ? 'selected' : ''}>Drive Link</option>
                            </select>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-user"></i>
                            <input type="text" id="editDocAuthor" value="${doc.author}" required>
                        </div>
                        
                        <div class="input-group">
                            <i class="fas fa-align-left"></i>
                            <textarea id="editDocDescription" rows="4" required>${doc.description}</textarea>
                        </div>
                        
                        <div class="row">
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-money-bill"></i>
                                <input type="number" id="editDocPrice" value="${doc.price}" min="0" required>
                            </div>
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-tag"></i>
                                <input type="number" id="editDocOriginalPrice" value="${doc.originalPrice || ''}" min="0" placeholder="Giá gốc">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-file"></i>
                                <input type="text" id="editDocFormat" value="${doc.format}" required>
                            </div>
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-file-alt"></i>
                                <input type="number" id="editDocPages" value="${doc.pages}" min="0" placeholder="Số trang">
                            </div>
                        </div>
                        
                        <div id="editVideoUrlField" style="display: ${doc.type === DOCUMENT_TYPES.VIDEO ? 'block' : 'none'}">
                            <div class="input-group">
                                <i class="fas fa-video"></i>
                                <input type="text" id="editDocVideoUrl" value="${doc.videoUrl || ''}" placeholder="Link YouTube/Vimeo">
                            </div>
                        </div>
                        
                        <div id="editDriveLinkField" style="display: ${doc.type === DOCUMENT_TYPES.LINK ? 'block' : 'none'}">
                            <div class="input-group">
                                <i class="fas fa-link"></i>
                                <input type="text" id="editDocDriveLink" value="${doc.driveLink || ''}" placeholder="Link Google Drive">
                            </div>
                        </div>
                        
                        <div id="editFileField" style="display: ${doc.type === DOCUMENT_TYPES.PDF ? 'block' : 'none'}">
                            <div class="input-group">
                                <i class="fas fa-link"></i>
                                <input type="text" id="editDocFile" value="${doc.file}" placeholder="Link file tài liệu">
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-download"></i>
                                <input type="number" id="editDocDownloads" value="${doc.downloads}" min="0">
                                <label style="font-size: 12px;">Lượt tải</label>
                            </div>
                            <div class="input-group" style="flex: 1;">
                                <i class="fas fa-star"></i>
                                <input type="number" id="editDocRating" value="${doc.rating}" min="0" max="5" step="0.1">
                                <label style="font-size: 12px;">Đánh giá</label>
                            </div>
                        </div>
                        
                        <div class="form-checkbox">
                            <input type="checkbox" id="editDocFeatured" ${doc.featured ? 'checked' : ''}>
                            <label for="editDocFeatured">Đánh dấu là tài liệu nổi bật</label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('editDocumentModal'); setTimeout(() => showDocumentManager(), 300)">
                                <i class="fas fa-arrow-left"></i> Quay lại
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i> Cập nhật
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = formHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Hiển thị/ẩn các field theo loại tài liệu
    const docTypeSelect = document.getElementById('editDocType');
    if (docTypeSelect) {
        docTypeSelect.addEventListener('change', function() {
            const type = this.value;
            document.getElementById('editVideoUrlField').style.display = type === DOCUMENT_TYPES.VIDEO ? 'block' : 'none';
            document.getElementById('editDriveLinkField').style.display = type === DOCUMENT_TYPES.LINK ? 'block' : 'none';
            document.getElementById('editFileField').style.display = type === DOCUMENT_TYPES.PDF ? 'block' : 'none';
        });
    }
    
    // Submit form
    const form = document.getElementById('editDocumentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const updates = {
                name: document.getElementById('editDocName').value,
                category: document.getElementById('editDocCategory').value,
                type: document.getElementById('editDocType').value,
                author: document.getElementById('editDocAuthor').value,
                description: document.getElementById('editDocDescription').value,
                price: parseInt(document.getElementById('editDocPrice').value),
                originalPrice: document.getElementById('editDocOriginalPrice').value ? 
                    parseInt(document.getElementById('editDocOriginalPrice').value) : null,
                format: document.getElementById('editDocFormat').value,
                pages: document.getElementById('editDocPages').value ? 
                    parseInt(document.getElementById('editDocPages').value) : 0,
                file: document.getElementById('editDocFile').value || '',
                downloads: parseInt(document.getElementById('editDocDownloads').value) || 0,
                rating: parseFloat(document.getElementById('editDocRating').value) || 5.0,
                featured: document.getElementById('editDocFeatured').checked,
                videoUrl: document.getElementById('editDocVideoUrl')?.value || '',
                driveLink: document.getElementById('editDocDriveLink')?.value || ''
            };
            
            if (updateDocument(doc.id, updates)) {
                closeModal('editDocumentModal');
                setTimeout(() => showDocumentManager(), 300);
            }
        });
    }
    
    // Đóng khi click bên ngoài
    const modal = document.getElementById('editDocumentModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('editDocumentModal');
            setTimeout(() => showDocumentManager(), 300);
        }
    });
}

// Lọc tài liệu trong admin
function filterAdminDocuments() {
    const search = document.getElementById('searchAdminDocs')?.value.toLowerCase() || '';
    
    document.querySelectorAll('.admin-document-item').forEach(item => {
        const docId = parseInt(item.dataset.id);
        const doc = DOCUMENTS.find(d => d.id === docId);
        
        if (doc && (
            doc.name.toLowerCase().includes(search) ||
            doc.author.toLowerCase().includes(search) ||
            doc.description.toLowerCase().includes(search) ||
            doc.category.toLowerCase().includes(search)
        )) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Quản lý người dùng (admin) - VỚI CHỨC NĂNG XOÁ
function showUserManager() {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền truy cập!', 'error');
        return;
    }
    
    const users = getAllUsersIncludingInactive();
    
    const modalHTML = `
        <div class="modal active" id="userManagerModal">
            <div class="modal-content" style="max-width: 900px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3><i class="fas fa-users"></i> Quản lý người dùng (${users.length} user)</h3>
                    <button class="close-modal" onclick="closeModal('userManagerModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="admin-toolbar">
                        <div class="search-box" style="min-width: 300px;">
                            <i class="fas fa-search"></i>
                            <input type="text" id="searchUsers" placeholder="Tìm người dùng..." onkeyup="filterUsers()">
                        </div>
                    </div>
                    
                    <div class="admin-table-header">
                        <div class="row">
                            <div style="flex: 2;"><strong>Tên người dùng</strong></div>
                            <div style="flex: 2;"><strong>Email</strong></div>
                            <div style="flex: 1;"><strong>Vai trò</strong></div>
                            <div style="flex: 1;"><strong>Trạng thái</strong></div>
                            <div style="flex: 1;"><strong>Ngày tạo</strong></div>
                            <div style="flex: 1;"><strong>Thao tác</strong></div>
                        </div>
                    </div>
                    
                    <div id="usersList">
                        ${users.map(user => `
                            <div class="admin-document-item" data-user-id="${user.id}">
                                <div class="row">
                                    <div style="flex: 2;">
                                        <strong>${user.name}</strong>
                                        ${user.id === currentUser.id ? '<span class="doc-badge-small" style="background: var(--primary);">Bạn</span>' : ''}
                                    </div>
                                    <div style="flex: 2;">${user.email}</div>
                                    <div style="flex: 1;">
                                        <span class="status ${user.role === 'admin' ? 'status-confirmed' : 'status-pending'}">
                                            ${user.role === 'admin' ? 'Admin' : 'User'}
                                        </span>
                                    </div>
                                    <div style="flex: 1;">
                                        <span class="status ${user.isActive === false ? 'status-rejected' : 'status-confirmed'}">
                                            ${user.isActive === false ? 'Đã xoá' : 'Hoạt động'}
                                        </span>
                                    </div>
                                    <div style="flex: 1;">${formatDate(user.createdAt)}</div>
                                    <div style="flex: 1;">
                                        ${user.id !== currentUser.id ? `
                                            ${user.isActive === false ? `
                                                <button class="btn-small btn-success" onclick="restoreUserAccount(${user.id})" title="Khôi phục">
                                                    <i class="fas fa-undo"></i>
                                                </button>
                                            ` : `
                                                <button class="btn-small btn-danger" onclick="deleteUserAccount(${user.id})" title="Xoá">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            `}
                                        ` : '<span class="text-gray">-</span>'}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Đóng khi click bên ngoài
    const modal = document.getElementById('userManagerModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('userManagerModal');
        }
    });
}

// Xoá tài khoản người dùng
function deleteUserAccount(userId) {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền xoá tài khoản!', 'error');
        return;
    }
    
    const user = getUserById(userId);
    if (!user) {
        showToast('Không tìm thấy người dùng!', 'error');
        return;
    }
    
    if (userId === currentUser.id) {
        showToast('Không thể xoá tài khoản của chính bạn!', 'error');
        return;
    }
    
    showConfirmModal(
        'Xác nhận xoá tài khoản',
        `Bạn có chắc chắn muốn xoá tài khoản "${user.name}" (${user.email})?<br>
         <small>Tài khoản sẽ bị vô hiệu hoá và không thể đăng nhập. Dữ liệu đơn hàng vẫn được giữ lại.</small>`,
        () => {
            if (deleteUser(userId)) {
                showToast('✅ Đã xoá tài khoản người dùng!', 'success');
                // Refresh user list
                const modal = document.getElementById('userManagerModal');
                if (modal) {
                    modal.remove();
                    setTimeout(() => showUserManager(), 300);
                }
            }
        }
    );
}

// Khôi phục tài khoản người dùng
function restoreUserAccount(userId) {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền khôi phục tài khoản!', 'error');
        return;
    }
    
    const user = getUserById(userId);
    if (!user) {
        showToast('Không tìm thấy người dùng!', 'error');
        return;
    }
    
    showConfirmModal(
        'Xác nhận khôi phục tài khoản',
        `Bạn có chắc chắn muốn khôi phục tài khoản "${user.name}" (${user.email})?`,
        () => {
            if (restoreUser(userId)) {
                showToast('✅ Đã khôi phục tài khoản người dùng!', 'success');
                // Refresh user list
                const modal = document.getElementById('userManagerModal');
                if (modal) {
                    modal.remove();
                    setTimeout(() => showUserManager(), 300);
                }
            }
        }
    );
}

// Lọc người dùng
function filterUsers() {
    const search = document.getElementById('searchUsers')?.value.toLowerCase() || '';
    
    document.querySelectorAll('.admin-document-item[data-user-id]').forEach(item => {
        const userId = parseInt(item.dataset.userId);
        const users = getAllUsersIncludingInactive();
        const user = users.find(u => u.id === userId);
        
        if (user && (
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        )) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Quản lý đơn hàng (admin) - VỚI CHỨC NĂNG PHÊ DUYỆT/TỪ CHỐI
function showOrderManager() {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền truy cập!', 'error');
        return;
    }
    
    const orders = getAllOrders();
    
    const modalHTML = `
        <div class="modal active" id="orderManagerModal">
            <div class="modal-content" style="max-width: 1000px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3><i class="fas fa-shopping-cart"></i> Quản lý đơn hàng (${orders.length} đơn)</h3>
                    <button class="close-modal" onclick="closeModal('orderManagerModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="admin-toolbar">
                        <div class="search-box" style="min-width: 300px;">
                            <i class="fas fa-search"></i>
                            <input type="text" id="searchOrders" placeholder="Tìm đơn hàng..." onkeyup="filterOrders()">
                        </div>
                        <select id="filterOrderStatus" class="filter-select" style="min-width: 150px;" onchange="filterOrders()">
                            <option value="all">Tất cả trạng thái</option>
                            <option value="${ORDER_STATUS.PENDING}">Chờ xác nhận</option>
                            <option value="${ORDER_STATUS.APPROVED}">Đã phê duyệt</option>
                            <option value="${ORDER_STATUS.REJECTED}">Đã từ chối</option>
                            <option value="${ORDER_STATUS.COMPLETED}">Đã hoàn thành</option>
                        </select>
                    </div>
                    
                    <div class="admin-table-header">
                        <div class="row">
                            <div style="flex: 1;"><strong>Mã đơn</strong></div>
                            <div style="flex: 2;"><strong>Khách hàng</strong></div>
                            <div style="flex: 1;"><strong>Số lượng</strong></div>
                            <div style="flex: 1;"><strong>Tổng tiền</strong></div>
                            <div style="flex: 1;"><strong>Trạng thái</strong></div>
                            <div style="flex: 1;"><strong>Ngày đặt</strong></div>
                            <div style="flex: 1;"><strong>Thao tác</strong></div>
                        </div>
                    </div>
                    
                    <div id="ordersList">
                        ${orders.map(order => {
                            const statusClass = order.status === ORDER_STATUS.APPROVED ? 'status-confirmed' : 
                                             order.status === ORDER_STATUS.REJECTED ? 'status-rejected' : 
                                             order.status === ORDER_STATUS.COMPLETED ? 'status-confirmed' : 'status-pending';
                            const statusText = order.status === ORDER_STATUS.APPROVED ? 'Đã phê duyệt' : 
                                             order.status === ORDER_STATUS.REJECTED ? 'Đã từ chối' : 
                                             order.status === ORDER_STATUS.COMPLETED ? 'Đã hoàn thành' : 'Chờ xác nhận';
                            
                            return `
                                <div class="admin-document-item" data-order-id="${order.id}" data-status="${order.status}">
                                    <div class="row">
                                        <div style="flex: 1;">
                                            <strong>${order.id}</strong>
                                        </div>
                                        <div style="flex: 2;">
                                            <strong>${order.userName}</strong>
                                            <p class="small">${order.userEmail}</p>
                                        </div>
                                        <div style="flex: 1;">
                                            ${order.items.reduce((sum, item) => sum + item.quantity, 0)} tài liệu
                                        </div>
                                        <div style="flex: 1;">${formatPrice(order.total)}</div>
                                        <div style="flex: 1;">
                                            <span class="status ${statusClass}">
                                                ${statusText}
                                            </span>
                                        </div>
                                        <div style="flex: 1;">${formatDate(order.date)}</div>
                                        <div style="flex: 1;">
                                            <button class="btn-small btn-outline" onclick="viewOrderDetails('${order.id}')" title="Xem chi tiết">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            ${order.status === ORDER_STATUS.PENDING ? `
                                                <button class="btn-small btn-success" onclick="approveOrder('${order.id}')" title="Phê duyệt">
                                                    <i class="fas fa-check"></i>
                                                </button>
                                                <button class="btn-small btn-danger" onclick="rejectOrder('${order.id}')" title="Từ chối">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Đóng khi click bên ngoài
    const modal = document.getElementById('orderManagerModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('orderManagerModal');
        }
    });
}

// Xem chi tiết đơn hàng
function viewOrderDetails(orderId) {
    const order = getAllOrders().find(o => o.id === orderId);
    if (!order) {
        showToast('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    const bill = getBillById(order.billId);
    
    const modalHTML = `
        <div class="modal active" id="orderDetailsModal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-file-invoice"></i> Chi tiết đơn hàng ${order.id}</h3>
                    <button class="close-modal" onclick="closeModal('orderDetailsModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="preview-content">
                        <div class="preview-header">
                            <div>
                                <span class="status ${order.status === ORDER_STATUS.APPROVED ? 'status-confirmed' : 
                                                 order.status === ORDER_STATUS.REJECTED ? 'status-rejected' : 
                                                 order.status === ORDER_STATUS.COMPLETED ? 'status-confirmed' : 'status-pending'}">
                                    ${order.status === ORDER_STATUS.APPROVED ? 'Đã phê duyệt' : 
                                      order.status === ORDER_STATUS.REJECTED ? 'Đã từ chối' : 
                                      order.status === ORDER_STATUS.COMPLETED ? 'Đã hoàn thành' : 'Chờ xác nhận'}
                                </span>
                                ${order.processedBy ? `<small style="margin-left: 10px;">Bởi: ${order.processedBy}</small>` : ''}
                            </div>
                            <div class="preview-price">${formatPrice(order.total)}</div>
                        </div>
                        
                        <div class="preview-details">
                            <div class="detail-item">
                                <i class="fas fa-user"></i>
                                <span><strong>Khách hàng:</strong> ${order.userName}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-envelope"></i>
                                <span><strong>Email:</strong> ${order.userEmail}</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-calendar"></i>
                                <span><strong>Ngày đặt:</strong> ${formatDateTime(order.date)}</span>
                            </div>
                            ${order.processedAt ? `
                                <div class="detail-item">
                                    <i class="fas fa-calendar-check"></i>
                                    <span><strong>Ngày xử lý:</strong> ${formatDateTime(order.processedAt)}</span>
                                </div>
                            ` : ''}
                            ${order.driveLink ? `
                                <div class="detail-item">
                                    <i class="fas fa-link"></i>
                                    <span><strong>Drive Link:</strong> ${order.driveLink}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <h4>Chi tiết tài liệu:</h4>
                        <div style="max-height: 200px; overflow-y: auto; margin: 1rem 0;">
                            ${order.items.map(item => {
                                const doc = DOCUMENTS.find(d => d.id === item.id);
                                return doc ? `
                                    <div style="padding: 0.5rem; border-bottom: 1px solid var(--light);">
                                        <strong>${item.name}</strong>
                                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-light);">
                                            <span>${formatPrice(item.price)} x ${item.quantity}</span>
                                            <span>${formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                ` : '';
                            }).join('')}
                        </div>
                        
                        ${bill ? `
                            <h4>Thông tin thanh toán:</h4>
                            <div class="bill-details" style="margin-top: 1rem;">
                                <div class="bill-info">
                                    <p><strong>Mã bill:</strong> ${bill.id}</p>
                                    <p><strong>Số tiền:</strong> ${formatPrice(bill.amount)}</p>
                                    <p><strong>Ngày thanh toán:</strong> ${formatDate(bill.date)}</p>
                                    ${bill.confirmedAt ? `<p><strong>Ngày xác nhận:</strong> ${formatDate(bill.confirmedAt)}</p>` : ''}
                                </div>
                                <div class="bill-image">
                                    <img src="${bill.imageData}" alt="Bill thanh toán" style="max-width: 100%; border-radius: 8px; max-height: 150px;">
                                </div>
                            </div>
                        ` : ''}
                        
                        ${order.status === ORDER_STATUS.PENDING ? `
                            <div class="preview-actions" style="margin-top: 2rem;">
                                <button class="btn-outline" onclick="closeModal('orderDetailsModal')">
                                    <i class="fas fa-times"></i> Đóng
                                </button>
                                <button class="btn-success" onclick="approveOrder('${order.id}'); closeModal('orderDetailsModal')">
                                    <i class="fas fa-check"></i> Phê duyệt
                                </button>
                                <button class="btn-danger" onclick="rejectOrder('${order.id}'); closeModal('orderDetailsModal')">
                                    <i class="fas fa-times"></i> Từ chối
                                </button>
                            </div>
                        ` : `
                            <div class="preview-actions" style="margin-top: 2rem;">
                                <button class="btn-primary" onclick="closeModal('orderDetailsModal')">
                                    <i class="fas fa-times"></i> Đóng
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Đóng khi click bên ngoài
    const modal = document.getElementById('orderDetailsModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('orderDetailsModal');
        }
    });
}

// Phê duyệt đơn hàng
function approveOrder(orderId) {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền phê duyệt đơn hàng!', 'error');
        return;
    }
    
    const order = getAllOrders().find(o => o.id === orderId);
    if (!order) {
        showToast('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    // Hiển thị form nhập drive link
    const modalHTML = `
        <div class="modal active" id="approveOrderModal">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-check"></i> Phê duyệt đơn hàng</h3>
                    <button class="close-modal" onclick="closeModal('approveOrderModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Bạn đang phê duyệt đơn hàng <strong>${orderId}</strong> của <strong>${order.userName}</strong></p>
                    
                    <div class="input-group" style="margin-top: 1rem;">
                        <i class="fas fa-link"></i>
                        <input type="text" id="driveLinkInput" placeholder="Link Google Drive (không bắt buộc)">
                        <small style="display: block; margin-top: 5px; color: var(--gray); font-size: 12px;">
                            Nhập link Drive để cung cấp tài liệu cho khách hàng
                        </small>
                    </div>
                    
                    <div class="form-actions" style="margin-top: 1.5rem;">
                        <button class="btn-secondary" onclick="closeModal('approveOrderModal')">
                            <i class="fas fa-times"></i> Hủy
                        </button>
                        <button class="btn-success" onclick="confirmApproveOrder('${orderId}')">
                            <i class="fas fa-check"></i> Phê duyệt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Đóng khi click bên ngoài
    const modal = document.getElementById('approveOrderModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('approveOrderModal');
        }
    });
}

function confirmApproveOrder(orderId) {
    const driveLink = document.getElementById('driveLinkInput')?.value || '';
    
    // Xử lý phê duyệt đơn hàng
    const updatedOrder = processOrder(orderId, 'approve', currentUser.name, driveLink);
    
    if (updatedOrder) {
        showToast('✅ Đã phê duyệt đơn hàng!', 'success');
        
        // Đóng modal
        closeModal('approveOrderModal');
        
        // Refresh order manager
        const orderModal = document.getElementById('orderManagerModal');
        if (orderModal) {
            orderModal.remove();
            setTimeout(() => showOrderManager(), 300);
        }
    }
}

// Từ chối đơn hàng
function rejectOrder(orderId) {
    if (!checkAdminAccess()) {
        showToast('Chỉ admin mới có quyền từ chối đơn hàng!', 'error');
        return;
    }
    
    const order = getAllOrders().find(o => o.id === orderId);
    if (!order) {
        showToast('Không tìm thấy đơn hàng!', 'error');
        return;
    }
    
    showConfirmModal(
        'Xác nhận từ chối đơn hàng',
        `Bạn có chắc chắn muốn từ chối đơn hàng <strong>${orderId}</strong> của <strong>${order.userName}</strong>?<br>
         <small>Đơn hàng sẽ bị hủy và khách hàng sẽ được thông báo.</small>`,
        () => {
            // Xử lý từ chối đơn hàng
            const updatedOrder = processOrder(orderId, 'reject', currentUser.name);
            
            if (updatedOrder) {
                showToast('✅ Đã từ chối đơn hàng!', 'success');
                
                // Refresh order manager
                const orderModal = document.getElementById('orderManagerModal');
                if (orderModal) {
                    orderModal.remove();
                    setTimeout(() => showOrderManager(), 300);
                }
            }
        }
    );
}

// Lọc đơn hàng
function filterOrders() {
    const search = document.getElementById('searchOrders')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('filterOrderStatus')?.value || 'all';
    
    document.querySelectorAll('.admin-document-item[data-order-id]').forEach(item => {
        const orderId = item.dataset.orderId;
        const orderStatus = item.dataset.status;
        const orders = getAllOrders();
        const order = orders.find(o => o.id === orderId);
        
        let shouldShow = true;
        
        // Lọc theo search
        if (search && order) {
            shouldShow = order.id.toLowerCase().includes(search) ||
                        order.userName.toLowerCase().includes(search) ||
                        order.userEmail.toLowerCase().includes(search);
        }
        
        // Lọc theo status
        if (statusFilter !== 'all' && orderStatus !== statusFilter) {
            shouldShow = false;
        }
        
        item.style.display = shouldShow ? 'flex' : 'none';
    });
}

// Export functions
window.showDocumentManager = showDocumentManager;
window.addNewDocument = addNewDocument;
window.updateDocument = updateDocument;
window.deleteDocument = deleteDocument;
window.filterAdminDocuments = filterAdminDocuments;
window.showUserManager = showUserManager;
window.deleteUserAccount = deleteUserAccount;
window.restoreUserAccount = restoreUserAccount;
window.filterUsers = filterUsers;
window.showOrderManager = showOrderManager;
window.viewOrderDetails = viewOrderDetails;
window.approveOrder = approveOrder;
window.rejectOrder = rejectOrder;
window.filterOrders = filterOrders;