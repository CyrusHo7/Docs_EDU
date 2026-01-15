// ============================================
// DOWNLOAD MANAGER - QUẢN LÝ TẢI XUỐNG VÀ DRIVE LINK
// ============================================

function loadUserDownloads() {
    if (currentUser) {
        const downloadsData = JSON.parse(localStorage.getItem(DB_KEYS.DOWNLOADS) || '{}');
        currentDownloads = downloadsData[currentUser.id] || [];
        console.log(`📥 Đã tải ${currentDownloads.length} tài liệu của user`);
        
        // Cập nhật UI thống kê
        updateDownloadsStats();
    } else {
        currentDownloads = [];
    }
}

function updateDownloadsStats() {
    const totalDocs = document.getElementById('totalDocs');
    const confirmedDocs = document.getElementById('confirmedDocs');
    
    if (totalDocs) {
        totalDocs.textContent = currentDownloads.length;
    }
    
    if (confirmedDocs) {
        const confirmed = currentDownloads.filter(d => d.status === 'approved').length;
        confirmedDocs.textContent = confirmed;
    }
}

function renderMyDocuments(filter = 'all') {
    console.log(`📄 Rendering documents with filter: ${filter}`);
    const container = document.getElementById('myDocsContent');
    if (!container) {
        console.error('Không tìm thấy container myDocsContent');
        return;
    }
    
    console.log(`📚 Current downloads: ${currentDownloads.length} items`);
    
    let filtered = [...currentDownloads];
    
    // Lọc theo filter
    if (filter === 'pending') {
        filtered = filtered.filter(d => d.status === 'pending');
    } else if (filter === 'approved') {
        filtered = filtered.filter(d => d.status === 'approved');
    } else if (filter === 'rejected') {
        filtered = filtered.filter(d => d.status === 'rejected');
    } else if (filter === 'recent') {
        // Hiển thị 10 tài liệu gần nhất
        filtered.sort((a, b) => new Date(b.purchasedDate) - new Date(a.purchasedDate));
        filtered = filtered.slice(0, 10);
    }
    
    // Search
    const search = document.getElementById('searchMyDocs')?.value.toLowerCase() || '';
    if (search) {
        filtered = filtered.filter(d => d.name.toLowerCase().includes(search));
    }
    
    // Sắp xếp mới nhất trước (nếu không phải filter recent)
    if (filter !== 'recent') {
        filtered.sort((a, b) => new Date(b.purchasedDate) - new Date(a.purchasedDate));
    }
    
    console.log(`🔍 Filtered to: ${filtered.length} items`);
    
    // Render
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-box-open"></i>
                </div>
                <h3>${filter === 'all' ? 'Chưa có tài liệu nào' : 'Không tìm thấy tài liệu'}</h3>
                <p>${filter === 'all' ? 'Hãy mua tài liệu để bắt đầu học tập!' : 'Thử tìm kiếm với từ khóa khác'}</p>
                ${filter === 'all' ? '<a href="#store" class="btn-primary" onclick="showSection(\'store\')"><i class="fas fa-store"></i> Đến cửa hàng</a>' : ''}
            </div>
        `;
        return;
    }
    
    let html = '<div class="my-docs-grid">';
    
    filtered.forEach((item, index) => {
        const originalDoc = DOCUMENTS.find(d => d.id === item.documentId);
        if (!originalDoc) {
            console.warn(`Không tìm thấy document với id: ${item.documentId}`);
            return;
        }
        
        let statusText, statusClass, statusIcon;
        switch(item.status) {
            case 'approved':
                statusText = 'Đã phê duyệt';
                statusClass = 'status-confirmed';
                statusIcon = 'fa-check-circle';
                break;
            case 'pending':
                statusText = 'Chờ xác nhận';
                statusClass = 'status-pending';
                statusIcon = 'fa-clock';
                break;
            case 'rejected':
                statusText = 'Đã từ chối';
                statusClass = 'status-rejected';
                statusIcon = 'fa-times-circle';
                break;
            default:
                statusText = item.status;
                statusClass = 'status-pending';
                statusIcon = 'fa-question-circle';
        }
        
        const downloaded = item.downloadDate ? `Đã xem: ${formatDate(item.downloadDate)}` : 'Chưa xem';
        const isApproved = item.status === 'approved';
        const category = CATEGORIES.find(c => c.id === originalDoc.category) || CATEGORIES[0];
        const isVideo = item.isVideo || originalDoc.type === DOCUMENT_TYPES.VIDEO;
        
        html += `
            <div class="my-doc-card" data-id="${item.documentId}">
                <div class="doc-icon">
                    <i class="${isVideo ? 'fas fa-video' : 'fas fa-file-pdf'}" style="color: ${category.color}"></i>
                </div>
                <div class="doc-content">
                    <h4>${item.name} ${isVideo ? '<i class="fas fa-video" style="color: var(--accent); font-size: 0.8em;"></i>' : ''}</h4>
                    <p class="doc-description">${originalDoc.description.substring(0, 100)}...</p>
                    
                    <div class="doc-meta">
                        <span><i class="fas fa-calendar"></i> ${formatDate(item.purchasedDate)}</span>
                        <span><i class="fas fa-file"></i> ${item.format}</span>
                        <span class="status ${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </span>
                    </div>
                    
                    <div class="doc-info">
                        <small><i class="fas fa-info-circle"></i> ${downloaded}</small>
                        <small><i class="fas fa-receipt"></i> Mã đơn: ${item.orderId}</small>
                        ${item.driveLink ? `<small><i class="fas fa-link"></i> Có link Drive</small>` : ''}
                    </div>
                </div>
                <div class="doc-actions">
                    ${isApproved ? renderDownloadButton(item, index, isVideo) : `
                        <button class="btn-outline btn-large" disabled style="opacity: 0.5; cursor: not-allowed;">
                            <i class="fas fa-hourglass-half"></i> Chờ xác nhận
                        </button>
                    `}
                    ${item.billId ? `<button onclick="viewBill('${item.billId}')" class="btn-outline btn-small">
                        <i class="fas fa-receipt"></i> Xem bill
                    </button>` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function renderDownloadButton(item, index, isVideo) {
    if (isVideo) {
        // Nút xem video
        return `
            <button onclick="watchVideo(${item.documentId}, ${index})" class="btn-danger btn-large">
                <i class="fas fa-play-circle"></i> Xem Video
            </button>
        `;
    } else if (item.driveLink) {
        // Nút mở drive link
        return `
            <button onclick="openDriveLink('${item.driveLink}', ${item.documentId})" class="btn-success btn-large">
                <i class="fas fa-external-link-alt"></i> Mở Drive
            </button>
        `;
    } else {
        // Nút download thông thường (cho file)
        return `
            <button onclick="downloadSingleFile(${item.documentId}, ${index})" class="btn-success btn-large">
                <i class="fas fa-download"></i> Tải xuống
            </button>
        `;
    }
}

function openDriveLink(driveLink, docId) {
    if (!driveLink) {
        showToast('Chưa có link Drive cho tài liệu này!', 'error');
        return;
    }
    
    // Mở link drive trong tab mới
    window.open(driveLink, '_blank');
    
    // Cập nhật ngày xem
    updateDownloadDate(docId);
    
    showToast('✅ Đang mở link Drive...', 'success');
}

function watchVideo(docId, downloadIndex = -1) {
    console.log(`🎬 Opening video: ${docId}`);
    
    const doc = DOCUMENTS.find(d => d.id === docId);
    if (!doc) {
        showToast('Không tìm thấy video!', 'error');
        return;
    }
    
    // Tìm download item
    let downloadItem;
    if (downloadIndex >= 0 && downloadIndex < currentDownloads.length) {
        downloadItem = currentDownloads[downloadIndex];
    } else {
        downloadItem = currentDownloads.find(d => d.documentId === docId);
    }
    
    if (!downloadItem) {
        showToast('Bạn chưa mua video này!', 'error');
        return;
    }
    
    if (downloadItem.status !== 'approved') {
        showToast('Video chưa được phê duyệt!', 'error');
        return;
    }
    
    // Mở video URL (YouTube hoặc video link)
    const videoUrl = downloadItem.videoUrl || doc.videoUrl || doc.file;
    if (!videoUrl) {
        showToast('Không tìm thấy link video!', 'error');
        return;
    }
    
    // Mở video trong tab mới
    window.open(videoUrl, '_blank');
    
    // Cập nhật ngày xem
    updateDownloadDate(docId);
    
    showToast('✅ Đang mở video...', 'success');
}

function downloadSingleFile(docId, downloadIndex = -1) {
    console.log(`📥 Downloading document: ${docId}`);
    
    const doc = DOCUMENTS.find(d => d.id === docId);
    if (!doc) {
        showToast('Không tìm thấy tài liệu!', 'error');
        return;
    }
    
    // Tìm download item
    let downloadItem;
    if (downloadIndex >= 0 && downloadIndex < currentDownloads.length) {
        downloadItem = currentDownloads[downloadIndex];
    } else {
        downloadItem = currentDownloads.find(d => d.documentId === docId);
    }
    
    if (!downloadItem) {
        showToast('Bạn chưa mua tài liệu này!', 'error');
        return;
    }
    
    if (downloadItem.status !== 'approved') {
        showToast('Tài liệu chưa được phê duyệt!', 'error');
        return;
    }
    
    // Kiểm tra xem có drive link không
    if (downloadItem.driveLink) {
        openDriveLink(downloadItem.driveLink, docId);
        return;
    }
    
    // Hiển thị loading
    showToast(`Đang tải: ${doc.name}...`, 'info');
    
    // Giả lập download
    setTimeout(() => {
        try {
            // Trong thực tế, đây sẽ là link download thật từ server
            const fileExtension = doc.format.toLowerCase().includes('pdf') ? 'pdf' : 
                                 doc.format.toLowerCase().includes('zip') ? 'zip' : 'pdf';
            
            // Tạo link download giả lập
            const link = document.createElement('a');
            link.href = doc.file || `documents/sample.${fileExtension}`;
            link.download = doc.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.' + fileExtension;
            link.target = '_blank';
            
            // Thêm vào DOM, click và xóa
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Cập nhật ngày tải
            updateDownloadDate(docId);
            
            showToast(`✅ Đã tải thành công: ${doc.name}`, 'success');
            
        } catch (error) {
            console.error('Lỗi khi tải file:', error);
            showToast('Lỗi khi tải file!', 'error');
        }
    }, 1000);
}

function updateDownloadDate(docId) {
    if (!currentUser) return;
    
    const downloads = JSON.parse(localStorage.getItem(DB_KEYS.DOWNLOADS) || '{}');
    
    if (!downloads[currentUser.id]) {
        return;
    }
    
    const downloadIndex = downloads[currentUser.id].findIndex(d => d.documentId === docId);
    if (downloadIndex !== -1) {
        downloads[currentUser.id][downloadIndex].downloadDate = new Date().toISOString();
        localStorage.setItem(DB_KEYS.DOWNLOADS, JSON.stringify(downloads));
        
        // Cập nhật lại danh sách downloads
        loadUserDownloads();
        
        // Load lại danh sách tài liệu
        const activeTab = document.querySelector('.filter-tab.active');
        const filter = activeTab ? activeTab.dataset.filter : 'all';
        renderMyDocuments(filter);
    }
}

function viewBill(billId) {
    const bill = getBillById(billId);
    if (!bill) {
        showToast('Không tìm thấy bill!', 'error');
        return;
    }
    
    // Tạo modal xem bill
    const modalHTML = `
        <div class="modal active" id="billModal">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3><i class="fas fa-receipt"></i> Bill thanh toán</h3>
                    <button class="close-modal" onclick="closeModal('billModal')">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="bill-details">
                        <div class="bill-info">
                            <p><strong>Mã đơn:</strong> ${bill.orderId}</p>
                            <p><strong>Khách hàng:</strong> ${bill.userName}</p>
                            <p><strong>Email:</strong> ${bill.userEmail}</p>
                            <p><strong>Số tiền:</strong> ${formatPrice(bill.amount)}</p>
                            <p><strong>Ngày thanh toán:</strong> ${formatDate(bill.date)}</p>
                            <p><strong>Trạng thái:</strong> 
                                <span class="status ${bill.status === ORDER_STATUS.APPROVED ? 'status-confirmed' : 
                                                     bill.status === ORDER_STATUS.REJECTED ? 'status-rejected' : 
                                                     'status-pending'}">
                                    ${bill.status === ORDER_STATUS.APPROVED ? 'Đã phê duyệt' : 
                                      bill.status === ORDER_STATUS.REJECTED ? 'Đã từ chối' : 
                                      'Chờ xác nhận'}
                                </span>
                            </p>
                            ${bill.confirmedAt ? `
                                <p><strong>Ngày xác nhận:</strong> ${formatDate(bill.confirmedAt)}</p>
                                <p><strong>Xác nhận bởi:</strong> ${bill.confirmedBy}</p>
                            ` : ''}
                            ${bill.rejectionReason ? `
                                <p><strong>Lý do từ chối:</strong> ${bill.rejectionReason}</p>
                            ` : ''}
                        </div>
                        <div class="bill-image">
                            <img src="${bill.imageData}" alt="Bill thanh toán" style="max-width: 100%; border-radius: 8px;">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="closeModal('billModal')">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Thêm modal vào body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Đóng khi click bên ngoài
    const modal = document.getElementById('billModal');
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal('billModal');
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

// Export functions to global scope
window.loadUserDownloads = loadUserDownloads;
window.renderMyDocuments = renderMyDocuments;
window.downloadSingleFile = downloadSingleFile;
window.watchVideo = watchVideo;
window.openDriveLink = openDriveLink;
window.viewBill = viewBill;
window.closeModal = closeModal;