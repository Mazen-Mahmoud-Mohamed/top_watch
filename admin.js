/**
 * TOP Watch — لوحة التحكم (متصلة بالـ API عند توفر المفتاح)
 */

const AdminApp = {
    currentPage: 'overview',
    orders: [],
    products: [],

    init() {
        this.setupEventListeners();
        const token = sessionStorage.getItem('topwatch_admin_token')?.trim();
        const authed = sessionStorage.getItem('adminAuth') === 'true';
        if (authed && !token) {
            sessionStorage.removeItem('adminAuth');
        }
        if (sessionStorage.getItem('adminAuth') === 'true' && token) {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'flex';
            void this.bootstrapData().then(() => this.renderPage());
        }
    },

    hasAdminSession() {
        return Boolean(sessionStorage.getItem('topwatch_admin_token')?.trim());
    },

    async bootstrapData() {
        await Promise.all([
            this.loadOrdersFromServers(),
            this.loadProductsFromServers(),
        ]);
        this.saveLocalSnapshots();
        this.updatePendingBadge();
    },

    saveLocalSnapshots() {
        try {
            localStorage.setItem('topwatch_orders', JSON.stringify(this.orders));
            localStorage.setItem('topwatch_products', JSON.stringify(this.products));
        } catch (_) {
            /* ignore */
        }
        this.updatePendingBadge();
    },

    async loadProductsFromServers() {
        try {
            const plist = await TopWatchAPI.getProducts();
            if (Array.isArray(plist) && plist.length) {
                this.products = plist.map((p) => ({
                    ...p,
                    images:
                        Array.isArray(p.images) && p.images.length ? p.images : [p.image],
                }));
                this.productsSourceLocal = false;
                return;
            }
        } catch (_) {
            /* fall through */
        }
        const saved = localStorage.getItem('topwatch_products');
        this.products =
            saved != null
                ? JSON.parse(saved)
                : JSON.parse(JSON.stringify(CONFIG.products));
        this.productsSourceLocal = true;
    },

    async loadOrdersFromServers() {
        if (!this.hasAdminSession()) {
            const raw = JSON.parse(localStorage.getItem('topwatch_orders') || '[]');
            this.orders = raw;
            this.ordersSourceLocal = true;
            return;
        }
        try {
            this.orders = await TopWatchAPI.getOrders();
            if (!Array.isArray(this.orders)) this.orders = [];
            this.ordersSourceLocal = false;
        } catch (e) {
            console.warn('[Admin] لا يمكن جلب الطلبات من الخادم — الوضع المحلي', e);
            this.orders = JSON.parse(localStorage.getItem('topwatch_orders') || '[]');
            this.ordersSourceLocal = true;
        }
    },

    setupEventListeners() {
        document.getElementById('loginForm').addEventListener(
            'submit',
            async (e) => {
                e.preventDefault();
                const pass = document.getElementById('adminPass').value;
                const loginError = document.getElementById('loginError');
                loginError.style.display = 'none';

                try {
                    const res = await TopWatchAPI.adminLogin({
                        password: pass,
                    });
                    if (res && res.token)
                        sessionStorage.setItem(
                            'topwatch_admin_token',
                            res.token
                        );
                    else {
                        throw new Error('لم يُرجع الخادم رمز الجلسة');
                    }
                } catch (err) {
                    loginError.textContent =
                        err.message || 'تعذّر تسجيل الدخول. تحقق من كلمة المرور والاتصال بالخادم.';
                    loginError.style.display = 'block';
                    return;
                }

                sessionStorage.removeItem('topwatch_admin_key');
                sessionStorage.setItem('adminAuth', 'true');
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('dashboard').style.display = 'flex';
                void this.bootstrapData().then(() => this.renderPage());
            }
        );

        document.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document
                    .querySelectorAll('.nav-link')
                    .forEach((l) => l.classList.remove('active'));
                link.classList.add('active');
                this.currentPage = link.dataset.page;
                void this.bootstrapData().then(() => this.renderPage());
            });
        });
    },

    saveData() {
        this.saveLocalSnapshots();
    },

    updatePendingBadge() {
        const el = document.getElementById('pendingBadge');
        if (!el) return;
        const pending = this.orders.filter((o) => o.status === 'pending').length;
        el.textContent = pending;
    },

    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;');
    },

    effectiveStock(p) {
        if (p.stockQuantity != null && !Number.isNaN(Number(p.stockQuantity))) {
            return Math.max(0, Math.floor(Number(p.stockQuantity)));
        }
        return p.inStock !== false ? 50 : 0;
    },

    stockCellHtml(p) {
        const n = this.effectiveStock(p);
        const badge =
            n <= 0
                ? '<span class="stock-pill stock-pill-out">غير متوفر</span>'
                : '<span class="stock-pill stock-pill-in">متوفر</span>';
        return `<span class="stock-qty">${n}</span> ${badge}`;
    },

    jsLiteral(value) {
        const s =
            typeof value === 'undefined' ? undefined : JSON.stringify(value);
        const ser = typeof s === 'undefined' ? 'undefined' : s;
        return ser
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026');
    },

    /** Stored path → filename only for the admin form (local images/). */
    imageFilenameForForm(stored) {
        if (stored == null || stored === '') return '';
        const s = String(stored).trim();
        if (/^https?:\/\//i.test(s)) return s;
        let p = s.replace(/^\.\//, '').replace(/\\/g, '/');
        if (p.toLowerCase().startsWith('images/')) return p.slice(7);
        const slash = p.lastIndexOf('/');
        return slash >= 0 ? p.slice(slash + 1) : p;
    },

    /** Form entry → path used in DB & storefront (`images/File.png`). */
    normalizeShopImagePath(raw) {
        const s = raw == null ? '' : String(raw).trim();
        if (!s) return '';
        if (/^https?:\/\//i.test(s)) return s;
        let p = s.replace(/^\.\//, '').replace(/\\/g, '/').replace(/^\/+/, '');
        if (/^images\//i.test(p)) return `images/${p.replace(/^images\//i, '')}`;
        return `images/${p}`;
    },

    renderPage() {
        const titles = {
            overview: 'نظرة عامة',
            orders: 'إدارة الطلبات',
            products: 'إدارة المنتجات',
            customers: 'قائمة العملاء',
            settings: 'الإعدادات',
        };
        document.getElementById('pageTitle').textContent =
            titles[this.currentPage];
        const content = document.getElementById('adminContent');

        const modeNote = `<div class="admin-mode-banner"><i class="fas fa-database"></i> ${
            this.hasAdminSession()
                ? '<strong>متصل بالخادم:</strong> الطلبات والمنتجات تُحمَّل من قاعدة البيانات وتُحدَّث عليها عند الحفظ.'
                : '<strong>وضع غير متصل:</strong> سجّل الدخول مع تشغيل الخادم لمزامنة البيانات.'
        }</div>`;

        switch (this.currentPage) {
            case 'overview':
                content.innerHTML = modeNote + this.renderOverview();
                break;
            case 'orders':
                content.innerHTML = modeNote + this.renderOrders();
                break;
            case 'products':
                content.innerHTML = modeNote + this.renderProducts();
                break;
            case 'customers':
                content.innerHTML = modeNote + this.renderCustomers();
                break;
            case 'settings':
                content.innerHTML = this.renderSettings();
                break;
            default:
                content.innerHTML = '';
        }
    },

    renderOverview() {
        const totalRevenue = this.orders
            .filter((o) => o.status !== 'cancelled')
            .reduce((s, o) => s + Number(o.total), 0);
        const totalOrders = this.orders.length;
        const totalProducts = this.products.length;
        const uniqueCustomers = new Set(this.orders.map((o) => o.phone)).size;

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon gold"><i class="fas fa-wallet"></i></div>
                    <div class="stat-info"><h3>${totalRevenue.toLocaleString()} ج.م</h3><p>إجمالي المبيعات</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue"><i class="fas fa-shopping-bag"></i></div>
                    <div class="stat-info"><h3>${totalOrders}</h3><p>عدد الطلبات</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green"><i class="fas fa-box-open"></i></div>
                    <div class="stat-info"><h3>${totalProducts}</h3><p>المنتجات النشطة</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red"><i class="fas fa-users"></i></div>
                    <div class="stat-info"><h3>${uniqueCustomers}</h3><p>العملاء المميزين</p></div>
                </div>
            </div>
            <div class="data-table">
                <table style="width:100%">
                    <thead><tr><th>أحدث الطلبات</th><th>العميل</th><th>الإجمالي</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                    <tbody>
                        ${this.orders
                            .slice(0, 5)
                            .map(
                                (o) => `
                            <tr>
                                <td>#${this.escapeHtml(o.id)}</td>
                                <td>${this.escapeHtml(o.name)}</td>
                                <td>${o.total} ج.م</td>
                                <td><span class="status-badge status-${o.status}">${this.getStatusText(o.status)}</span></td>
                                <td>${new Date(o.date).toLocaleDateString('ar-EG')}</td>
                            </tr>
                        `
                            )
                            .join('') || '<tr><td colspan="5" style="text-align:center">لا توجد طلبات حالياً</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderOrders() {
        const rows =
            this.orders
                .map(
                    (o) => `
                            <tr class="admin-order-row">
                                <td class="admin-cell-id"><span class="mono">#${this.escapeHtml(o.id)}</span></td>
                                <td class="admin-cell-clamp" title="${this.escapeHtml(o.name)}">${this.escapeHtml(o.name)}</td>
                                <td class="admin-cell-phone"><span class="mono">${this.escapeHtml(o.phone)}</span></td>
                                <td class="admin-cell-products" title="${this.escapeHtml(o.items.map((i) => i.name).join('، '))}">${o.items.map((i) => this.escapeHtml(i.name)).join('، ')}</td>
                                <td class="admin-cell-num"><strong>${o.total} ج.م</strong></td>
                                <td>${this.getPaymentText(o.payment)}</td>
                                <td>
                                    <select class="form-select admin-status-select" aria-label="حالة الطلب" data-order-id="${this.escapeHtml(o.id)}" onchange="AdminApp.updateStatus(${this.jsLiteral(o.id)}, this.value)">
                                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>قيد التجهيز</option>
                                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                                    </select>
                                </td>
                                <td class="admin-cell-date">${new Date(o.date).toLocaleDateString('ar-EG')}</td>
                                <td class="admin-cell-actions">
                                    <button type="button" class="action-btn btn-view" title="تعديل الطلب" onclick="AdminApp.openOrderEditor(${this.jsLiteral(o.id)})"><i class="fas fa-pen"></i></button>
                                    <button type="button" class="action-btn btn-delete" title="حذف" onclick="AdminApp.deleteOrder(${this.jsLiteral(o.id)})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `
                )
                .join('') ||
            '<tr><td colspan="9" class="admin-empty-row">لا توجد طلبات</td></tr>';

        return `
            <section class="admin-panel-card">
                <div class="admin-panel-head">
                    <h3 class="admin-section-title">سجل الطلبات</h3>
                    <button type="button" class="btn btn-primary" onclick="AdminApp.exportOrders()"><i class="fas fa-file-export"></i> تصدير CSV</button>
                </div>
                <div class="admin-table-scroll">
                    <table class="admin-data-table">
                        <thead>
                            <tr>
                                <th>رقم الطلب</th><th>العميل</th><th>الهاتف</th><th>المنتجات</th><th>الإجمالي</th><th>الدفع</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </section>
        `;
    },

    renderProducts() {
        const rows =
            this.products
                .map(
                    (p) => `
                            <tr>
                                <td class="admin-cell-id mono">${this.escapeHtml(p.id)}</td>
                                <td class="admin-cell-clamp" title="${this.escapeHtml(p.name)}">${this.escapeHtml(p.name)}</td>
                                <td>${this.getCategoryName(p.category)}</td>
                                <td class="admin-cell-num">${p.price} ج.م</td>
                                <td class="admin-stock-cell">${this.stockCellHtml(p)}</td>
                                <td>${p.oldPrice ? p.oldPrice + ' ج.م' : '—'}</td>
                                <td class="admin-cell-actions">
                                    <button type="button" class="action-btn btn-edit" title="تعديل" onclick="AdminApp.openProductModal(${this.jsLiteral(p.id)})"><i class="fas fa-edit"></i></button>
                                    <button type="button" class="action-btn btn-delete" title="حذف" onclick="AdminApp.deleteProduct(${this.jsLiteral(p.id)})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `
                )
                .join('') ||
            '<tr><td colspan="7" class="admin-empty-row">لا توجد منتجات</td></tr>';

        return `
            <section class="admin-panel-card">
                <div class="admin-panel-head">
                    <h3 class="admin-section-title">قائمة المنتجات</h3>
                    <button type="button" class="btn btn-primary" onclick="AdminApp.openProductModal()"><i class="fas fa-plus"></i> إضافة منتج</button>
                </div>
                <div class="admin-table-scroll">
                    <table class="admin-data-table">
                        <thead><tr><th>ID</th><th>الاسم</th><th>الفئة</th><th>السعر</th><th>المخزون</th><th>السعر قبل الخصم</th><th>إجراءات</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </section>
        `;
    },

    renderCustomers() {
        const customerMap = {};
        this.orders.forEach((o) => {
            if (!customerMap[o.phone]) {
                customerMap[o.phone] = {
                    name: o.name,
                    phone: o.phone,
                    orders: 0,
                    total: 0,
                    address: o.address,
                };
            }
            customerMap[o.phone].orders++;
            customerMap[o.phone].total += Number(o.total);
        });
        const customers = Object.values(customerMap);

        return `
            <h3 style="margin-bottom:20px;">قاعدة بيانات العملاء</h3>
            <div class="data-table">
                <table>
                    <thead><tr><th>الاسم</th><th>الهاتف</th><th>عدد الطلبات</th><th>إجمالي المشتريات</th><th>العنوان</th><th>إجراءات</th></tr></thead>
                    <tbody>
                        ${customers
                            .map(
                                (c) => `
                            <tr>
                                <td>${this.escapeHtml(c.name)}</td>
                                <td>${this.escapeHtml(c.phone)}</td>
                                <td>${c.orders}</td>
                                <td><strong>${c.total} ج.م</strong></td>
                                <td>${this.escapeHtml(c.address || '')}</td>
                                <td><button type="button" class="action-btn btn-view" onclick="AdminApp.contactCustomer(${this.jsLiteral(c.phone)})"><i class="fab fa-whatsapp"></i> تواصل</button></td>
                            </tr>
                        `
                            )
                            .join('') ||
                            '<tr><td colspan="6" style="text-align:center">لا يوجد عملاء بعد</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderSettings() {
        return `
            <div style="max-width:600px;background:white;padding:30px;border-radius:10px;box-shadow:var(--shadow);">
                <h3 style="margin-bottom:20px;">إعدادات لوحة التحكم</h3>
                <p style="margin-bottom:20px;color:#666;font-size:14px;line-height:1.7;text-align:right;">كلمة مرور لوحة التحكم تُعرَّف في الخادم كـ <strong>ADMIN_PANEL_PASSWORD</strong> داخل ملف <strong>.env</strong>.</p>
                <div class="form-group">
                    <label class="form-label">رقم واتساب المتجر</label>
                    <input type="text" class="form-input" id="waNumber" value="${CONFIG.store.whatsappNumber}">
                </div>
                <div class="form-group">
                    <label class="form-label">عنوان الـ API (اختياري)</label>
                    <input type="text" class="form-input" id="apiBaseUrl" value="${CONFIG.api.baseUrl ?? ''}" placeholder="اتركه فارغًا إذا المتجر على نفس المضيف، مثل http://localhost:3000">
                    <small style="display:block;color:#666;margin-top:6px;text-align:right;">يُخزَّن في المتصفح لربط المتجر المنفصل بالخلفية.</small>
                </div>
                <button type="button" class="btn btn-primary" onclick="AdminApp.saveSettings()">حفظ الإعدادات</button>
                <hr style="margin:30px 0;">
                <h4 style="color:#ef4444;margin-bottom:15px;">منطقة الخطر</h4>
                <button type="button" class="btn btn-secondary" style="border-color:#ef4444;color:#ef4444;" onclick="AdminApp.clearLocalCache()">🗑️ مسح النسخة المحلية (السلة لا تتأثر)</button>
            </div>
        `;
    },

    async updateStatus(id, status) {
        try {
            if (this.hasAdminSession() && !this.ordersSourceLocal) {
                await TopWatchAPI.patchOrder(id, { status });
            }
            const order = this.orders.find((o) => String(o.id) === String(id));
            if (order) order.status = status;
            this.saveLocalSnapshots();
            this.renderPage();
            this.showNotification('تم تحديث حالة الطلب', 'success');
        } catch (e) {
            console.warn(e);
            this.showNotification('فشل التحديث — تحقق من المفتاح والخادم', 'info');
        }
    },

    async deleteOrder(id) {
        if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
        try {
            if (this.hasAdminSession() && !this.ordersSourceLocal) {
                await TopWatchAPI.deleteOrder(id);
            }
            this.orders = this.orders.filter((o) => String(o.id) !== String(id));
            this.saveLocalSnapshots();
            await this.bootstrapData().then(() => this.renderPage());
            this.showNotification('تم حذف الطلب', 'info');
        } catch (e) {
            console.warn(e);
            this.showNotification('تعذر الحذف من الخادم', 'info');
        }
    },

    openOrderEditor(id) {
        const o = this.orders.find((x) => String(x.id) === String(id));
        if (!o) return;

        const itemsList = o.items
            .map(
                (i) =>
                    `<li>${this.escapeHtml(i.name)} ${i.color ? `(${this.escapeHtml(i.color)})` : ''} × ${i.quantity} — ${Number(i.price) * Number(i.quantity)} ج.م</li>`
            )
            .join('');

        this.openModal(
            `تعديل الطلب #${this.escapeHtml(o.id)}`,
            `
            <form id="orderEditForm" class="admin-order-form">
                <div class="form-group"><label class="form-label">اسم العميل</label>
                    <input type="text" class="form-input" id="oeName" required value="${this.escapeHtml(o.name)}"></div>
                <div class="form-group"><label class="form-label">الهاتف</label>
                    <input type="text" class="form-input" id="oePhone" required value="${this.escapeHtml(o.phone)}"></div>
                <div class="form-group"><label class="form-label">المحافظة</label>
                    <input type="text" class="form-input" id="oeGov" required value="${this.escapeHtml(o.governorate)}"></div>
                <div class="form-group"><label class="form-label">العنوان التفصيلي</label>
                    <textarea class="form-textarea" id="oeAddr" rows="2">${this.escapeHtml(o.address)}</textarea></div>
                <div class="form-group"><label class="form-label">ملاحظات</label>
                    <textarea class="form-textarea" id="oeNotes" rows="2">${this.escapeHtml(o.notes || '')}</textarea></div>
                <div class="form-group"><label class="form-label">طريقة الدفع</label>
                    <select class="form-select" id="oePayment">
                        <option value="cod" ${o.payment === 'cod' ? 'selected' : ''}>عند الاستلام</option>
                        <option value="vodafone" ${o.payment === 'vodafone' ? 'selected' : ''}>فودافون كاش</option>
                        ${
                            o.payment === 'instapay'
                                ? '<option value="instapay" selected>إنستاباي (طلب قديم)</option>'
                                : ''
                        }
                    </select></div>
                <div class="form-group"><label class="form-label">حالة الطلب</label>
                    <select class="form-select" id="oeStatus">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>قيد التجهيز</option>
                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>تم الشحن</option>
                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>تم التسليم</option>
                        <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>ملغي</option>
                    </select></div>
                <div class="admin-order-items-readonly">
                    <h4>بنود الطلب</h4>
                    <ul>${itemsList}</ul>
                    <p class="admin-order-total"><strong>الإجمالي المحفوظ: ${o.total} ج.م</strong></p>
                    <p class="form-hint">تعديل المنتجات يتطلّب إنشاء طلب جديد من المتجر.</p>
                </div>
                <button type="button" class="btn btn-primary btn-full" onclick="AdminApp.saveOrderEdits(${this.jsLiteral(o.id)})">حفظ التغييرات</button>
            </form>
        `
        );
    },

    async saveOrderEdits(id) {
        const name = document.getElementById('oeName').value.trim();
        const phone = document.getElementById('oePhone').value.trim();
        const governorate = document.getElementById('oeGov').value.trim();
        const address = document.getElementById('oeAddr').value.trim();
        const notes = document.getElementById('oeNotes').value.trim();
        const payment = document.getElementById('oePayment').value;
        const status = document.getElementById('oeStatus').value;

        if (!name || !phone || !governorate) {
            this.showNotification('يرجى تعبئة الاسم والهاتف والمحافظة', 'info');
            return;
        }

        const payload = {
            name,
            phone,
            governorate,
            address,
            notes,
            payment,
            status,
        };

        try {
            if (this.hasAdminSession() && !this.ordersSourceLocal) {
                await TopWatchAPI.patchOrder(id, payload);
            }
            const order = this.orders.find((x) => String(x.id) === String(id));
            if (order) Object.assign(order, payload);
            this.saveLocalSnapshots();
            this.closeModal();
            this.renderPage();
            this.showNotification('تم حفظ بيانات الطلب', 'success');
        } catch (e) {
            console.warn(e);
            this.showNotification('فشل الحفظ على الخادم', 'info');
        }
    },

    openProductModal(id) {
        const p =
            id !== undefined && id !== null && String(id).length > 0
                ? this.products.find((x) => String(x.id) === String(id))
                : null;

        const oldPriceInput = p && p.oldPrice != null ? String(p.oldPrice) : '';
        const mainImgDisplay = p ? this.escapeHtml(this.imageFilenameForForm(p.image)) : '';
        const extraDisplay =
            p && Array.isArray(p.images)
                ? this.escapeHtml(
                      p.images
                          .filter((u, i) => u !== (p.images[0] || p.image))
                          .map((u) => this.imageFilenameForForm(u))
                          .filter(Boolean)
                          .join(' ، ')
                  )
                : '';

        this.openModal(
            p ? 'تعديل منتج' : 'إضافة منتج جديد',
            `
            <form id="productForm">
                <div class="form-group"><label class="form-label">اسم المنتج</label><input type="text" class="form-input" id="pName" value="${p ? this.escapeHtml(p.name) : ''}" required></div>
                <div class="form-group"><label class="form-label">الفئة</label>
                    <select class="form-select" id="pCat">
                        <option value="men-classic" ${p?.category === 'men-classic' ? 'selected' : ''}>رجالي كلاسيك</option>
                        <option value="men-casual" ${p?.category === 'men-casual' ? 'selected' : ''}>رجالي كاجوال</option>
                        <option value="women" ${p?.category === 'women' ? 'selected' : ''}>حريمي</option>
                    </select>
                </div>
                <div class="form-group"><label class="form-label">السعر</label><input type="number" class="form-input" id="pPrice" value="${p ? p.price : ''}" required min="0" step="0.01"></div>
                <div class="form-group"><label class="form-label">سعر قبل الخصم (اختياري)</label><input type="number" class="form-input" id="pOldPrice" value="${oldPriceInput}" min="0" step="0.01"></div>
                <div class="form-group"><label class="form-label">الصورة الرئيسية (اسم الملف داخل مجلد images)</label><input type="text" class="form-input" id="pImage" value="${mainImgDisplay}" required placeholder="Cartier-Tank-Brown-Leather.png" autocomplete="off"></div>
                <div class="form-group"><label class="form-label">صور إضافية (أسماء ملفات مفصولة بفاصلة ،)</label><textarea class="form-textarea" id="pImagesExtra" placeholder="rolex2.png ، rolex3.png" autocomplete="off">${extraDisplay}</textarea></div>
                <p class="form-hint">ضع الملفات في مجلد <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">images</code> بجانب الموقع؛ يُخزَّن المسار كـ <strong>images/اسم الملف</strong>.</p>
                <div class="form-group"><label class="form-label">الوصف</label><textarea class="form-textarea" id="pDesc">${p ? this.escapeHtml(p.description) : ''}</textarea></div>
                <div class="form-group"><label class="form-label">الكمية في المخزون</label>
                    <input type="number" class="form-input" id="pStockQty" min="0" step="1" value="${p ? this.effectiveStock(p) : '10'}"></div>
                <p class="form-hint">عند وضع <strong>0</strong> يظهر المنتج كـ «غير متوفر» في المتجر ولوحة التحكم.</p>
                <button type="button" class="btn btn-primary btn-full" onclick="AdminApp.saveProduct(${typeof id !== 'undefined' ? this.jsLiteral(id) : 'undefined'})">${p ? 'حفظ التعديلات' : 'إضافة المنتج'}</button>
            </form>
        `
        );
    },

    async saveProduct(existingIdRaw) {
        const name = document.getElementById('pName').value.trim();
        const category = document.getElementById('pCat').value;
        const price = Number(document.getElementById('pPrice').value);
        const oldP = document.getElementById('pOldPrice').value;
        const imageRaw = document.getElementById('pImage').value.trim();
        const extra = document.getElementById('pImagesExtra').value;
        const desc = document.getElementById('pDesc').value;
        const stockQty = Math.max(
            0,
            Math.floor(Number(document.getElementById('pStockQty').value) || 0)
        );

        const image = this.normalizeShopImagePath(imageRaw);
        if (!image) {
            this.showNotification('أدخل اسم ملف الصورة الرئيسية', 'info');
            return;
        }

        const more = extra
            .split(/[,،]/g)
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => this.normalizeShopImagePath(s))
            .filter(Boolean);
        let images = [image, ...more].filter(
            (u, ix, arr) => u && arr.indexOf(u) === ix
        );

        const prev =
            existingIdRaw != null
                ? this.products.find((x) => String(x.id) === String(existingIdRaw))
                : null;

        const data = {
            name,
            category,
            price,
            oldPrice:
                oldP !== '' && !Number.isNaN(Number(oldP)) ? Number(oldP) : null,
            image,
            images: images.length ? images : [image],
            description: desc,
            colors:
                prev && Array.isArray(prev.colors) && prev.colors.length
                    ? prev.colors
                    : ['أسود', 'ذهبي'],
            stockQuantity: stockQty,
            inStock: stockQty > 0,
        };

        const newIdNumeric =
            typeof existingIdRaw === 'number'
                ? existingIdRaw
                : existingIdRaw != null && !Number.isNaN(Number(existingIdRaw))
                  ? Number(existingIdRaw)
                  : Date.now();

        try {
            if (this.hasAdminSession()) {
                const payloadPost = {
                    ...data,
                    id: newIdNumeric,
                };
                if (existingIdRaw == null) {
                    await TopWatchAPI.postProduct(payloadPost);
                    this.closeModal();
                    await this.bootstrapData().then(() => this.renderPage());
                    this.showNotification('تم إضافة المنتج على الخادم', 'success');
                    return;
                }

                try {
                    await TopWatchAPI.putProduct(existingIdRaw, data);
                    this.showNotification('تم تحديث المنتج على الخادم', 'success');
                } catch (err) {
                    const msg = String(err.message || err || '').toLowerCase();
                    if (msg.includes('not found')) {
                        await TopWatchAPI.postProduct(payloadPost);
                        this.showNotification(
                            'تم حفظ المنتج على الخادم (أُنشئ لأنه لم يكن موجوداً في قاعدة البيانات)',
                            'success'
                        );
                    } else {
                        throw err;
                    }
                }
                this.closeModal();
                await this.bootstrapData().then(() => this.renderPage());
                return;
            }

            /** محلي بدون خادم */
            const localRow = {
                ...data,
                id: existingIdRaw != null ? existingIdRaw : newIdNumeric,
            };
            if (existingIdRaw != null) {
                const ix = this.products.findIndex(
                    (x) => String(x.id) === String(existingIdRaw)
                );
                if (ix >= 0) this.products[ix] = localRow;
                else this.products.push(localRow);
            } else {
                this.products.push(localRow);
            }
            this.saveLocalSnapshots();
            this.closeModal();
            this.renderPage();
            this.showNotification('تم الحفظ محلياً فقط — سجّل الدخول مع تشغيل الخادم لحفظ MongoDB', 'success');
        } catch (e) {
            console.warn(e);
            this.showNotification('خطأ من الخادم: ' + (e.message || String(e)), 'info');
        }
    },

    async deleteProduct(id) {
        if (!confirm('حذف هذا المنتج نهائياً؟')) return;
        try {
            if (this.hasAdminSession())
                await TopWatchAPI.deleteProduct(id);
            this.products = this.products.filter(
                (p) => String(p.id) !== String(id)
            );
            this.saveLocalSnapshots();
            await this.bootstrapData().then(() => this.renderPage());
            this.showNotification('تم حذف المنتج', 'info');
        } catch (e) {
            console.warn(e);
            this.showNotification('تعذر الحذف من الخادم', 'info');
        }
    },

    exportOrders() {
        let csv = 'رقم الطلب,العميل,الهاتف,المحافظة,العنوان,الإجمالي,الحالة,التاريخ\n';
        this.orders.forEach((o) => {
            csv += `${o.id},${o.name},${o.phone},${o.governorate},${String(o.address).replace(/,/g, '؛')},${o.total},${o.status},${new Date(o.date).toLocaleDateString()}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'topwatch_orders.csv';
        a.click();
    },

    contactCustomer(phone) {
        const n = String(phone).replace(/\D/g, '');
        const wa = n.startsWith('0') ? '20' + n.slice(1) : n.startsWith('20') ? n : `20${n}`;
        window.open(`https://wa.me/${wa}`, '_blank', 'noopener,noreferrer');
    },

    saveSettings() {
        const wa = document.getElementById('waNumber').value.trim();
        const apiBase =
            document.getElementById('apiBaseUrl')?.value?.trim?.() ?? '';

        if (wa) CONFIG.store.whatsappNumber = wa;
        try {
            if (typeof localStorage !== 'undefined') {
                if (wa) localStorage.setItem('topwatch_wa', wa);
                localStorage.setItem('topwatch_api_base', apiBase);
                CONFIG.api.baseUrl = apiBase;
            }
        } catch (_) {
            /* ignore */
        }

        void this.bootstrapData().then(() => this.renderPage());
        this.showNotification('تم حفظ الإعدادات', 'success');
    },

    clearLocalCache() {
        if (
            confirm(
                'مسح الطلبات والمنتجات المخزّنة محلياً في هذا المتصفح؟ (لا يمسّ MongoDB)'
            )
        ) {
            localStorage.removeItem('topwatch_orders');
            localStorage.removeItem('topwatch_products');
            void this.bootstrapData().then(() => this.renderPage());
        }
    },

    getStatusText(s) {
        return (
            {
                pending: 'قيد الانتظار',
                processing: 'قيد التجهيز',
                shipped: 'تم الشحن',
                delivered: 'تم التسليم',
                cancelled: 'ملغي',
            }[s] || s
        );
    },
    getPaymentText(p) {
        return (
            { cod: 'عند الاستلام', vodafone: 'فودافون كاش', instapay: 'إنستاباي' }[
                p
            ] || p
        );
    },
    getCategoryName(c) {
        return (
            {
                'men-classic': 'رجالي كلاسيك',
                'men-casual': 'رجالي كاجوال',
                women: 'حريمي',
            }[c] || c
        );
    },
    openModal(title, contentHtml) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = contentHtml;
        document.getElementById('modalOverlay').style.display = 'flex';
    },
    closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
    },
    showNotification(msg, type) {
        const bg = type === 'success' ? '#10b981' : '#3b82f6';
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${bg};color:white;padding:12px 25px;border-radius:8px;z-index:9999;box-shadow:0 5px 15px rgba(0,0,0,0.2);max-width:90%;`;
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3800);
    },
    logout() {
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('topwatch_admin_key');
        sessionStorage.removeItem('topwatch_admin_token');
        location.reload();
    },
};

document.addEventListener('DOMContentLoaded', () => AdminApp.init());
