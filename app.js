/**
 * ==========================================
 * TOP Watch - Main Application Logic
 * ==========================================
 */

const SHOP_IMG_FALLBACK =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect fill="#1a1a1a" width="640" height="480"/><circle cx="320" cy="220" r="88" fill="none" stroke="#D4AF37" stroke-width="6"/><circle cx="320" cy="220" r="6" fill="#D4AF37"/><text x="320" y="400" text-anchor="middle" fill="#D4AF37" font-family="system-ui,sans-serif" font-size="18">TOP Watch</text></svg>'
    );

// ==================== Sound Manager ====================
const SoundManager = {
    audioContext: null,
    enabled: true,

    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    },

    playClick() {
        if (!this.enabled) return;
        if (!this.audioContext) this.init();
        const ctx = this.audioContext;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1800, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc1.connect(gain1); gain1.connect(ctx.destination);
        osc1.start(now); osc1.stop(now + 0.08);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2400, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
        gain2.gain.setValueAtTime(0.08, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc2.start(now); osc2.stop(now + 0.04);
    },

    playAddToCart() {
        if (!this.enabled) return;
        if (!this.audioContext) this.init();
        const ctx = this.audioContext;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0.1, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.2);
        });
    },

    playRemove() {
        if (!this.enabled) return;
        if (!this.audioContext) this.init();
        const ctx = this.audioContext;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.2);
    },

    playSuccess() {
        if (!this.enabled) return;
        if (!this.audioContext) this.init();
        const ctx = this.audioContext;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.12);
            gain.gain.setValueAtTime(0.12, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.3);
        });
    },

    playPageChange() {
        if (!this.enabled) return;
        if (!this.audioContext) this.init();
        const ctx = this.audioContext;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.15);
    },

    playSearch() {
        if (!this.enabled) return;
        if (!this.audioContext) this.init();
        const ctx = this.audioContext;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1600, now + 0.04);
        osc.frequency.setValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.1);
    },

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};

// ==================== Main Application ====================
class TOPWatchApp {
    constructor() {
        this.cart = [];
        this.products = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.quantity = 1;
        this.currentProduct = null;
        this.init();
    }

    init() {
        if (
            typeof window !== 'undefined' &&
            window.location.protocol === 'file:'
        ) {
            console.warn(
                '[TOP Watch] You opened index.html as a file (file:///). Use http://localhost:3000 (run npm start) for best results — images and APIs are fixed to work either way.'
            );
        }

        this.loadCart();
        this.updateConfig();
        this.setupEventListeners();
        this.setupLazyLoading();
        this.setupGlobalClickSound();

        // Never wait for window "load" (fonts/CDN can hang). Dismiss when the app is ready.
        this.refreshCatalog()
            .finally(() => {
                this.renderHome();
                this.updateCartUI();
                this.dismissLoadingScreen();
            });

        // If fetch hangs (e.g. no AbortSignal.timeout on very old browsers), still unblock the UI.
        setTimeout(() => this.dismissLoadingScreen(), 14000);
    }

    /** Hides the full-page loader (idempotent). */
    dismissLoadingScreen() {
        const el = document.getElementById('loadingScreen');
        if (!el || el.dataset.dismissed === '1') return;
        el.dataset.dismissed = '1';
        el.classList.add('hidden');
        el.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
            el.classList.add('is-gone');
        }, 500);
    }

    normalizeProducts(raw) {
        return (Array.isArray(raw) ? raw : []).map((p) => {
            const mainSrc = TopWatchAPI.resolveShopAsset(p.image);
            const list = Array.isArray(p.images) && p.images.length
                ? p.images
                : [p.image];
            const imgs = list.map((x) => TopWatchAPI.resolveShopAsset(x));
            let stockQty = p.stockQuantity;
            if (stockQty != null && !Number.isNaN(Number(stockQty))) {
                stockQty = Math.max(0, Math.floor(Number(stockQty)));
            } else {
                stockQty = p.inStock !== false ? 50 : 0;
            }
            const inStock = stockQty > 0;
            return {
                ...p,
                image: mainSrc,
                images: imgs.length ? imgs : [mainSrc],
                description: p.description || '',
                stockQuantity: stockQty,
                inStock,
            };
        });
    }

    /** Maximum units sellable (0 = out of stock). */
    productStockCap(product) {
        if (!product) return 0;
        const q = product.stockQuantity;
        if (q != null && !Number.isNaN(Number(q))) return Math.max(0, Math.floor(Number(q)));
        return product.inStock !== false ? Infinity : 0;
    }

    isOutOfStock(product) {
        return this.productStockCap(product) <= 0;
    }

    imgSrc(u) {
        const s = TopWatchAPI.resolveShopAsset(u);
        return s || SHOP_IMG_FALLBACK;
    }

    onImgError(el) {
        if (!el || el.dataset.fallbackApplied === '1') return;
        el.dataset.fallbackApplied = '1';
        el.src = SHOP_IMG_FALLBACK;
        el.classList.add('img-fallback');
        el.alt = '';
    }

    async refreshCatalog() {
        let list = this.normalizeProducts(CONFIG.products.slice());
        try {
            const remote = await TopWatchAPI.getProducts();
            if (Array.isArray(remote) && remote.length) list = this.normalizeProducts(remote);
        } catch {
            console.warn('[TOP Watch] using built-in product list — API unreachable or file opened without server');
        }
        this.products = list;
    }

    findProduct(productId) {
        return this.products.find((p) => String(p.id) === String(productId));
    }

    // ==================== Global Sound Setup ====================
    setupGlobalClickSound() {
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.target.closest('.cart-sidebar')) return;
            SoundManager.playClick();
        });

        const originalAdd = this.addToCart.bind(this);
        this.addToCart = function(productId, fromDetails = false) {
            SoundManager.playAddToCart();
            originalAdd(productId, fromDetails);
        };

        const originalRemove = this.removeFromCart.bind(this);
        this.removeFromCart = function(productId) {
            SoundManager.playRemove();
            originalRemove(productId);
        };

        const originalNavigate = this.navigate.bind(this);
        this.navigate = function(page, params = null) {
            SoundManager.playPageChange();
            originalNavigate(page, params);
        };

        const originalSearch = this.searchProducts.bind(this);
        this.searchProducts = function(query) {
            if (query.length > 0 && query.length % 2 === 0) SoundManager.playSearch();
            originalSearch(query);
        };
    }

    // ==================== Configuration ====================
    updateConfig() {
        const nameEls = document.querySelectorAll('#navStoreName, #footerStoreName');
        nameEls.forEach(el => el.textContent = CONFIG.store.name);

        const waBtn = document.getElementById('whatsappFloat');
        if (waBtn) waBtn.href = `https://wa.me/${CONFIG.store.whatsappNumber}`;

        const phoneEl = document.getElementById('footerPhone');
        if (phoneEl) phoneEl.textContent = CONFIG.store.whatsappNumber.replace('20', '0');

        const yearEl = document.getElementById('footerYear');
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());

        const logoImg = document.querySelector('.navbar .logo img');
        if (logoImg) {
            logoImg.dataset.fallbackApplied = '';
            const logoPath = CONFIG.store.logo || 'logo.png';
            logoImg.src = TopWatchAPI.resolveShopAsset(logoPath);
            logoImg.alt = CONFIG.store.name || 'TOP Watch';
            logoImg.onload = () => {
                logoImg.style.display = '';
                const fb = logoImg.parentElement.querySelector('.logo-icon-fallback');
                if (fb) fb.style.display = 'none';
            };
            logoImg.onerror = () => {
                logoImg.style.display = 'none';
                const fb = logoImg.parentElement.querySelector('.logo-icon-fallback');
                if (fb) fb.style.display = 'flex';
            };
        }
    }

    // ==================== Navigation ====================
    navigate(page, params = null) {
        this.closeCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        switch(page) {
            case 'home': this.renderHome(); break;
            case 'product': this.renderProductDetails(params); break;
            case 'checkout': this.renderCheckout(); break;
            case 'contact': this.renderContact(); break;
        }
        if (history.pushState) {
            const url = page === 'home' ? '/' : `/${page}${params ? '/' + params : ''}`;
            history.pushState({ page, params }, '', url);
        }
    }

    // ==================== Rendering ====================
    renderHome() {
        const main = document.getElementById('mainContent');
        const filtered = this.getFilteredProducts();

        main.innerHTML = `
            <section class="hero">
                <div class="container">
                    <div class="hero-content">
                        <h1>اكتشف الفخامة في كل ثانية</h1>
                        <p>مجموعتنا الحصرية من الساعات الفاخرة تجمع بين الأناقة والدقة السويسرية</p>
                        <button class="btn btn-primary" onclick="document.getElementById('productsSection').scrollIntoView({behavior: 'smooth'})">
                            تسوق الآن <i class="fas fa-shopping-bag"></i>
                        </button>
                    </div>
                    <div class="hero-image hero-image-watch">
                        <img src="${this.imgSrc('images/1.png')}" alt="${CONFIG.store.name}" decoding="async" onerror="app.onImgError(this)">
                    </div>
                </div>
            </section>

            <section class="section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">تسوق حسب الفئة</h2>
                        <p class="section-subtitle">اختر من مجموعتنا المتنوعة</p>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
                        ${['men-classic', 'men-casual', 'women'].map((cat, i) => {
                            const names = ['رجالي كلاسيك', 'رجالي كاجوال', 'حريمي'];
                            const icons = ['fa-user-tie', 'fa-watch', 'fa-female'];
                            return `
                            <div class="category-card" onclick="app.filterByCategory('${cat}')" style="
                                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                                padding: 40px; border-radius: 10px; text-align: center; cursor: pointer;
                                transition: all 0.3s; border: 2px solid transparent;
                            " onmouseover="this.style.borderColor='#D4AF37'; this.style.transform='translateY(-5px)'" 
                               onmouseout="this.style.borderColor='transparent'; this.style.transform='translateY(0)'">
                                <i class="fas ${icons[i]}" style="font-size: 48px; color: #D4AF37; margin-bottom: 20px;"></i>
                                <h3 style="color: white; font-size: 24px; margin-bottom: 10px;">${names[i]}</h3>
                                <p style="color: rgba(255,255,255,0.7);">${['ساعات رسمية أنيقة', 'ساعات يومية عملية', 'ساعات نسائية فاخرة'][i]}</p>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </section>

            <section class="section" id="productsSection" style="background: white;">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title">منتجاتنا المميزة</h2>
                        <p class="section-subtitle">اختر من بين مجموعتنا الحصرية</p>
                    </div>

                    <div class="filter-buttons" style="display: flex; justify-content: center; gap: 15px; margin-bottom: 40px; flex-wrap: wrap;">
                        <button class="btn ${this.currentCategory === 'all' ? 'btn-primary' : 'btn-secondary'}" onclick="app.filterByCategory('all')">الكل</button>
                        <button class="btn ${this.currentCategory === 'men-classic' ? 'btn-primary' : 'btn-secondary'}" onclick="app.filterByCategory('men-classic')">رجالي كلاسيك</button>
                        <button class="btn ${this.currentCategory === 'men-casual' ? 'btn-primary' : 'btn-secondary'}" onclick="app.filterByCategory('men-casual')">رجالي كاجوال</button>
                        <button class="btn ${this.currentCategory === 'women' ? 'btn-primary' : 'btn-secondary'}" onclick="app.filterByCategory('women')">حريمي</button>
                    </div>

                    <div class="products-grid">
                        ${filtered.length > 0 ? filtered.map(p => this.renderProductCard(p)).join('') : `
                            <div class="text-center" style="padding: 60px; grid-column: 1 / -1;">
                                <i class="fas fa-search" style="font-size: 64px; color: #D4AF37; margin-bottom: 20px;"></i>
                                <h3 style="color: #333;">لا توجد منتجات مطابقة</h3>
                            </div>`}
                    </div>
                </div>
            </section>

            <section class="section" style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: white;">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title" style="color: #D4AF37;">لماذا تختارنا؟</h2>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px;">
                        ${[
                            ['fa-shipping-fast', 'شحن سريع', 'توصيل لجميع المحافظات خلال 2-4 أيام'],
                            ['fa-undo', 'استرجاع سهل', 'يمكنك استرجاع المنتج خلال 5 أيام'],
                            ['fa-headset', 'دعم 24/7', 'فريق دعم متواجد دائماً لمساعدتك']
                        ].map(([icon, title, desc]) => `
                            <div style="text-align: center;">
                                <i class="fas ${icon}" style="font-size: 48px; color: #D4AF37; margin-bottom: 20px;"></i>
                                <h3 style="margin-bottom: 10px;">${title}</h3>
                                <p style="color: rgba(255,255,255,0.7);">${desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    renderProductCard(product) {
        const catNames = { 'men-classic': 'رجالي كلاسيك', 'men-casual': 'رجالي كاجوال', 'women': 'حريمي' };
        const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

        const out = this.isOutOfStock(product);
        return `
            <div class="product-card fade-in ${out ? 'product-card-out' : ''}">
                ${out ? `<span class="product-badge" style="background:#991b1b;">غير متوفر</span>` : ''}
                ${discount > 0 && !out ? `<span class="product-badge">خصم ${discount}%</span>` : ''}
                <div class="product-image">
                    <img src="${this.imgSrc(product.image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer-when-downgrade" onerror="app.onImgError(this)">
                    <div class="product-actions">
                        <button type="button" class="product-action-btn" onclick="app.navigate('product', ${JSON.stringify(product.id)})" title="عرض التفاصيل"><i class="fas fa-eye"></i></button>
                        <button type="button" class="product-action-btn" ${out ? 'disabled' : ''} onclick="app.addToCart(${JSON.stringify(product.id)})" title="إضافة للسلة"><i class="fas fa-shopping-bag"></i></button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${catNames[product.category]}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">${product.price} ${CONFIG.store.currencySymbol}</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice} ${CONFIG.store.currencySymbol}</span>` : ''}
                    </div>
                    <button type="button" class="btn btn-primary btn-full" ${out ? 'disabled' : ''} onclick="app.addToCart(${JSON.stringify(product.id)})"><i class="fas fa-shopping-bag"></i> ${out ? 'غير متوفر' : 'أضف للسلة'}</button>
                </div>
            </div>`;
    }

    renderProductDetails(productId) {
        const product = this.findProduct(productId);
        if (!product) return;
        this.currentProduct = product;
        this.quantity = 1;

        const catNames = { 'men-classic': 'رجالي كلاسيك', 'men-casual': 'رجالي كاجوال', 'women': 'حريمي' };

        const outOfStock = this.isOutOfStock(product);
        document.getElementById('mainContent').innerHTML = `
            <div class="product-details">
                <div class="container">
                    <button type="button" class="btn btn-secondary mb-20" onclick="app.navigate('home')"><i class="fas fa-arrow-right"></i> العودة للمتجر</button>
                    ${outOfStock ? '<p class="stock-banner-out">هذا المنتج غير متوفر حالياً</p>' : ''}
                    <div class="product-details-grid">
                        <div class="product-gallery">
                            <div class="main-image"><img src="${this.imgSrc(product.image)}" alt="" id="mainProductImage" decoding="async" referrerpolicy="no-referrer-when-downgrade" onerror="app.onImgError(this)"></div>
                            <div class="thumbnail-images" id="productThumbnails">
                                ${product.images.map((img, i) => `
                                    <button type="button" class="thumbnail ${i === 0 ? 'active' : ''}" data-thumb-index="${i}" aria-label="صورة ${i + 1}">
                                        <img src="${this.imgSrc(img)}" alt="" loading="lazy" decoding="async" onerror="app.onImgError(this)">
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="product-info-details">
                            <div class="product-category">${catNames[product.category]}</div>
                            <h1>${product.name}</h1>
                            <p class="product-description">${product.description}</p>
                            <div class="product-price-details">
                                <div class="price-label">السعر:</div>
                                <div class="price-value">${product.price} ${CONFIG.store.currencySymbol}</div>
                                ${product.oldPrice ? `<div style="text-decoration:line-through;color:#999;margin-top:5px;">${product.oldPrice} ${CONFIG.store.currencySymbol}</div>` : ''}
                            </div>
                            <div class="quantity-selector">
                                <span class="quantity-label">الكمية:</span>
                                <div class="quantity-controls">
                                    <button class="quantity-btn" onclick="app.decreaseQuantity()">-</button>
                                    <span class="quantity-value" id="quantityValue">1</span>
                                    <button class="quantity-btn" onclick="app.increaseQuantity()">+</button>
                                </div>
                            </div>
                            <div style="display:flex;gap:15px;flex-wrap:wrap;">
                                <button type="button" class="btn btn-primary" style="flex:1;min-width:200px;" ${outOfStock ? 'disabled' : ''} onclick="app.addToCart(${JSON.stringify(product.id)}, true)"><i class="fas fa-shopping-bag"></i> ${outOfStock ? 'غير متوفر' : 'أضف للسلة'}</button>
                                <button type="button" class="btn btn-secondary" ${outOfStock ? 'disabled' : ''} onclick="app.buyNow(${JSON.stringify(product.id)})"><i class="fas fa-bolt"></i> شراء الآن</button>
                            </div>
                            <div style="margin-top:30px;padding:20px;background:#f5f5f5;border-radius:10px;">
                                <h4 style="margin-bottom:15px;color:#333;">معلومات المنتج:</h4>
                                <ul style="list-style:none;color:#666;">
                                    <li style="margin-bottom:10px;"><i class="fas fa-check" style="color:#D4AF37;margin-left:10px;"></i> شحن جميع المحافظات</li>
                                    <li><i class="fas fa-check" style="color:#D4AF37;margin-left:10px;"></i> استرجاع خلال 5 ايام</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        this.bindProductGallery(product);
    }

    bindProductGallery(product) {
        const main = document.getElementById('mainProductImage');
        const wrap = document.getElementById('productThumbnails');
        if (!main || !wrap || !product.images?.length) return;
        const imgs = product.images.map((u) => this.imgSrc(u));
        wrap.querySelectorAll('.thumbnail').forEach((thumb) => {
            thumb.addEventListener('click', (ev) => {
                ev.preventDefault();
                const idx = Number(thumb.dataset.thumbIndex);
                const src = imgs[idx];
                if (src == null) return;
                main.src = src;
                wrap.querySelectorAll('.thumbnail').forEach((t) =>
                    t.classList.remove('active')
                );
                thumb.classList.add('active');
            });
        });
    }

    renderCheckout() {
        if (this.cart.length === 0) {
            alert('السلة فارغة!');
            this.navigate('home');
            return;
        }
        const total = this.calculateTotal();
        document.getElementById('mainContent').innerHTML = `
            <div class="checkout-page">
                <div class="container">
                    <h1 class="section-title" style="text-align:center;margin-bottom:40px;">إتمام الطلب</h1>
                    <div class="checkout-grid">
                        <div class="checkout-form">
                            <h2 style="margin-bottom:30px;color:#333;">معلومات الشحن</h2>
                            <form id="checkoutForm" onsubmit="app.submitOrder(event)">
                                <div class="form-group"><label class="form-label">الاسم الكامل *</label><input type="text" class="form-input" id="customerName" required placeholder="أدخل اسمك الكامل"></div>
                                <div class="form-group"><label class="form-label">رقم الهاتف *</label><input type="tel" class="form-input" id="customerPhone" required placeholder="01xxxxxxxxx"></div>
                                <div class="form-group"><label class="form-label">المحافظة *</label>
                                    <select class="form-select" id="governorate" required>
                                        <option value="">اختر المحافظة</option>
                                        <option value="القاهرة">القاهرة</option><option value="الجيزة">الجيزة</option>
                                        <option value="الإسكندرية">الإسكندرية</option><option value="الدقهلية">الدقهلية</option>
                                        <option value="الشرقية">الشرقية</option><option value="الغربية">الغربية</option>
                                        <option value="أخرى">أخرى</option>
                                    </select>
                                </div>
                                <div class="form-group"><label class="form-label">العنوان بالتفصيل *</label><textarea class="form-textarea" id="address" required placeholder="الشارع - المنطقة - أقرب معلم"></textarea></div>
                                <div class="form-group"><label class="form-label">ملاحظات إضافية</label><textarea class="form-textarea" id="notes" placeholder="أي ملاحظات خاصة بالطلب"></textarea></div>
                                <h2 style="margin:40px 0 30px;color:#333;">طريقة الدفع</h2>
                                <div class="payment-methods-checkout">
                                    <label class="payment-option active" onclick="app.selectPaymentMethod(this)">
                                        <input type="radio" name="payment" value="cod" checked>
                                        <i class="fas fa-money-bill-wave" style="color:#D4AF37;font-size:24px;"></i>
                                        <div><div style="font-weight:700;">الدفع عند الاستلام</div><div style="font-size:14px;color:#666;">ادفع عند استلام الطلب</div></div>
                                    </label>
                                    <label class="payment-option" onclick="app.selectPaymentMethod(this)">
                                        <input type="radio" name="payment" value="vodafone">
                                        <i class="fas fa-mobile-alt" style="color:#E60000;font-size:24px;"></i>
                                        <div><div style="font-weight:700;">فودافون كاش</div><div style="font-size:14px;color:#666;">أرسل المبلغ إلى: <strong dir="ltr" style="unicode-bidi:embed;">${CONFIG.store.vodafoneCashNumber || ''}</strong></div></div>
                                    </label>
                                </div>
                                <button type="submit" class="btn btn-primary btn-full" style="margin-top:30px;padding:15px;"><i class="fas fa-check-circle"></i> تأكيد الطلب</button>
                            </form>
                        </div>
                        <div class="order-summary">
                            <div class="summary-title">ملخص الطلب</div>
                            ${this.cart.map(item => `
                                <div class="summary-item">
                                    <div><div style="font-weight:600;">${item.name}</div><div style="font-size:14px;color:#666;">الكمية: ${item.quantity}</div></div>
                                    <div style="color:#D4AF37;font-weight:600;">${item.price * item.quantity} ${CONFIG.store.currencySymbol}</div>
                                </div>
                            `).join('')}
                            <div class="summary-total"><span>الإجمالي:</span><span>${total} ${CONFIG.store.currencySymbol}</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    renderContact() {
        document.getElementById('mainContent').innerHTML = `
            <div class="section" style="margin-top:80px;min-height:60vh;">
                <div class="container">
                    <div class="section-header"><h2 class="section-title">تواصل معنا</h2><p class="section-subtitle">نحن هنا لمساعدتك</p></div>
                    <div style="max-width:600px;margin:0 auto;background:white;padding:40px;border-radius:10px;box-shadow:var(--shadow);text-align:center;">
                        <i class="fab fa-whatsapp" style="font-size:64px;color:#25D366;margin-bottom:20px;"></i>
                        <h3 style="margin-bottom:10px;">تواصل عبر واتساب</h3>
                        <p style="color:#666;margin-bottom:30px;">للاستفسارات والطلبات</p>
                        <a href="https://wa.me/${CONFIG.store.whatsappNumber}" class="btn btn-primary btn-full" style="margin-bottom:30px;padding:15px;"><i class="fab fa-whatsapp"></i> محادثة على واتساب</a>
                        <div style="border-top:1px solid #eee;padding-top:30px;text-align:right;">
                            <div style="margin-bottom:20px;"><i class="fas fa-phone" style="color:#D4AF37;margin-left:10px;"></i><strong>الهاتف:</strong> ${CONFIG.store.whatsappNumber.replace('20', '0')}</div>
                            <div style="margin-bottom:20px;"><i class="fas fa-envelope" style="color:#D4AF37;margin-left:10px;"></i><strong>البريد:</strong> info@topwatch.com</div>
                            <div><i class="fas fa-clock" style="color:#D4AF37;margin-left:10px;"></i><strong>ساعات العمل:</strong> يومياً من 10 ص حتى 10 م</div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // ==================== Cart Functions ====================
    addToCart(productId, fromDetails = false) {
        const product = this.findProduct(productId);
        if (!product) return;
        const cap = this.productStockCap(product);
        if (cap <= 0) {
            this.showNotification('هذا المنتج غير متوفر حالياً.', 'error');
            return;
        }
        const qty = fromDetails ? this.quantity : 1;
        const existing = this.cart.find((item) => String(item.id) === String(product.id));
        const room = existing ? cap - existing.quantity : cap;
        if (room <= 0) {
            this.showNotification('لا توجد كمية إضافية متوفرة من هذا المنتج.', 'error');
            return;
        }
        const addQty = Math.min(qty, room);

        if (existing) {
            existing.quantity += addQty;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: addQty,
            });
        }
        this.saveCart();
        this.updateCartUI();
        if (addQty < qty) {
            this.showNotification(`تمت إضافة ${addQty} قطعة فقط (المتوفر ${cap}).`, 'info');
        } else {
            this.showNotification('تمت الإضافة للسلة بنجاح!', 'success');
        }
        if (!fromDetails) this.toggleCart();
    }

    removeFromCart(productId) {
        const sid = productId != null ? String(productId) : '';
        this.cart = this.cart.filter((item) => String(item.id) !== sid);
        this.saveCart();
        this.updateCartUI();
        this.showNotification('تم الحذف من السلة', 'info');
    }

    updateQuantity(productId, change) {
        const sid = productId != null ? String(productId) : '';
        const item = this.cart.find((i) => String(i.id) === sid);
        if (!item) return;

        if (change > 0) {
            const product = this.findProduct(productId);
            const cap = this.productStockCap(product);
            if (Number.isFinite(cap) && item.quantity + change > cap) {
                this.showNotification(`الكمية المتوفرة: ${cap}`, 'error');
                return;
            }
        }

        item.quantity += change;
        if (item.quantity <= 0) this.removeFromCart(productId);
        else {
            this.saveCart();
            this.updateCartUI();
        }
    }

    calculateTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    updateCartUI() {
        const countEl = document.getElementById('cartCount');
        const itemsEl = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');
        const footerEl = document.getElementById('cartFooter');
        const emptyEl = document.getElementById('cartEmpty');

        countEl.textContent = this.cart.reduce((s, i) => s + i.quantity, 0);

        if (this.cart.length === 0) {
            itemsEl.innerHTML = '';
            footerEl.style.display = 'none';
            emptyEl.style.display = 'block';
        } else {
            emptyEl.style.display = 'none';
            footerEl.style.display = 'block';
            itemsEl.innerHTML = this.cart.map((item) => {
                const pid = JSON.stringify(item.id);
                return `
                <div class="cart-item">
                    <button type="button" class="cart-item-remove" onclick="app.removeFromCart(${pid})" aria-label="حذف"><i class="fas fa-trash"></i></button>
                    <div class="cart-item-image"><img src="${this.imgSrc(item.image)}" alt="" decoding="async" referrerpolicy="no-referrer-when-downgrade" onerror="app.onImgError(this)"></div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price} ${CONFIG.store.currencySymbol}</div>
                        <div class="cart-item-quantity">
                            <button type="button" onclick="app.updateQuantity(${pid}, -1)" aria-label="أقل">-</button>
                            <span>${item.quantity}</span>
                            <button type="button" onclick="app.updateQuantity(${pid}, 1)" aria-label="أكثر">+</button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }
        totalEl.textContent = `${this.calculateTotal()} ${CONFIG.store.currencySymbol}`;
    }

    toggleCart() {
        const sb = document.getElementById('cartSidebar');
        sb.classList.toggle('active');
        document.body.style.overflow = sb.classList.contains('active') ? 'hidden' : '';
    }

    /** إغلاق السلة دون تبديل (عند الانتقال لصفحة الدفع وغيرها) */
    closeCart() {
        const sb = document.getElementById('cartSidebar');
        if (!sb) return;
        sb.classList.remove('active');
        document.body.style.overflow = '';
    }

    saveCart() {
        localStorage.setItem('topwatch_cart', JSON.stringify(this.cart));
    }

    loadCart() {
        const saved = localStorage.getItem('topwatch_cart');
        if (!saved) return;
        try {
            const raw = JSON.parse(saved);
            if (!Array.isArray(raw)) {
                this.cart = [];
                return;
            }
            this.cart = raw.map((i) => ({
                id: i.id,
                name: i.name,
                price: Number(i.price),
                image: i.image,
                quantity: Math.max(1, Number(i.quantity) || 1),
            }));
        } catch {
            this.cart = [];
        }
    }

    // ==================== Product Details Utils ====================
    changeImage(src, thumb) {
        document.getElementById('mainProductImage').src = this.imgSrc(src);
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
    }

    increaseQuantity() {
        const p = this.currentProduct;
        const cap = p ? this.productStockCap(p) : Infinity;
        if (Number.isFinite(cap) && this.quantity >= cap) {
            this.showNotification(`الحد الأقصى المتاح: ${cap}`, 'info');
            return;
        }
        this.quantity++;
        document.getElementById('quantityValue').textContent = this.quantity;
    }

    decreaseQuantity() {
        if (this.quantity > 1) {
            this.quantity--;
            document.getElementById('quantityValue').textContent = this.quantity;
        }
    }

    buyNow(productId) {
        this.addToCart(productId, true);
        this.navigate('checkout');
    }

    // ==================== Filtering & Search ====================
    filterByCategory(cat) {
        this.currentCategory = cat;
        this.renderHome();
        setTimeout(() => document.getElementById('productsSection')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }

    searchProducts(q) {
        this.searchQuery = q.toLowerCase();
        this.renderHome();
    }

    getFilteredProducts() {
        return this.products.filter(p => {
            const matchCat = this.currentCategory === 'all' || p.category === this.currentCategory;
            const matchQ = p.name.toLowerCase().includes(this.searchQuery) || p.description.toLowerCase().includes(this.searchQuery);
            return matchCat && matchQ;
        });
    }

    // ==================== Checkout & WhatsApp ====================
    selectPaymentMethod(el) {
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
        el.classList.add('active');
        el.querySelector('input').checked = true;
    }

    submitOrder(e) {
        e.preventDefault();

        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const gov = document.getElementById('governorate').value;
        const addr = document.getElementById('address').value.trim();
        const notes = document.getElementById('notes').value.trim();
        const pay = document.querySelector('input[name="payment"]:checked').value;
        const total = this.calculateTotal();

        const payload = {
            name,
            phone,
            governorate: gov,
            address: addr,
            notes,
            payment: pay,
            items: this.cart.map((i) => ({
                name: i.name,
                color: '',
                quantity: i.quantity,
                price: Number(i.price),
            })),
            total: Number(total),
        };

        void (async () => {
            try {
                await TopWatchAPI.postOrder(payload);
                SoundManager.playSuccess();
                this.showNotification(
                    '✅ تم تسجيل طلبك في قاعدة البيانات. سنتواصل معك قريباً.',
                    'success'
                );
                setTimeout(() => {
                    this.cart = [];
                    this.saveCart();
                    this.closeCart();
                    this.updateCartUI();
                    this.navigate('home');
                }, 1600);
            } catch (err) {
                console.warn(err);
                this.showNotification(
                    'لم يتم حفظ الطلب: تأكد من تشغيل الخادم (`npm start`) والاتصال بالإنترنت ثم حاول مرة أخرى.',
                    'error'
                );
            }
        })();
    }

    // ==================== Utilities ====================
    showNotification(msg, type = 'info') {
        const bg =
            type === 'success'
                ? '#25D366'
                : type === 'error'
                  ? '#ef4444'
                  : type === 'info'
                    ? '#3b82f6'
                    : '#D4AF37';
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;top:100px;left:50%;transform:translateX(-50%);max-width:92%;text-align:center;background:${bg};color:white;padding:15px 30px;border-radius:5px;box-shadow:0 5px 20px rgba(0,0,0,0.2);z-index:9999;animation:slideDown 0.3s ease;font-weight:600;`;
        el.textContent = msg;
        document.body.appendChild(el);
        setTimeout(() => { el.style.animation = 'slideUp 0.3s ease'; setTimeout(() => el.remove(), 300); }, 3000);
    }

    toggleMobileMenu() {
        document.getElementById('mobileMenu').classList.toggle('active');
    }

    setupEventListeners() {
        window.addEventListener('scroll', () => {
            document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
        });
        window.addEventListener('popstate', e => {
            if (e.state) this.navigate(e.state.page, e.state.params);
        });
    }

    setupLazyLoading() {
        const imgs = document.querySelectorAll('img[data-src]');
        const obs = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) {
                    en.target.src = en.target.dataset.src;
                    en.target.classList.add('loaded');
                    obs.unobserve(en.target);
                }
            });
        });
        imgs.forEach(img => obs.observe(img));
    }
}

// ==================== Initialize App ====================
const app = new TOPWatchApp();

// ==================== Global Sound Toggle ====================
function toggleSound() {
    const on = SoundManager.toggle();
    document.getElementById('soundIcon').className = on ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    document.getElementById('soundToggleBtn').classList.toggle('muted', !on);
    localStorage.setItem('topwatch_sound', on ? 'on' : 'off');
    if (on) SoundManager.playClick();
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('topwatch_sound') === 'off') {
        SoundManager.enabled = false;
        document.getElementById('soundIcon').className = 'fas fa-volume-mute';
        document.getElementById('soundToggleBtn').classList.add('muted');
    }
});