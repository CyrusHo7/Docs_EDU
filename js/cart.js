// ============================================
// CART - GIỎ HÀNG
// ============================================

function addToCart(docId) {
    if (!currentUser) {
        showToast('Vui lòng đăng nhập để mua tài liệu!', 'error');
        showSection('login');
        return;
    }
    
    const doc = DOCUMENTS.find(d => d.id === docId);
    if (!doc) {
        showToast('Tài liệu không tồn tại!', 'error');
        return;
    }
    
    // Kiểm tra đã có trong giỏ chưa
    const existing = cart.find(item => item.id === docId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: doc.id,
            name: doc.name,
            price: doc.price,
            quantity: 1,
            image: doc.category,
            author: doc.author,
            format: doc.format,
            type: doc.type || DOCUMENT_TYPES.PDF
        });
    }
    
    saveCart();
    updateCartCount();
    
    showToast(`Đã thêm "${doc.name}" vào giỏ hàng!`, 'success');
    
    // Hiệu ứng pulse cho cart icon
    const cartIcon = document.querySelector('.cart-link');
    if (cartIcon) {
        cartIcon.classList.add('pulse');
        setTimeout(() => cartIcon.classList.remove('pulse'), 1000);
    }
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const summary = document.getElementById('cartSummary');
    const emptyCart = document.getElementById('emptyCart');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3>Giỏ hàng trống</h3>
                <p>Hãy thêm tài liệu vào giỏ hàng</p>
                <a href="#store" class="btn-primary" onclick="showSection('store')">
                    <i class="fas fa-store"></i> Đến cửa hàng
                </a>
            </div>
        `;
        if (summary) summary.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const doc = DOCUMENTS.find(d => d.id === item.id);
        if (!doc) return;
        
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const category = CATEGORIES.find(c => c.id === doc.category) || CATEGORIES[0];
        const isVideo = doc.type === DOCUMENT_TYPES.VIDEO;
        
        html += `
            <div class="cart-item">
                <div class="item-image" style="background: linear-gradient(135deg, ${category.color}20, ${category.color}40)">
                    <i class="${isVideo ? 'fas fa-video' : 'fas fa-file-pdf'}" style="color: ${category.color}"></i>
                </div>
                <div class="item-details">
                    <h4>${item.name} ${isVideo ? '<i class="fas fa-video" style="color: var(--danger); font-size: 0.8em;"></i>' : ''}</h4>
                    <p class="item-author">${doc.author}</p>
                    <div class="item-meta">
                        <span><i class="fas fa-file"></i> ${doc.format}</span>
                        <span class="item-price">${formatPrice(item.price)}</span>
                    </div>
                </div>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="item-total">
                    <strong>${formatPrice(itemTotal)}</strong>
                    <button class="remove-item" onclick="removeFromCart(${item.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Cập nhật summary
    const processingFee = 5000;
    const total = subtotal + processingFee;
    
    if (summary) {
        document.getElementById('subtotal').textContent = formatPrice(subtotal);
        document.getElementById('processingFee').textContent = formatPrice(processingFee);
        document.getElementById('cartTotal').textContent = formatPrice(total);
        summary.style.display = 'block';
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
}

function processCheckout() {
    if (cart.length === 0) {
        showToast('Giỏ hàng trống! Vui lòng thêm tài liệu', 'error');
        return;
    }
    
    if (!currentUser) {
        showToast('Vui lòng đăng nhập để thanh toán!', 'error');
        showSection('login');
        return;
    }
    
    // Tạo đơn hàng
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const processingFee = 5000;
    const total = subtotal + processingFee;
    const orderId = 'EDU' + Date.now().toString().slice(-8);
    
    currentOrder = {
        id: orderId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        items: [...cart],
        subtotal: subtotal,
        fee: processingFee,
        total: total,
        date: new Date().toISOString(),
        status: ORDER_STATUS.PENDING, // Chờ admin xác nhận
        paymentMethod: 'bank_transfer'
    };
    
    // Cập nhật UI thanh toán
    const paymentOrderId = document.getElementById('paymentOrderId');
    const paymentAmount = document.getElementById('paymentAmount');
    const orderCode = document.getElementById('orderCode');
    const paymentNote = document.getElementById('paymentNote');
    
    if (paymentOrderId) paymentOrderId.textContent = `#${orderId}`;
    if (paymentAmount) paymentAmount.textContent = formatPrice(total);
    if (orderCode) orderCode.textContent = orderId;
    if (paymentNote) paymentNote.textContent = `EDUDOCS_${orderId}`;
    
    // Chuyển đến trang thanh toán
    showSection('payment');
}

// Export functions
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.processCheckout = processCheckout;
window.renderCart = renderCart;