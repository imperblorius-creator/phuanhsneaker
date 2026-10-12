import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_COUPONS, INITIAL_STORE_SETTINGS } from './src/data/initialProducts';
import { Product, Order, User, InventoryMovement, Coupon, Banner, StoreSettings, CartItem } from './src/types';

const app = express();
const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple password hashing helper
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_phuanh_salt_2026').digest('hex');
}

// In-Memory & File-based DB Schema
interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  products: Product[];
  orders: Order[];
  inventoryMovements: InventoryMovement[];
  coupons: Coupon[];
  banners: Banner[];
  settings: StoreSettings;
}

let db: DatabaseSchema = {
  users: [],
  products: [],
  orders: [],
  inventoryMovements: [],
  coupons: [],
  banners: [],
  settings: INITIAL_STORE_SETTINGS,
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveDb() {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store.json:', err);
  }
}

function initDb() {
  ensureDataDir();
  if (fs.existsSync(STORE_FILE)) {
    try {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      db = JSON.parse(content);
      // Ensure products are present
      if (!db.products || db.products.length === 0) {
        db.products = [...INITIAL_PRODUCTS];
      }
      return;
    } catch (e) {
      console.warn('Could not parse existing store.json, re-seeding...', e);
    }
  }

  // Seed default admin and initial customer
  const adminUser: User & { passwordHash: string } = {
    id: 'user_admin_phuanh',
    email: 'admin@phuanhsneaker.local',
    name: 'Admin PhuAnh Sneaker',
    role: 'ADMIN',
    phone: '0397233999',
    address: 'Số 123 Đường Sneaker, Quận 1',
    city: 'TP. Hồ Chí Minh',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    passwordHash: hashPassword('Admin@123456'),
  };

  const sampleCustomer: User & { passwordHash: string } = {
    id: 'user_customer_demo',
    email: 'customer@gmail.com',
    name: 'Nguyễn Văn An',
    role: 'CUSTOMER',
    phone: '0901234567',
    address: '45/12 Lê Lợi, Phường Bến Nghé, Quận 1',
    city: 'TP. Hồ Chí Minh',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    passwordHash: hashPassword('Customer@123'),
  };

  db = {
    users: [adminUser, sampleCustomer],
    products: [...INITIAL_PRODUCTS],
    orders: [
      {
        id: 'PA-918231',
        userId: 'user_customer_demo',
        customer: {
          fullName: 'Nguyễn Văn An',
          phone: '0901234567',
          address: '45/12 Lê Lợi, Phường Bến Nghé, Quận 1',
          city: 'TP. Hồ Chí Minh',
          notes: 'Giao giờ hành chính',
        },
        items: [
          {
            id: 81265049,
            alias: 'cortez-1985-do',
            name: 'cortez 1985 đỏ',
            category: 'NIKE',
            image: 'https://bizweb.dktcdn.net/100/623/516/products/z7856406356461-6c8cd4a5ccaa0f3ca927642af1d7f33b-1779514525734.jpg?v=1779514528587',
            price: '460.000₫',
            priceValue: 460000,
            size: '39',
            sizeSku: 'PVN671',
            quantity: 1,
          },
          {
            id: 81264227,
            alias: 'nb530-xam',
            name: 'nb530 xám',
            category: 'NB',
            image: 'https://bizweb.dktcdn.net/100/623/516/products/z7856406367011-af50479d06d15462c2d6306540261c9e-1779512129393.jpg?v=1779512133703',
            price: '450.000₫',
            priceValue: 450000,
            size: '38',
            sizeSku: 'PVN662',
            quantity: 1,
          },
        ],
        payment: 'cod',
        paymentStatus: 'paid',
        status: 'completed',
        subtotal: 910000,
        discount: 50000,
        couponCode: 'PHUANH50',
        shipping: 0,
        total: 860000,
        trackingCode: 'VNP9812401',
        shippingCarrier: 'Giao Hàng Tiết Kiệm',
        internalNotes: 'Khách nhận và thanh toán tốt',
        statusHistory: [
          { status: 'pending', updatedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
          { status: 'confirmed', updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(), note: 'Đã gọi xác nhận' },
          { status: 'shipping', updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(), note: 'Đã giao cho ĐVVC' },
          { status: 'completed', updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(), note: 'Khách nhận hàng thành công' },
        ],
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'PA-924510',
        userId: 'user_customer_demo',
        customer: {
          fullName: 'Trần Thị Mai',
          phone: '0987654321',
          address: '12 Nguyễn Trãi, Thanh Xuân',
          city: 'Hà Nội',
        },
        items: [
          {
            id: 80637520,
            alias: 'bb-tiger-ren-den',
            name: 'bb tiger ren đen',
            category: 'TIGER',
            image: 'https://bizweb.dktcdn.net/100/623/516/products/z7827929823228-999219d645544a1582fb585d58f8f9ae-1778824649033.jpg?v=1778824652263',
            price: '480.000₫',
            priceValue: 480000,
            size: '36',
            sizeSku: 'PVN634',
            quantity: 1,
          },
        ],
        payment: 'transfer',
        paymentStatus: 'paid',
        status: 'shipping',
        subtotal: 480000,
        discount: 0,
        shipping: 30000,
        total: 510000,
        trackingCode: 'GHN-882190',
        shippingCarrier: 'Giao Hàng Nhanh',
        statusHistory: [
          { status: 'pending', updatedAt: new Date(Date.now() - 24 * 3600000).toISOString() },
          { status: 'confirmed', updatedAt: new Date(Date.now() - 18 * 3600000).toISOString(), note: 'Đã nhận chuyển khoản' },
          { status: 'shipping', updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(), note: 'Đang vận chuyển' },
        ],
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
    ],
    inventoryMovements: [
      {
        id: 'mv-init-1',
        productId: 81265049,
        productName: 'cortez 1985 đỏ',
        productAlias: 'cortez-1985-do',
        size: '39',
        sku: 'PVN671',
        type: 'sale',
        quantityDelta: -1,
        previousQuantity: 8,
        newQuantity: 7,
        reason: 'Khách đặt đơn PA-918231',
        orderId: 'PA-918231',
        performedBy: 'Hệ thống tự động',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'mv-init-2',
        productId: 80637520,
        productName: 'bb tiger ren đen',
        productAlias: 'bb-tiger-ren-den',
        size: '36',
        sku: 'PVN634',
        type: 'sale',
        quantityDelta: -1,
        previousQuantity: 5,
        newQuantity: 4,
        reason: 'Khách đặt đơn PA-924510',
        orderId: 'PA-924510',
        performedBy: 'Hệ thống tự động',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
    ],
    coupons: [...INITIAL_COUPONS],
    banners: [...INITIAL_BANNERS],
    settings: { ...INITIAL_STORE_SETTINGS },
  };

  saveDb();
}

initDb();

// Simple Auth Helper
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // Token is base64 encoded userId:hash
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    const user = db.users.find((u) => u.id === userId);
    return user ? { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, address: user.address, city: user.city, createdAt: user.createdAt, isBlocked: user.isBlocked, notes: user.notes } : null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// API: AUTHENTICATION
// -------------------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, phone, address, city } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: { message: 'Vui lòng cung cấp họ tên, email và mật khẩu' } });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: { message: 'Email này đã được sử dụng' } });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: { message: 'Mật khẩu phải từ 6 ký tự trở lên' } });
  }

  const newUser: User & { passwordHash: string } = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: normalizedEmail,
    name: String(name).trim(),
    role: 'CUSTOMER', // Regular registration is ALWAYS CUSTOMER
    phone: phone ? String(phone).trim() : '',
    address: address ? String(address).trim() : '',
    city: city ? String(city).trim() : 'TP. Hồ Chí Minh',
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  };

  db.users.push(newUser);
  saveDb();

  const token = Buffer.from(`${newUser.id}:${newUser.passwordHash}`).toString('base64');
  const { passwordHash: _, ...userSafe } = newUser;

  res.status(201).json({ user: userSafe, token });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: { message: 'Vui lòng nhập email và mật khẩu' } });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: { message: 'Email hoặc mật khẩu không chính xác' } });
  }

  if (user.isBlocked) {
    return res.status(403).json({ error: { message: 'Tài khoản này đã bị khóa. Vui lòng liên hệ hotline PhuAnh Sneaker.' } });
  }

  const token = Buffer.from(`${user.id}:${user.passwordHash}`).toString('base64');
  const { passwordHash: _, ...userSafe } = user;

  res.json({ user: userSafe, token });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: { message: 'Chưa đăng nhập' } });
  }
  res.json({ user });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: { message: 'Chưa đăng nhập' } });
  }

  const target = db.users.find((u) => u.id === authUser.id);
  if (!target) return res.status(404).json({ error: { message: 'Không tìm thấy người dùng' } });

  const { name, phone, address, city } = req.body;
  if (name) target.name = String(name).trim();
  if (phone !== undefined) target.phone = String(phone).trim();
  if (address !== undefined) target.address = String(address).trim();
  if (city !== undefined) target.city = String(city).trim();

  saveDb();
  const { passwordHash: _, ...userSafe } = target;
  res.json({ user: userSafe });
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Đã đăng xuất' });
});

// -------------------------------------------------------------
// API: PRODUCTS
// -------------------------------------------------------------
app.get('/api/products', (req: Request, res: Response) => {
  const { category, q, minPrice, maxPrice, size, sort, inStock } = req.query;

  let filtered = [...db.products];

  // Category filter
  if (category && String(category).toUpperCase() !== 'ALL') {
    filtered = filtered.filter((p) => p.category.toUpperCase() === String(category).toUpperCase());
  }

  // Search filter
  if (q && String(q).trim()) {
    const query = String(q).trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  // Price range
  if (minPrice) {
    filtered = filtered.filter((p) => p.priceValue >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter((p) => p.priceValue <= Number(maxPrice));
  }

  // Size filter
  if (size) {
    const sizeStr = String(size);
    filtered = filtered.filter((p) =>
      p.sizes && p.sizes.some((s) => s.label === sizeStr && s.available && s.quantity > 0)
    );
  }

  // In Stock filter
  if (inStock === 'true') {
    filtered = filtered.filter((p) => p.available);
  }

  // Sort
  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.priceValue - b.priceValue);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.priceValue - a.priceValue);
  } else if (sort === 'name_asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    // Default: Newest first
    filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  res.json({
    total: filtered.length,
    allCount: db.products.length,
    products: filtered,
  });
});

app.get('/api/products/:identifier', (req: Request, res: Response) => {
  const { identifier } = req.params;
  const product = db.products.find(
    (p) => p.alias === identifier || String(p.id) === identifier || p.sku === identifier
  );

  if (!product) {
    return res.status(404).json({ error: { message: 'Không tìm thấy sản phẩm' } });
  }

  // Related products from same category
  const related = db.products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  res.json({ product, related });
});

// Admin product mutation
app.post('/api/products', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền thêm sản phẩm' } });
  }

  const { name, category, priceValue, compareAtValue, image, images, sku, sizes, description } = req.body;
  if (!name || !category || !priceValue || !sku) {
    return res.status(400).json({ error: { message: 'Vui lòng điền đầy đủ tên, danh mục, giá và mã SKU' } });
  }

  const alias = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const newId = Date.now();
  const productSizes = sizes && Array.isArray(sizes) && sizes.length > 0 ? sizes : [
    { label: '36', available: true, quantity: 5, sku: `${sku}-36` },
    { label: '37', available: true, quantity: 5, sku: `${sku}-37` },
    { label: '38', available: true, quantity: 5, sku: `${sku}-38` },
    { label: '39', available: true, quantity: 5, sku: `${sku}-39` },
    { label: '40', available: true, quantity: 5, sku: `${sku}-40` },
  ];

  const totalStock = productSizes.reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0);

  const newProduct: Product = {
    id: newId,
    alias: `${alias}-${newId.toString().slice(-4)}`,
    name: String(name).trim(),
    category: String(category).trim().toUpperCase(),
    price: `${Number(priceValue).toLocaleString('vi-VN')}₫`,
    priceValue: Number(priceValue),
    compareAt: compareAtValue ? `${Number(compareAtValue).toLocaleString('vi-VN')}₫` : '',
    compareAtValue: compareAtValue ? Number(compareAtValue) : 0,
    image: image || 'https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737',
    images: images && images.length ? images : [image || 'https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737'],
    available: totalStock > 0,
    sku: String(sku).trim().toUpperCase(),
    sizes: productSizes,
    description: description || `Mẫu sneaker ${name} chính hãng tại PhuAnh Sneaker.`,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);

  // Log initial inventory
  productSizes.forEach((s: any) => {
    if (s.quantity > 0) {
      db.inventoryMovements.unshift({
        id: `mv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: newProduct.id,
        productName: newProduct.name,
        productAlias: newProduct.alias,
        size: s.label,
        sku: s.sku || `${newProduct.sku}-${s.label}`,
        type: 'import',
        quantityDelta: Number(s.quantity),
        previousQuantity: 0,
        newQuantity: Number(s.quantity),
        reason: 'Nhập kho sản phẩm mới khởi tạo',
        performedBy: user.name,
        createdAt: new Date().toISOString(),
      });
    }
  });

  saveDb();
  res.status(201).json({ product: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền cập nhật sản phẩm' } });
  }

  const { id } = req.params;
  const product = db.products.find((p) => String(p.id) === id || p.alias === id);
  if (!product) return res.status(404).json({ error: { message: 'Không tìm thấy sản phẩm' } });

  const { name, category, priceValue, compareAtValue, image, images, sku, sizes, description, available } = req.body;

  if (name) product.name = String(name).trim();
  if (category) product.category = String(category).trim().toUpperCase();
  if (priceValue !== undefined) {
    product.priceValue = Number(priceValue);
    product.price = `${Number(priceValue).toLocaleString('vi-VN')}₫`;
  }
  if (compareAtValue !== undefined) {
    product.compareAtValue = Number(compareAtValue);
    product.compareAt = compareAtValue ? `${Number(compareAtValue).toLocaleString('vi-VN')}₫` : '';
  }
  if (image) product.image = image;
  if (images) product.images = images;
  if (sku) product.sku = String(sku).trim().toUpperCase();
  if (description !== undefined) product.description = description;

  if (sizes && Array.isArray(sizes)) {
    // Record inventory change diffs
    sizes.forEach((newSize: any) => {
      const oldSize = product.sizes.find((s) => s.label === newSize.label);
      const oldQty = oldSize ? oldSize.quantity : 0;
      const newQty = Number(newSize.quantity) || 0;
      if (newQty !== oldQty) {
        db.inventoryMovements.unshift({
          id: `mv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId: product.id,
          productName: product.name,
          productAlias: product.alias,
          size: newSize.label,
          sku: newSize.sku || `${product.sku}-${newSize.label}`,
          type: newQty > oldQty ? 'import' : 'adjustment',
          quantityDelta: newQty - oldQty,
          previousQuantity: oldQty,
          newQuantity: newQty,
          reason: `Quản trị viên cập nhật kho biến thể size ${newSize.label}`,
          performedBy: user.name,
          createdAt: new Date().toISOString(),
        });
      }
    });

    product.sizes = sizes;
  }

  // Recalculate available status
  const totalStock = product.sizes.reduce((sum, s) => sum + (s.quantity || 0), 0);
  product.available = available !== undefined ? Boolean(available) : totalStock > 0;

  saveDb();
  res.json({ product });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền xóa sản phẩm' } });
  }

  const { id } = req.params;
  const index = db.products.findIndex((p) => String(p.id) === id || p.alias === id);
  if (index === -1) return res.status(404).json({ error: { message: 'Không tìm thấy sản phẩm' } });

  const product = db.products[index];

  // Check if product exists in active orders
  const activeOrders = db.orders.filter(
    (o) =>
      o.status !== 'completed' &&
      o.status !== 'cancelled' &&
      o.items.some((i) => i.id === product.id)
  );

  if (activeOrders.length > 0) {
    return res.status(400).json({
      error: {
        message: `Sản phẩm này đang có trong ${activeOrders.length} đơn hàng chưa hoàn tất. Vui lòng ẩn sản phẩm thay vì xóa.`,
      },
    });
  }

  db.products.splice(index, 1);
  saveDb();
  res.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
});

// -------------------------------------------------------------
// API: ORDERS & CHECKOUT (CRITICAL LOGIC)
// -------------------------------------------------------------
app.get('/api/orders', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { status, search, limit } = req.query;

  let orders = [...db.orders];

  if (!user || user.role !== 'ADMIN') {
    // Regular customer can ONLY view their own orders
    if (!user) {
      return res.status(401).json({ error: { message: 'Vui lòng đăng nhập để xem đơn hàng' } });
    }
    orders = orders.filter((o) => o.userId === user.id);
  } else {
    // Admin filter
    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status === status);
    }
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
      );
    }
  }

  // Newest first
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (limit) {
    orders = orders.slice(0, Number(limit));
  }

  res.json({ total: orders.length, orders });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id);

  if (!order) return res.status(404).json({ error: { message: 'Không tìm thấy đơn hàng' } });

  if (!user || (user.role !== 'ADMIN' && order.userId !== user.id)) {
    return res.status(403).json({ error: { message: 'Bạn không có quyền xem đơn hàng này' } });
  }

  res.json({ order });
});

// Create Order with Atomic Stock Decrement & Price Recalculation
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, payment, couponCode } = req.body;

  // Validation
  if (!customer || !customer.fullName || !customer.phone || !customer.address) {
    return res.status(400).json({ error: { message: 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng' } });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: { message: 'Giỏ hàng đang trống' } });
  }

  const validPayments = ['cod', 'transfer', 'card'];
  if (!payment || !validPayments.includes(payment)) {
    return res.status(400).json({ error: { message: 'Phương thức thanh toán không hợp lệ' } });
  }

  // Verify stock & re-verify prices on backend
  let serverSubtotal = 0;
  const verifiedItems: CartItem[] = [];

  for (const item of items) {
    const product = db.products.find((p) => p.id === item.id || p.alias === item.alias);
    if (!product) {
      return res.status(400).json({ error: { message: `Sản phẩm ${item.name} không tồn tại` } });
    }

    const sizeVariant = product.sizes.find((s) => s.label === item.size);
    if (!sizeVariant) {
      return res.status(400).json({ error: { message: `Size ${item.size} của ${product.name} không tồn tại` } });
    }

    const requestedQty = Number(item.quantity) || 1;
    if (requestedQty <= 0) {
      return res.status(400).json({ error: { message: `Số lượng mua cho ${product.name} không hợp lệ` } });
    }

    if (sizeVariant.quantity < requestedQty) {
      return res.status(400).json({
        error: {
          message: `Rất tiếc! Mẫu ${product.name} size ${item.size} hiện chỉ còn ${sizeVariant.quantity} sản phẩm trong kho.`,
        },
      });
    }

    serverSubtotal += product.priceValue * requestedQty;
    verifiedItems.push({
      id: product.id,
      alias: product.alias,
      name: product.name,
      category: product.category,
      image: product.image,
      price: product.price,
      priceValue: product.priceValue,
      size: item.size,
      sizeSku: sizeVariant.sku || `${product.sku}-${item.size}`,
      quantity: requestedQty,
    });
  }

  // Calculate Discount from Coupon
  let discountAmount = 0;
  let appliedCoupon: Coupon | undefined;

  if (couponCode) {
    const cleanCode = String(couponCode).trim().toUpperCase();
    const coupon = db.coupons.find((c) => c.code === cleanCode && c.isActive);
    if (coupon) {
      if (!coupon.minSpend || serverSubtotal >= coupon.minSpend) {
        if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
          appliedCoupon = coupon;
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((serverSubtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
          coupon.usageCount += 1;
        }
      }
    }
  }

  // Calculate Shipping
  const shippingFee = serverSubtotal >= db.settings.freeShippingThreshold ? 0 : db.settings.shippingFee;
  const finalTotal = Math.max(0, serverSubtotal - discountAmount + shippingFee);

  // Generate Unique Order ID (e.g. PA-394821)
  const uniqueNum = Math.floor(100000 + Math.random() * 900000);
  const orderId = `PA-${uniqueNum}`;

  const authUser = getAuthUser(req);
  const now = new Date().toISOString();

  // ATOMIC INVENTORY DECREMENT
  for (const item of verifiedItems) {
    const product = db.products.find((p) => p.id === item.id)!;
    const sizeVariant = product.sizes.find((s) => s.label === item.size)!;
    const prev = sizeVariant.quantity;
    sizeVariant.quantity -= item.quantity;
    sizeVariant.available = sizeVariant.quantity > 0;

    // Log movement
    db.inventoryMovements.unshift({
      id: `mv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      productAlias: product.alias,
      size: item.size,
      sku: sizeVariant.sku,
      type: 'sale',
      quantityDelta: -item.quantity,
      previousQuantity: prev,
      newQuantity: sizeVariant.quantity,
      reason: `Đơn hàng mới ${orderId}`,
      orderId,
      performedBy: authUser ? authUser.name : `Khách vãng lai: ${customer.fullName}`,
      createdAt: now,
    });

    // Check if entire product is available
    product.available = product.sizes.some((s) => s.quantity > 0);
  }

  const newOrder: Order = {
    id: orderId,
    userId: authUser ? authUser.id : undefined,
    customer: {
      fullName: String(customer.fullName).trim(),
      phone: String(customer.phone).trim(),
      address: String(customer.address).trim(),
      city: String(customer.city || 'TP. Hồ Chí Minh').trim(),
      notes: customer.notes ? String(customer.notes).trim() : '',
    },
    items: verifiedItems,
    payment,
    paymentStatus: payment === 'transfer' ? 'pending' : payment === 'card' ? 'paid' : 'pending',
    status: 'pending',
    subtotal: serverSubtotal,
    discount: discountAmount,
    couponCode: appliedCoupon ? appliedCoupon.code : undefined,
    shipping: shippingFee,
    total: finalTotal,
    statusHistory: [{ status: 'pending', updatedAt: now, note: 'Khách hàng hoàn tất tạo đơn' }],
    inventoryRestored: false,
    createdAt: now,
    updatedAt: now,
  };

  db.orders.unshift(newOrder);
  saveDb();

  res.status(201).json({ order: newOrder });
});

// Update Order Status with Safe Inventory Restoration & Terminal State Lock
app.put('/api/orders/:id/status', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { id } = req.params;
  const { status, note, trackingCode, shippingCarrier, internalNotes } = req.body;

  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: { message: 'Không tìm thấy đơn hàng' } });

  const isAdmin = user && user.role === 'ADMIN';
  const isOwner = user && order.userId === user.id;

  // Customers can ONLY cancel if order is still PENDING
  if (!isAdmin) {
    if (!isOwner) {
      return res.status(403).json({ error: { message: 'Bạn không có quyền thay đổi đơn hàng này' } });
    }
    if (status !== 'cancelled' || order.status !== 'pending') {
      return res.status(400).json({ error: { message: 'Khách hàng chỉ có thể hủy đơn khi đơn hàng còn ở trạng thái Chờ xử lý' } });
    }
  }

  // TERMINAL STATE LOCK: Cancelled or Completed orders cannot be arbitrarily changed
  if (order.status === 'cancelled') {
    return res.status(400).json({ error: { message: 'Đơn hàng đã hủy không thể thay đổi trạng thái' } });
  }

  const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: { message: 'Trạng thái đơn hàng không hợp lệ' } });
  }

  const now = new Date().toISOString();

  // INVENTORY RESTORATION ON CANCELLATION (Prevent double restore!)
  if (status === 'cancelled' && !order.inventoryRestored) {
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.id);
      if (product) {
        const sizeVariant = product.sizes.find((s) => s.label === item.size);
        if (sizeVariant) {
          const prev = sizeVariant.quantity;
          sizeVariant.quantity += item.quantity;
          sizeVariant.available = true;

          db.inventoryMovements.unshift({
            id: `mv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            productId: product.id,
            productName: product.name,
            productAlias: product.alias,
            size: item.size,
            sku: sizeVariant.sku,
            type: 'cancel_restore',
            quantityDelta: item.quantity,
            previousQuantity: prev,
            newQuantity: sizeVariant.quantity,
            reason: `Hoàn kho do hủy đơn ${order.id}`,
            orderId: order.id,
            performedBy: user ? user.name : 'Khách hàng hủy đơn',
            createdAt: now,
          });

          product.available = true;
        }
      }
    }
    order.inventoryRestored = true;
    order.paymentStatus = 'refunded';
  }

  if (status === 'completed' && order.payment === 'cod') {
    order.paymentStatus = 'paid';
  }

  order.status = status;
  order.updatedAt = now;
  if (trackingCode !== undefined) order.trackingCode = trackingCode;
  if (shippingCarrier !== undefined) order.shippingCarrier = shippingCarrier;
  if (internalNotes !== undefined) order.internalNotes = internalNotes;

  order.statusHistory.unshift({
    status,
    updatedAt: now,
    note: note || (status === 'cancelled' ? 'Hủy đơn hàng' : `Cập nhật trạng thái sang ${status}`),
    updatedBy: user ? user.name : 'Hệ thống',
  });

  saveDb();
  res.json({ order });
});

// -------------------------------------------------------------
// API: INVENTORY MOVEMENTS (QUẢN LÝ KHO)
// -------------------------------------------------------------
app.get('/api/inventory/movements', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền xem biến động kho' } });
  }

  const { sku, productId, type, limit } = req.query;
  let movements = [...db.inventoryMovements];

  if (sku) {
    movements = movements.filter((m) => m.sku.toLowerCase().includes(String(sku).toLowerCase()));
  }
  if (productId) {
    movements = movements.filter((m) => m.productId === Number(productId));
  }
  if (type) {
    movements = movements.filter((m) => m.type === type);
  }

  movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (limit) {
    movements = movements.slice(0, Number(limit));
  }

  res.json({ total: movements.length, movements });
});

app.post('/api/inventory/adjust', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền điều chỉnh kho' } });
  }

  const { productId, size, quantityDelta, type, reason } = req.body;
  if (!productId || !size || quantityDelta === undefined || !reason) {
    return res.status(400).json({ error: { message: 'Vui lòng cung cấp sản phẩm, size, số lượng và lý do điều chỉnh' } });
  }

  const product = db.products.find((p) => p.id === Number(productId));
  if (!product) return res.status(404).json({ error: { message: 'Không tìm thấy sản phẩm' } });

  const sizeVariant = product.sizes.find((s) => s.label === String(size));
  if (!sizeVariant) return res.status(404).json({ error: { message: `Size ${size} không tồn tại` } });

  const delta = Number(quantityDelta);
  const prev = sizeVariant.quantity;
  const newQty = prev + delta;

  if (newQty < 0) {
    return res.status(400).json({ error: { message: 'Số lượng tồn kho không được âm' } });
  }

  sizeVariant.quantity = newQty;
  sizeVariant.available = newQty > 0;
  product.available = product.sizes.some((s) => s.quantity > 0);

  const movement: InventoryMovement = {
    id: `mv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    productId: product.id,
    productName: product.name,
    productAlias: product.alias,
    size: sizeVariant.label,
    sku: sizeVariant.sku,
    type: type || (delta >= 0 ? 'import' : 'export'),
    quantityDelta: delta,
    previousQuantity: prev,
    newQuantity: newQty,
    reason: String(reason).trim(),
    performedBy: user.name,
    createdAt: new Date().toISOString(),
  };

  db.inventoryMovements.unshift(movement);
  saveDb();

  res.json({ product, movement });
});

// -------------------------------------------------------------
// API: COUPONS & DISCOUNTS
// -------------------------------------------------------------
app.get('/api/coupons', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (user && user.role === 'ADMIN') {
    return res.json({ coupons: db.coupons });
  }
  // Public only gets active coupons
  res.json({ coupons: db.coupons.filter((c) => c.isActive) });
});

app.post('/api/coupons/verify', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ error: { message: 'Vui lòng nhập mã ưu đãi' } });

  const clean = String(code).trim().toUpperCase();
  const coupon = db.coupons.find((c) => c.code === clean && c.isActive);

  if (!coupon) {
    return res.status(400).json({ error: { message: 'Mã ưu đãi không hợp lệ hoặc đã hết hạn' } });
  }

  const orderSubtotal = Number(subtotal) || 0;
  if (coupon.minSpend && orderSubtotal < coupon.minSpend) {
    return res.status(400).json({
      error: {
        message: `Mã ${coupon.code} áp dụng cho đơn hàng từ ${coupon.minSpend.toLocaleString('vi-VN')}₫ trở lên`,
      },
    });
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({ error: { message: 'Mã ưu đãi này đã hết lượt sử dụng' } });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((orderSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  res.json({ valid: true, coupon, discount });
});

app.post('/api/coupons', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền tạo mã ưu đãi' } });
  }

  const { code, discountType, discountValue, minSpend, maxDiscount, usageLimit, description, isActive } = req.body;
  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ error: { message: 'Vui lòng điền đủ thông tin mã ưu đãi' } });
  }

  const clean = String(code).trim().toUpperCase();
  const existing = db.coupons.find((c) => c.code === clean);
  if (existing) {
    existing.discountType = discountType;
    existing.discountValue = Number(discountValue);
    existing.minSpend = minSpend ? Number(minSpend) : undefined;
    existing.maxDiscount = maxDiscount ? Number(maxDiscount) : undefined;
    existing.usageLimit = usageLimit ? Number(usageLimit) : undefined;
    existing.description = description;
    existing.isActive = isActive !== undefined ? Boolean(isActive) : existing.isActive;
    saveDb();
    return res.json({ coupon: existing });
  }

  const newCoupon: Coupon = {
    code: clean,
    discountType,
    discountValue: Number(discountValue),
    minSpend: minSpend ? Number(minSpend) : undefined,
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    usageLimit: usageLimit ? Number(usageLimit) : undefined,
    usageCount: 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    description: description || `Mã giảm giá ${clean}`,
  };

  db.coupons.push(newCoupon);
  saveDb();
  res.status(201).json({ coupon: newCoupon });
});

// -------------------------------------------------------------
// API: ADMIN DASHBOARD & REPORTS & SETTINGS
// -------------------------------------------------------------
app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền truy cập dashboard' } });
  }

  const nonCancelledOrders = db.orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getTime() - 7 * 86400000).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  const revenueToday = nonCancelledOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOfDay)
    .reduce((sum, o) => sum + o.total, 0);

  const revenueWeek = nonCancelledOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOfWeek)
    .reduce((sum, o) => sum + o.total, 0);

  const revenueMonth = nonCancelledOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOfMonth)
    .reduce((sum, o) => sum + o.total, 0);

  const revenueYear = nonCancelledOrders
    .filter((o) => new Date(o.createdAt).getTime() >= startOfYear)
    .reduce((sum, o) => sum + o.total, 0);

  // Status counts
  const ordersPending = db.orders.filter((o) => o.status === 'pending').length;
  const ordersConfirmed = db.orders.filter((o) => o.status === 'confirmed').length;
  const ordersShipping = db.orders.filter((o) => o.status === 'shipping').length;
  const ordersCompleted = db.orders.filter((o) => o.status === 'completed').length;
  const ordersCancelled = db.orders.filter((o) => o.status === 'cancelled').length;

  // Stock status
  let lowStockCount = 0;
  let outOfStockCount = 0;

  db.products.forEach((p) => {
    const totalStock = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
    if (totalStock === 0) outOfStockCount++;
    else if (totalStock < 5) lowStockCount++;
  });

  // Best Sellers
  const salesMap = new Map<number, { productId: number; name: string; image: string; totalQuantity: number; totalRevenue: number }>();

  nonCancelledOrders.forEach((o) => {
    o.items.forEach((item) => {
      const existing = salesMap.get(item.id) || {
        productId: item.id,
        name: item.name,
        image: item.image,
        totalQuantity: 0,
        totalRevenue: 0,
      };
      existing.totalQuantity += item.quantity;
      existing.totalRevenue += item.priceValue * item.quantity;
      salesMap.set(item.id, existing);
    });
  });

  const bestSellers = Array.from(salesMap.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5);

  // 7-day revenue chart
  const revenueChart: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 86400000);
    const dayStr = `${day.getDate()}/${day.getMonth() + 1}`;
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const dayEnd = dayStart + 86400000;

    const dayOrders = nonCancelledOrders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= dayStart && t < dayEnd;
    });

    revenueChart.push({
      date: dayStr,
      revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
      orders: dayOrders.length,
    });
  }

  res.json({
    totalRevenue,
    revenueToday,
    revenueWeek,
    revenueMonth,
    revenueYear,
    totalOrders: db.orders.length,
    ordersPending,
    ordersConfirmed,
    ordersShipping,
    ordersCompleted,
    ordersCancelled,
    totalProducts: db.products.length,
    lowStockCount,
    outOfStockCount,
    bestSellers,
    revenueChart,
  });
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền xem danh sách khách hàng' } });
  }

  const usersWithStats = db.users.map((u) => {
    const userOrders = db.orders.filter((o) => o.userId === u.id && o.status !== 'cancelled');
    const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrder = userOrders[0];
    const { passwordHash: _, ...userSafe } = u;

    return {
      ...userSafe,
      totalOrders: userOrders.length,
      totalSpent,
      lastOrderAt: lastOrder ? lastOrder.createdAt : null,
    };
  });

  res.json({ users: usersWithStats });
});

app.put('/api/admin/users/:id', (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  if (!authUser || authUser.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền quản lý khách hàng' } });
  }

  const { id } = req.params;
  const target = db.users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ error: { message: 'Không tìm thấy người dùng' } });

  const { isBlocked, notes } = req.body;
  if (isBlocked !== undefined) target.isBlocked = Boolean(isBlocked);
  if (notes !== undefined) target.notes = String(notes);

  saveDb();
  const { passwordHash: _, ...userSafe } = target;
  res.json({ user: userSafe });
});

app.get('/api/admin/settings', (_req: Request, res: Response) => {
  res.json({ settings: db.settings });
});

app.put('/api/admin/settings', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền sửa cài đặt cửa hàng' } });
  }

  db.settings = { ...db.settings, ...req.body };
  saveDb();
  res.json({ settings: db.settings });
});

app.get('/api/admin/banners', (_req: Request, res: Response) => {
  res.json({ banners: db.banners });
});

app.put('/api/admin/banners', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Chỉ quản trị viên mới có quyền cập nhật banner' } });
  }

  if (Array.isArray(req.body.banners)) {
    db.banners = req.body.banners;
    saveDb();
  }
  res.json({ banners: db.banners });
});

// -------------------------------------------------------------
// VITE DEV MIDDLEWARE INTEGRATION (PORT 3000)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PhuAnh Sneaker full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
