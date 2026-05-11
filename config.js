/**
 * TOP Watch — shared config (+ API helper for storefront & admin).
 * Node scripts (e.g. seed) use module.exports when present.
 */

const CONFIG = {
    api: {
        /** Empty string = same origin (use `npm start` on port 3000). Set full URL only if frontend is elsewhere. */
        baseUrl: '',
        /**
         * If you open index.html as file:///..., fetch('/api...') breaks. APIs are sent here when baseUrl is empty.
         * Must match the URL shown when you run: npm start
         */
        fileProtocolApiOrigin: 'http://127.0.0.1:3000',
    },

    store: {
        name: 'TOP Watch',
        logo: 'images/logo1.png',
        whatsappNumber: '201101526995',
        /** رقم فودافون كاش لعرضه في الدفع وإرسال الحوالات إليه */
        vodafoneCashNumber: '01032898134',
        currency: 'ج.م',
        currencySymbol: 'ج.م',
    },

    colors: {
        primary: '#D4AF37',
        secondary: '#1a1a1a',
        accent: '#ffffff',
        text: '#333333',
        textLight: '#666666',
        background: '#f5f5f5',
        gold: '#D4AF37',
        darkGold: '#B8941F',
    },

    products: [
        {
            id: 1,
            name: 'Rolex Datejust — Tiffany Blue & Gold',
            category: 'men-classic',
            price: 620,
            oldPrice: 820,
            image: 'images/Rolex-Datejust-dial-Tiffany-Blue-gold.jpg',
            images: ['images/Rolex-Datejust-dial-Tiffany-Blue-gold.jpg'],
            description:
                'رولكس ديت جست بميناء تيفاني أزرق وتفاصيل ذهبية، سوار جوبيليه.',
            colors: [],
            inStock: true,
            stockQuantity: 8,
        },
        {
            id: 2,
            name: 'Rolex Datejust — Tiffany Blue',
            category: 'men-classic',
            price: 580,
            oldPrice: 780,
            image: 'images/Rolex-Datejust-dial-Tiffany-Blue.jpg',
            images: [
                'images/Rolex-Datejust-dial-Tiffany-Blue.jpg',
                'images/Rolex-Datejust-Tiffany-Blue.png',
            ],
            description: 'رولكس ديت جست بميناء تيفاني أزرق وأرقام عربية شرقية.',
            colors: [],
            inStock: true,
            stockQuantity: 10,
        },
        {
            id: 3,
            name: 'Rolex Datejust — Black Dial',
            category: 'men-classic',
            price: 560,
            oldPrice: 760,
            image: 'images/Rolex-Datejust-dial-black.png',
            images: [
                'images/Rolex-Datejust-dial-black.png',
                'images/Rolex-Datejust-Black-Dial.png',
            ],
            description: 'رولكس ديت جست بميناء أسود وإطار مخرّط وسوار جوبيليه.',
            colors: [],
            inStock: true,
            stockQuantity: 12,
        },
        {
            id: 4,
            name: 'Rolex Datejust — Silver Dial',
            category: 'men-classic',
            price: 540,
            oldPrice: 740,
            image: 'images/Rolex-Datejust-dial-white.jpg',
            images: [
                'images/Rolex-Datejust-dial-white.jpg',
                'images/Rolex-Datejust-White-Dial.png',
            ],
            description: 'رولكس ديت جست بميناء فضي وأرقام عربية شرقية.',
            colors: [],
            inStock: true,
            stockQuantity: 9,
        },
        {
            id: 5,
            name: 'Patek Philippe Nautilus — White Dial',
            category: 'men-classic',
            price: 520,
            oldPrice: 720,
            image: 'images/Patek-Nautilus-White-Dial.png',
            images: [
                'images/Patek-Nautilus-White-Dial.png',
                'images/Patek-Philippe-Nautilus-metal-Dial-white.jpg',
            ],
            description: 'باتيك فيليب نوتيلوس ميناء أبيض وسوار معدني متكامل.',
            colors: [],
            inStock: true,
            stockQuantity: 6,
        },
        {
            id: 6,
            name: 'Patek Philippe Nautilus — Navy Dial',
            category: 'men-classic',
            price: 530,
            oldPrice: 730,
            image: 'images/Patek-Nautilus-Navy-Dial.png',
            images: [
                'images/Patek-Nautilus-Navy-Dial.png',
                'images/Patek-Philippe-Nautilus-metal-Dial-navy-blow.jpg',
            ],
            description: 'باتيك فيليب نوتيلوس بميناء أزرق بحري وخطوط أفقية.',
            colors: [],
            inStock: true,
            stockQuantity: 6,
        },
        {
            id: 7,
            name: 'Patek Philippe Nautilus — Black Dial',
            category: 'men-classic',
            price: 510,
            oldPrice: 710,
            image: 'images/Patek-Nautilus-Black-Dial.png',
            images: [
                'images/Patek-Nautilus-Black-Dial.png',
                'images/Patek-Philippe-Nautilus-metal-Dial-black.jpg',
            ],
            description: 'باتيك فيليب نوتيلوس بميناء أسود وسوار معدني.',
            colors: [],
            inStock: true,
            stockQuantity: 7,
        },
        {
            id: 8,
            name: 'Patek Philippe Nautilus — Leather',
            category: 'men-classic',
            price: 495,
            oldPrice: 695,
            image: 'images/Patek-Nautilus-Leather.png',
            images: [
                'images/Patek-Nautilus-Leather.png',
                'images/Patek-Philippe-Nautilus-leather.jpg',
            ],
            description: 'باتيك فيليب نوتيلوس بسوار جلد تمساح أسود.',
            colors: [],
            inStock: true,
            stockQuantity: 5,
        },
        {
            id: 9,
            name: 'Cartier Santos — Black Dial',
            category: 'men-casual',
            price: 460,
            oldPrice: 660,
            image: 'images/Cartier-Santos-Black-Dial.png',
            images: [
                'images/Cartier-Santos-Black-Dial.png',
                'images/carter-Santos-Black-Dial.jpg',
            ],
            description: 'كارتييه سانتوس بميناء أسود وأرقام رومانية وسوار معدني.',
            colors: [],
            inStock: true,
            stockQuantity: 11,
        },
        {
            id: 10,
            name: 'Cartier Santos — White Dial',
            category: 'men-casual',
            price: 455,
            oldPrice: 655,
            image: 'images/Cartier-Santos-White-Dial.png',
            images: [
                'images/Cartier-Santos-White-Dial.png',
                'images/carter-Santos-white-Dial.jpg',
            ],
            description: 'كارتييه سانتوس بميناء أبيض وعقربان أزرق معدني.',
            colors: [],
            inStock: true,
            stockQuantity: 11,
        },
        {
            id: 11,
            name: 'Cartier Santos — Blue Dial',
            category: 'men-casual',
            price: 470,
            oldPrice: 670,
            image: 'images/Cartier-Santos-Blue-Dial.png',
            images: [
                'images/Cartier-Santos-Blue-Dial.png',
                'images/carter-Santos-blow-Dial.jpg',
            ],
            description: 'كارتييه سانتوس بميناء أزرق لامع وتأريخ عند الساعة 6.',
            colors: [],
            inStock: true,
            stockQuantity: 10,
        },
        {
            id: 12,
            name: 'Cartier Tank — Brown Leather',
            category: 'women',
            price: 380,
            oldPrice: 560,
            image: 'images/Cartier-Tank-Brown-Leather.png',
            images: [
                'images/Cartier-Tank-Brown-Leather.png',
                'images/carter-tank-leather-brown.jpg',
            ],
            description: 'كارتييه تانك مستطيلة بميناء فضي وسوار جلد بني تمساح.',
            colors: [],
            inStock: true,
            stockQuantity: 14,
        },
        {
            id: 13,
            name: 'Cartier Tank — Black Leather',
            category: 'women',
            price: 375,
            oldPrice: 555,
            image: 'images/Cartier-Tank-Black-Leather.png',
            images: [
                'images/Cartier-Tank-Black-Leather.png',
                'images/carter-tank-black-leather.jpg',
            ],
            description: 'كارتييه تانك بميناء فاتح وسوار جلد أسود ناعم.',
            colors: [],
            inStock: true,
            stockQuantity: 13,
        },
    ],

    settings: {
        itemsPerPage: 5,
        animationDuration: 300,
        lazyLoadThreshold: 100,
    },
};

const TopWatchAPI = {
    apiRoot() {
        const b =
            typeof CONFIG.api?.baseUrl === 'string'
                ? CONFIG.api.baseUrl
                : '';
        return b.replace(/\/+$/, '');
    },

    /** Origin used for REST calls (handles opening the shop as file:///). */
    requestBaseOrigin() {
        const custom = this.apiRoot();
        if (custom) return custom;
        if (
            typeof window !== 'undefined' &&
            window.location.protocol === 'file:'
        ) {
            const o = CONFIG.api?.fileProtocolApiOrigin;
            return o ? String(o).trim().replace(/\/+$/, '') : '';
        }
        if (typeof window !== 'undefined' && window.location.origin)
            return window.location.origin.replace(/\/+$/, '');
        return '';
    },

    isFileProtocol() {
        return (
            typeof window !== 'undefined' &&
            window.location.protocol === 'file:'
        );
    },

    /** URL for logos / catalog images — works under http(s) and file:/// */
    resolveShopAsset(u) {
        if (typeof window === 'undefined')
            return typeof u === 'string' ? u : '';
        if (!u || typeof u !== 'string') return '';
        const t = u.trim();
        if (!t) return '';
        if (/^(https?:|data:|blob:)/i.test(t)) return t;

        let rel = t.replace(/^\.\//, '');
        if (rel.startsWith('/')) rel = rel.slice(1);

        if (window.location.protocol === 'file:') {
            try {
                return new URL(rel, window.location.href).href;
            } catch {
                return rel;
            }
        }

        const path = t.startsWith('/') ? t : `/${t}`;
        const base = this.apiRoot();
        if (base) return `${base}${path}`;
        return `${window.location.origin}${path}`;
    },

    /**
     * Admin session: Bearer token from POST /api/auth/admin-login (password only).
     * Optional legacy: x-admin-key if ADMIN_API_KEY is set and stored manually.
     */
    adminHeaders() {
        const h = { Accept: 'application/json' };
        if (typeof sessionStorage === 'undefined') return h;
        const token = sessionStorage.getItem('topwatch_admin_token');
        if (token && token.trim())
            h.Authorization = `Bearer ${token.trim()}`;
        const legacyKey = sessionStorage.getItem('topwatch_admin_key');
        if (legacyKey && legacyKey.trim())
            h['x-admin-key'] = legacyKey.trim();
        return h;
    },

    async request(
        method,
        relativePath,
        { json, admin, timeoutMs = 25000 } = {}
    ) {
        const base = this.requestBaseOrigin();
        const pathSeg = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
        const url = `${base}${pathSeg}`;
        const opts = {
            method,
            headers: {},
        };
        if (
            timeoutMs > 0 &&
            typeof AbortSignal !== 'undefined' &&
            typeof AbortSignal.timeout === 'function'
        ) {
            opts.signal = AbortSignal.timeout(timeoutMs);
        }
        const headers = admin ? this.adminHeaders() : { Accept: 'application/json' };
        opts.headers = { ...opts.headers, ...headers };
        if (json !== undefined) {
            opts.headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(json);
        }
        const res = await fetch(url, opts);
        const raw = await res.text();
        if (!res.ok) {
            let msg = res.statusText;
            try {
                const parsed = JSON.parse(raw);
                if (parsed.error) msg = parsed.error;
            } catch {
                if (raw) msg = raw;
            }
            throw new Error(msg || `HTTP ${res.status}`);
        }
        if (res.status === 204) return null;
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json'))
            try {
                return JSON.parse(raw);
            } catch {
                return raw;
            }
        return raw;
    },

    async getProducts() {
        return this.request('GET', '/api/products', { timeoutMs: 12000 });
    },

    async postOrder(payload) {
        return this.request('POST', '/api/orders', { json: payload });
    },

    async getOrders() {
        return this.request('GET', '/api/orders', { admin: true });
    },

    /** Partial update (status, customer fields, payment). */
    async patchOrder(id, payload) {
        return this.request('PATCH', `/api/orders/${encodeURIComponent(id)}`, {
            json: payload,
            admin: true,
        });
    },

    async patchOrderStatus(id, status) {
        return this.patchOrder(id, { status });
    },

    async deleteOrder(id) {
        return this.request('DELETE', `/api/orders/${encodeURIComponent(id)}`, { admin: true });
    },

    async postProduct(payload) {
        return this.request('POST', '/api/products', { json: payload, admin: true });
    },

    async putProduct(id, payload) {
        return this.request('PUT', `/api/products/${encodeURIComponent(id)}`, {
            json: payload,
            admin: true,
        });
    },

    async deleteProduct(id) {
        return this.request(
            'DELETE',
            `/api/products/${encodeURIComponent(id)}`,
            { admin: true }
        );
    },

    async adminLogin(payload) {
        return this.request('POST', '/api/auth/admin-login', {
            json: {
                password: payload.password,
            },
        });
    },
};

(function applySavedStoreSettings() {
    try {
        if (typeof localStorage === 'undefined') return;
        const wa = localStorage.getItem('topwatch_wa');
        if (wa) CONFIG.store.whatsappNumber = wa;
        const apiBase = localStorage.getItem('topwatch_api_base');
        if (apiBase !== null && String(apiBase).trim() !== '')
            CONFIG.api.baseUrl = String(apiBase).trim();
    } catch (_) {
        /* ignore */
    }
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
