import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_COUPONS, INITIAL_STORE_SETTINGS } from './src/data/initialProducts';
import { Product, Order, User, Session, InventoryMovement, Coupon, Banner, StoreSettings, CartItem, OrderStatus } from './src/types';

const app = express();
const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SECURITY_FILE = path.join(DATA_DIR, 'security.json');

// -------------------------------------------------------------
// 1. SECURITY CONFIGURATION & KEYS
// -------------------------------------------------------------
interface SecurityConfig {
  jwtSecret: string;
  csrfSecret: string;
}

function loadOrGenerateSecurityConfig(): SecurityConfig {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (process.env.JWT_SECRET && process.env.CSRF_SECRET) {
    return {
      jwtSecret: process.env.JWT_SECRET,
      csrfSecret: process.env.CSRF_SECRET,
    };
  }

  if (fs.existsSync(SECURITY_FILE)) {
    try {
      const content = fs.readFileSync(SECURITY_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.jwtSecret && parsed.csrfSecret) {
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read security.json, generating fresh keys...', e);
    }
  }

  const generated: SecurityConfig = {
    jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    csrfSecret: process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex'),
  };

  try {
    fs.writeFileSync(SECURITY_FILE, JSON.stringify(generated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save security.json:', err);
  }

  return generated;
}

const securityConfig = loadOrGenerateSecurityConfig();
const JWT_SECRET = securityConfig.jwtSecret;
const JWT_ISSUER = 'phuanh-sneaker-api';
const JWT_AUDIENCE = 'phuanh-sneaker-client';
const JWT_EXPIRATION = '7d';
const BCRYPT_ROUNDS = 12;

// Dummy hash for timing attack mitigation during failed logins
const DUMMY_HASH = bcrypt.hashSync('dummy_password_timing_protection_2026', 10);

// -------------------------------------------------------------
// 2. EXPRESS MIDDLEWARES & HARDENING
// -------------------------------------------------------------
app.use(cookieParser());
// Request body size limit (1MB to protect against Denial of Service / payload exhaustion)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  // Iframe-friendly CSP for AI Studio preview environment
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self' https://*.google.com https://*.run.app https://*.aistudio.google.com http://localhost:*;"
  );
  next();
});

// In-Memory Rate Limiter (Sliding Window / Bucket)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const generalRateLimitMap = new Map<string, RateLimitRecord>();
const authFailureMap = new Map<string, { count: number; lockedUntil: number }>();

// General API Rate Limiter: max 300 requests / minute per IP
function generalRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = generalRateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    generalRateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return next();
  }

  record.count += 1;
  if (record.count > 300) {
    return res.status(429).json({
      error: { message: 'Quá nhiều yêu cầu từ địa chỉ mạng của bạn. Vui lòng chậm lại.' },
    });
  }

  next();
}

app.use('/api', generalRateLimiter);

// -------------------------------------------------------------
// 3. DATABASE SCHEMA & PERSISTENCE
// -------------------------------------------------------------
interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  sessions: Session[];
  products: Product[];
  orders: Order[];
  inventoryMovements: InventoryMovement[];
  coupons: Coupon[];
  banners: Banner[];
  settings: StoreSettings;
}

let db: DatabaseSchema = {
  users: [],
  sessions: [],
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
      if (!db.products || db.products.length === 0) {
        db.products = [...INITIAL_PRODUCTS];
      }
      if (!db.sessions) {
        db.sessions = [];
      }
      return;
    } catch (e) {
      console.warn('Could not parse existing store.json, re-seeding...', e);
    }
  }

  // Seed default admin and initial customer with strong bcrypt hash
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@123456';
  const adminHash = bcrypt.hashSync(adminPassword, BCRYPT_ROUNDS);
  const customerHash = bcrypt.hashSync('Customer@123', BCRYPT_ROUNDS);

  const adminUser: User & { passwordHash: string } = {
    id: 'user_admin_phuanh',
    email: 'admin@phuanhsneaker.local',
    name: 'Admin PhuAnh Sneaker',
    role: 'ADMIN',
    phone: '0397233999',
    address: 'Số 123 Đường Sneaker, Quận 1',
    city: 'TP. Hồ Chí Minh',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    passwordHash: adminHash,
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
    passwordHash: customerHash,
  };

  db = {
    users: [adminUser, sampleCustomer],
    sessions: [],
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
        ],
        payment: 'cod',
        paymentStatus: 'paid',
        status: 'completed',
        subtotal: 460000,
        discount: 0,
        shipping: 30000,
        total: 490000,
        trackingCode: 'VNP9812401',
        shippingCarrier: 'Giao Hàng Tiết Kiệm',
        internalNotes: 'Khách nhận và thanh toán tốt',
        statusHistory: [
          { status: 'pending', updatedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
          { status: 'completed', updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(), note: 'Khách nhận hàng thành công' },
        ],
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'PA-924510',
        userId: 'user_customer_demo',
        customer: {
          fullName: 'Nguyễn Văn An',
          phone: '0901234567',
          address: '45/12 Lê Lợi, Phường Bến Nghé, Quận 1',
          city: 'TP. Hồ Chí Minh',
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
          { status: 'shipping', updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(), note: 'Đang vận chuyển' },
        ],
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      },
    ],
    inventoryMovements: [],
    coupons: [...INITIAL_COUPONS],
    banners: [...INITIAL_BANNERS],
    settings: { ...INITIAL_STORE_SETTINGS },
  };

  saveDb();
}

initDb();

// -------------------------------------------------------------
// 4. PASSWORD & AUTHENTICATION HELPERS
// -------------------------------------------------------------
// Password Policy: Minimum 8 characters, at least 1 letter and 1 number
function validatePasswordPolicy(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Mật khẩu không được để trống' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'Mật khẩu phải bao gồm cả chữ cái và chữ số' };
  }
  return { valid: true };
}

// Token Hash helper (to avoid storing raw JWT tokens in sessions)
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Custom request interface with authenticated user & session
export interface AuthenticatedRequest extends Request {
  user?: User;
  session?: Session;
}

// Verify and authenticate request (Extracts JWT from Bearer header or HttpOnly cookie)
function authenticateRequest(req: AuthenticatedRequest): { authenticated: boolean; user?: User; session?: Session; error?: string } {
  let token: string | null = null;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  // 2. Fallback to HttpOnly cookie
  if (!token && req.cookies && req.cookies.phuanh_session) {
    token = req.cookies.phuanh_session;
  }

  if (!token) {
    return { authenticated: false, error: 'Vui lòng đăng nhập để tiếp tục' };
  }

  // Verify JWT signature, algorithm, issuer, audience, and expiration
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as { sub: string; role: string; jti: string };

    const { sub: userId, jti: sessionId } = decoded;

    // Check session in database for revocation & expiration
    const session = db.sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { authenticated: false, error: 'Phiên đăng nhập không tồn tại hoặc đã hết hạn' };
    }

    if (session.revokedAt) {
      return { authenticated: false, error: 'Phiên đăng nhập đã bị thu hồi' };
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      return { authenticated: false, error: 'Phiên đăng nhập đã hết hạn' };
    }

    // Verify token hash matches stored session
    if (session.tokenHash !== hashToken(token)) {
      return { authenticated: false, error: 'Chữ ký phiên không hợp lệ' };
    }

    // Check user in database
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return { authenticated: false, error: 'Tài khoản người dùng không tồn tại' };
    }

    if (user.isBlocked) {
      return { authenticated: false, error: 'Tài khoản này đã bị khóa' };
    }

    const { passwordHash: _, ...safeUser } = user;
    return { authenticated: true, user: safeUser, session };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return { authenticated: false, error: 'Mã xác thực đã hết hạn' };
    }
    return { authenticated: false, error: 'Mã xác thực không hợp lệ' };
  }
}

// Require Authentication Middleware (Deny-by-default)
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const result = authenticateRequest(req);
  if (!result.authenticated || !result.user || !result.session) {
    return res.status(401).json({ error: { message: result.error || 'Vui lòng đăng nhập' } });
  }

  // CSRF Protection for state-changing requests when authenticated via cookie without Bearer header
  const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
  const usedCookieAuth = !req.headers.authorization && req.cookies?.phuanh_session;

  if (isStateChanging && usedCookieAuth) {
    const csrfHeader = req.headers['x-csrf-token'];
    if (!csrfHeader || csrfHeader !== result.session.csrfToken) {
      return res.status(403).json({ error: { message: 'Yêu cầu bị từ chối: CSRF token không hợp lệ hoặc bị thiếu' } });
    }
  }

  req.user = result.user;
  req.session = result.session;
  next();
}

// Require Administrator Role Middleware (Deny-by-default)
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { message: 'Quyền truy cập bị từ chối: Yêu cầu quyền quản trị viên' } });
    }
    next();
  });
}

// Create session and issue signed JWT
function createSessionAndToken(user: User, req: Request): { token: string; session: Session; csrfToken: string } {
  const sessionId = crypto.randomUUID();
  const csrfToken = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      jti: sessionId,
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: JWT_EXPIRATION,
    }
  );

  const session: Session = {
    id: sessionId,
    userId: user.id,
    tokenHash: hashToken(token),
    csrfToken,
    createdAt: new Date().toISOString(),
    expiresAt,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  };

  db.sessions.push(session);
  saveDb();

  return { token, session, csrfToken };
}

// Set HttpOnly Secure Cookie
function setSessionCookie(res: Response, token: string) {
  res.cookie('phuanh_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

// -------------------------------------------------------------
// 5. API: AUTHENTICATION
// -------------------------------------------------------------
// Register Customer: Strictly sets role: CUSTOMER (cannot self-assign admin)
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password, phone, address, city } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: { message: 'Vui lòng cung cấp họ tên, email và mật khẩu' } });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: { message: 'Địa chỉ email không đúng định dạng' } });
  }

  // Password Policy enforcement
  const policyCheck = validatePasswordPolicy(password);
  if (!policyCheck.valid) {
    return res.status(400).json({ error: { message: policyCheck.message } });
  }

  // Duplicate email check
  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: { message: 'Email này đã được sử dụng' } });
  }

  // Strong bcrypt hash with cost factor 12
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // ROLE HARDENING: Public registration is ALWAYS forced to CUSTOMER!
  // Any role passed by frontend/client in body is completely ignored.
  const newUser: User & { passwordHash: string } = {
    id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    email: normalizedEmail,
    name: String(name).trim().slice(0, 100),
    role: 'CUSTOMER',
    phone: phone ? String(phone).trim().slice(0, 20) : '',
    address: address ? String(address).trim().slice(0, 300) : '',
    city: city ? String(city).trim().slice(0, 100) : 'TP. Hồ Chí Minh',
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  db.users.push(newUser);

  // Issue cryptographic JWT session
  const { token, csrfToken } = createSessionAndToken(newUser, req);
  setSessionCookie(res, token);

  const { passwordHash: _, ...userSafe } = newUser;
  res.status(201).json({ user: userSafe, token, csrfToken });
});

// Login: Generic error anti-enumeration, brute force protection, bcrypt comparison
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (!email || !password) {
    return res.status(400).json({ error: { message: 'Vui lòng nhập email và mật khẩu' } });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const failureKey = `${ip}:${normalizedEmail}`;
  const failureRecord = authFailureMap.get(failureKey);

  // Brute Force Protection: 5 failed attempts locks for 15 minutes
  if (failureRecord && failureRecord.count >= 5) {
    if (Date.now() < failureRecord.lockedUntil) {
      return res.status(429).json({
        error: {
          message: 'Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 15 phút.',
        },
      });
    } else {
      // Lock expired, reset
      authFailureMap.delete(failureKey);
    }
  }

  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    // Timing attack mitigation: do a dummy bcrypt comparison
    await bcrypt.compare(password, DUMMY_HASH);

    const count = (failureRecord?.count || 0) + 1;
    authFailureMap.set(failureKey, { count, lockedUntil: Date.now() + 15 * 60 * 1000 });

    // Generic error: never disclose if email exists
    return res.status(401).json({ error: { message: 'Email hoặc mật khẩu không chính xác' } });
  }

  // Verify password with bcrypt (or migrate legacy hash seamlessly)
  let passwordValid = false;
  if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
    passwordValid = await bcrypt.compare(password, user.passwordHash);
  } else {
    // Legacy hash migration
    const legacyHash = crypto.createHash('sha256').update(password + '_phuanh_salt_2026').digest('hex');
    if (user.passwordHash === legacyHash) {
      passwordValid = true;
      // Upgrade immediately to bcrypt!
      user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      saveDb();
    }
  }

  if (!passwordValid) {
    const count = (failureRecord?.count || 0) + 1;
    authFailureMap.set(failureKey, { count, lockedUntil: Date.now() + 15 * 60 * 1000 });

    // Generic error
    return res.status(401).json({ error: { message: 'Email hoặc mật khẩu không chính xác' } });
  }

  // Clear failure record on successful password match
  authFailureMap.delete(failureKey);

  if (user.isBlocked) {
    return res.status(403).json({
      error: { message: 'Tài khoản này đã bị khóa. Vui lòng liên hệ hotline PhuAnh Sneaker.' },
    });
  }

  // Issue cryptographic JWT session & HttpOnly cookie
  const { token, csrfToken } = createSessionAndToken(user, req);
  setSessionCookie(res, token);

  user.lastLoginAt = new Date().toISOString();
  saveDb();

  const { passwordHash: _, ...userSafe } = user;
  res.json({ user: userSafe, token, csrfToken });
});

// Logout: Revokes session in DB and clears cookie
app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.session) {
    const session = db.sessions.find((s) => s.id === req.session!.id);
    if (session) {
      session.revokedAt = new Date().toISOString();
      saveDb();
    }
  }

  res.clearCookie('phuanh_session', { path: '/' });
  res.json({ success: true, message: 'Đã đăng xuất và thu hồi phiên thành công' });
});

// Logout all devices: Revokes all active sessions for current user
app.post('/api/auth/logout-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const now = new Date().toISOString();

  db.sessions.forEach((s) => {
    if (s.userId === userId && !s.revokedAt) {
      s.revokedAt = now;
    }
  });

  saveDb();
  res.clearCookie('phuanh_session', { path: '/' });
  res.json({ success: true, message: 'Đã thu hồi toàn bộ phiên đăng nhập của tài khoản' });
});

// Change Password: Validates current password, enforces policy, re-hashes with bcrypt, revokes other sessions
app.post('/api/auth/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: { message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' } });
  }

  const user = db.users.find((u) => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ error: { message: 'Không tìm thấy người dùng' } });
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return res.status(400).json({ error: { message: 'Mật khẩu hiện tại không chính xác' } });
  }

  const policyCheck = validatePasswordPolicy(newPassword);
  if (!policyCheck.valid) {
    return res.status(400).json({ error: { message: policyCheck.message } });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ error: { message: 'Mật khẩu mới không được trùng với mật khẩu cũ' } });
  }

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  // Revoke all other sessions for security
  const currentSessionId = req.session?.id;
  const now = new Date().toISOString();
  db.sessions.forEach((s) => {
    if (s.userId === user.id && s.id !== currentSessionId && !s.revokedAt) {
      s.revokedAt = now;
    }
  });

  saveDb();
  res.json({ success: true, message: 'Đổi mật khẩu thành công. Các phiên đăng nhập khác đã được thu hồi.' });
});

// Get Current Authenticated User Profile
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// Update Profile: Role and email cannot be changed by customer
app.put('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const target = db.users.find((u) => u.id === req.user!.id);
  if (!target) return res.status(404).json({ error: { message: 'Không tìm thấy người dùng' } });

  const { name, phone, address, city } = req.body;
  if (name) target.name = String(name).trim().slice(0, 100);
  if (phone !== undefined) target.phone = String(phone).trim().slice(0, 20);
  if (address !== undefined) target.address = String(address).trim().slice(0, 300);
  if (city !== undefined) target.city = String(city).trim().slice(0, 100);

  // Strictly ignore any role or password field sent to this endpoint!
  saveDb();
  const { passwordHash: _, ...userSafe } = target;
  res.json({ user: userSafe });
});

// -------------------------------------------------------------
// 6. API: PRODUCTS (Read Public, Write Strictly requireAdmin)
// -------------------------------------------------------------
app.get('/api/products', (req: Request, res: Response) => {
  const { category, q, minPrice, maxPrice, size, sort, inStock } = req.query;

  let filtered = [...db.products];

  if (category && String(category).toUpperCase() !== 'ALL') {
    filtered = filtered.filter((p) => p.category.toUpperCase() === String(category).toUpperCase());
  }

  if (q && String(q).trim()) {
    const query = String(q).trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  if (minPrice) {
    const min = Math.max(0, Number(minPrice));
    filtered = filtered.filter((p) => p.priceValue >= min);
  }
  if (maxPrice) {
    const max = Number(maxPrice);
    if (max > 0) filtered = filtered.filter((p) => p.priceValue <= max);
  }

  if (size) {
    const sizeStr = String(size);
    filtered = filtered.filter((p) =>
      p.sizes && p.sizes.some((s) => s.label === sizeStr && s.available && s.quantity > 0)
    );
  }

  if (inStock === 'true') {
    filtered = filtered.filter((p) => p.available);
  }

  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.priceValue - b.priceValue);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.priceValue - a.priceValue);
  } else if (sort === 'name_asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else {
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

  const related = db.products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  res.json({ product, related });
});

// Admin Product Creation: requireAdmin
app.post('/api/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, category, priceValue, compareAtValue, image, images, sku, sizes, description } = req.body;

  if (!name || !category || priceValue === undefined || !sku) {
    return res.status(400).json({ error: { message: 'Vui lòng điền đầy đủ tên, danh mục, giá và mã SKU' } });
  }

  const numPrice = Number(priceValue);
  if (isNaN(numPrice) || numPrice < 0) {
    return res.status(400).json({ error: { message: 'Giá sản phẩm không hợp lệ' } });
  }

  const alias = String(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const newId = Date.now();
  const productSizes = sizes && Array.isArray(sizes) && sizes.length > 0 ? sizes : [
    { label: '36', available: true, quantity: 4, sku: `${sku}-36` },
    { label: '37', available: true, quantity: 4, sku: `${sku}-37` },
    { label: '38', available: true, quantity: 4, sku: `${sku}-38` },
    { label: '39', available: true, quantity: 4, sku: `${sku}-39` },
    { label: '40', available: true, quantity: 4, sku: `${sku}-40` },
  ];

  const totalStock = productSizes.reduce((sum: number, s: any) => sum + (Math.max(0, Number(s.quantity)) || 0), 0);

  const newProduct: Product = {
    id: newId,
    alias: `${alias}-${newId.toString().slice(-4)}`,
    name: String(name).trim().slice(0, 200),
    category: String(category).trim().toUpperCase().slice(0, 50),
    price: `${numPrice.toLocaleString('vi-VN')}₫`,
    priceValue: numPrice,
    compareAt: compareAtValue ? `${Number(compareAtValue).toLocaleString('vi-VN')}₫` : '',
    compareAtValue: compareAtValue ? Number(compareAtValue) : 0,
    image: image || 'https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737',
    images: images && images.length ? images : [image || 'https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737'],
    available: totalStock > 0,
    sku: String(sku).trim().toUpperCase().slice(0, 50),
    sizes: productSizes,
    description: description ? String(description).slice(0, 2000) : `Mẫu sneaker ${name} chính hãng tại PhuAnh Sneaker.`,
    isNewArrival: true,
    createdAt: new Date().toISOString(),
  };

  db.products.unshift(newProduct);

  // Log inventory movements
  productSizes.forEach((s: any) => {
    const qty = Math.max(0, Number(s.quantity));
    if (qty > 0) {
      db.inventoryMovements.unshift({
        id: `mv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        productId: newProduct.id,
        productName: newProduct.name,
        productAlias: newProduct.alias,
        size: s.label,
        sku: s.sku || `${newProduct.sku}-${s.label}`,
        type: 'import',
        quantityDelta: qty,
        previousQuantity: 0,
        newQuantity: qty,
        reason: 'Nhập kho sản phẩm mới khởi tạo',
        performedBy: req.user!.name,
        createdAt: new Date().toISOString(),
      });
    }
  });

  saveDb();
  res.status(201).json({ product: newProduct });
});

// Admin Product Update: requireAdmin
app.put('/api/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const product = db.products.find((p) => String(p.id) === id || p.alias === id);
  if (!product) return res.status(404).json({ error: { message: 'Không tìm thấy sản phẩm' } });

  const { name, category, priceValue, compareAtValue, image, images, sku, sizes, description, available } = req.body;

  if (name) product.name = String(name).trim().slice(0, 200);
  if (category) product.category = String(category).trim().toUpperCase().slice(0, 50);
  if (priceValue !== undefined) {
    const p = Math.max(0, Number(priceValue));
    product.priceValue = p;
    product.price = `${p.toLocaleString('vi-VN')}₫`;
  }
  if (compareAtValue !== undefined) {
    const c = Math.max(0, Number(compareAtValue));
    product.compareAtValue = c;
    product.compareAt = c > 0 ? `${c.toLocaleString('vi-VN')}₫` : '';
  }
  if (image) product.image = String(image);
  if (images && Array.isArray(images)) product.images = images;
  if (sku) product.sku = String(sku).trim().toUpperCase().slice(0, 50);
  if (description !== undefined) product.description = String(description).slice(0, 2000);

  if (sizes && Array.isArray(sizes)) {
    sizes.forEach((newSize: any) => {
      const oldSize = product.sizes.find((s) => s.label === newSize.label);
      const oldQty = oldSize ? oldSize.quantity : 0;
      const newQty = Math.max(0, Number(newSize.quantity) || 0);

      if (newQty !== oldQty) {
        db.inventoryMovements.unshift({
          id: `mv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
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
          performedBy: req.user!.name,
          createdAt: new Date().toISOString(),
        });
      }
    });

    product.sizes = sizes;
  }

  const totalStock = product.sizes.reduce((sum, s) => sum + s.quantity, 0);
  product.available = available !== undefined ? Boolean(available) : totalStock > 0;

  saveDb();
  res.json({ product });
});

// Admin Product Delete: requireAdmin
app.delete('/api/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const index = db.products.findIndex((p) => String(p.id) === id || p.alias === id);
  if (index === -1) return res.status(404).json({ error: { message: 'Không tìm thấy sản phẩm' } });

  const product = db.products[index];

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
// 7. API: ORDERS & CHECKOUT (RBAC, Resource Ownership & Inventory)
// -------------------------------------------------------------
// List orders: requireAuth. Admin sees all; Customer sees ONLY their own!
app.get('/api/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { status, search, limit } = req.query;

  let orders = [...db.orders];

  if (user.role !== 'ADMIN') {
    // RESOURCE ISOLATION: Customer can ONLY see their own orders!
    orders = orders.filter((o) => o.userId === user.id);
  } else {
    // Admin filtering
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

  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (limit) {
    const l = Math.max(1, Math.min(100, Number(limit)));
    orders = orders.slice(0, l);
  }

  res.json({ total: orders.length, orders });
});

// Get single order detail: requireAuth with strict resource ownership check
app.get('/api/orders/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id);

  if (!order) {
    return res.status(404).json({ error: { message: 'Không tìm thấy đơn hàng' } });
  }

  // OWNERSHIP CHECK: Customer cannot view another customer's order
  if (user.role !== 'ADMIN' && order.userId !== user.id) {
    return res.status(403).json({ error: { message: 'Bạn không có quyền xem đơn hàng này' } });
  }

  res.json({ order });
});

// Create Order: Atomic stock decrement, server price recalculation
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, payment, couponCode } = req.body;

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

  // Calculate pricing server-side only
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

    const requestedQty = Math.max(1, Math.floor(Number(item.quantity) || 1));
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

  // Calculate Coupon discount on backend
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

  const shippingFee = serverSubtotal >= db.settings.freeShippingThreshold ? 0 : db.settings.shippingFee;
  const finalTotal = Math.max(0, serverSubtotal - discountAmount + shippingFee);

  const uniqueNum = Math.floor(100000 + Math.random() * 900000);
  const orderId = `PA-${uniqueNum}`;

  // Optional authentication check for binding userId
  const authCheck = authenticateRequest(req as AuthenticatedRequest);
  const authUser = authCheck.authenticated ? authCheck.user : null;
  const now = new Date().toISOString();

  // ATOMIC INVENTORY DECREMENT
  for (const item of verifiedItems) {
    const product = db.products.find((p) => p.id === item.id)!;
    const sizeVariant = product.sizes.find((s) => s.label === item.size)!;
    const prev = sizeVariant.quantity;
    sizeVariant.quantity -= item.quantity;
    sizeVariant.available = sizeVariant.quantity > 0;

    db.inventoryMovements.unshift({
      id: `mv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
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
      performedBy: authUser ? authUser.name : `Khách: ${customer.fullName}`,
      createdAt: now,
    });

    product.available = product.sizes.some((s) => s.quantity > 0);
  }

  const newOrder: Order = {
    id: orderId,
    userId: authUser ? authUser.id : undefined,
    customer: {
      fullName: String(customer.fullName).trim().slice(0, 100),
      phone: String(customer.phone).trim().slice(0, 20),
      address: String(customer.address).trim().slice(0, 300),
      city: String(customer.city || 'TP. Hồ Chí Minh').trim().slice(0, 100),
      notes: customer.notes ? String(customer.notes).trim().slice(0, 500) : '',
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
    statusHistory: [{ status: 'pending', updatedAt: now, note: 'Khách hàng tạo đơn hàng' }],
    inventoryRestored: false,
    createdAt: now,
    updatedAt: now,
  };

  db.orders.unshift(newOrder);
  saveDb();

  res.status(201).json({ order: newOrder });
});

// Update Order Status: requireAuth with ownership & terminal state locking
app.put('/api/orders/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const { status, note, trackingCode, shippingCarrier, internalNotes } = req.body;

  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: { message: 'Không tìm thấy đơn hàng' } });

  const isAdmin = user.role === 'ADMIN';
  const isOwner = order.userId === user.id;

  // OWNERSHIP & PRIVILEGE ENFORCEMENT
  if (!isAdmin) {
    if (!isOwner) {
      return res.status(403).json({ error: { message: 'Bạn không có quyền thay đổi đơn hàng này' } });
    }
    // Customers can ONLY cancel their own order, and ONLY if it's still 'pending'
    if (status !== 'cancelled' || order.status !== 'pending') {
      return res.status(403).json({
        error: { message: 'Khách hàng chỉ có thể hủy đơn khi đơn hàng còn ở trạng thái Chờ xử lý' },
      });
    }
  }

  // TERMINAL STATE LOCK: Cancelled orders are immutable
  if (order.status === 'cancelled') {
    return res.status(400).json({ error: { message: 'Đơn hàng đã hủy không thể thay đổi trạng thái' } });
  }

  const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: { message: 'Trạng thái đơn hàng không hợp lệ' } });
  }

  const now = new Date().toISOString();

  // ATOMIC STOCK RESTORATION ON CANCELLATION (Prevent double restore!)
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
            id: `mv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
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
            performedBy: user.name,
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
  if (isAdmin && trackingCode !== undefined) order.trackingCode = trackingCode;
  if (isAdmin && shippingCarrier !== undefined) order.shippingCarrier = shippingCarrier;
  if (isAdmin && internalNotes !== undefined) order.internalNotes = internalNotes;

  order.statusHistory.unshift({
    status,
    updatedAt: now,
    note: note || (status === 'cancelled' ? 'Hủy đơn hàng' : `Cập nhật trạng thái sang ${status}`),
    updatedBy: user.name,
  });

  saveDb();
  res.json({ order });
});

// -------------------------------------------------------------
// 8. API: INVENTORY MOVEMENTS (Strictly requireAdmin)
// -------------------------------------------------------------
app.get('/api/inventory/movements', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
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
    const l = Math.max(1, Math.min(200, Number(limit)));
    movements = movements.slice(0, l);
  }

  res.json({ total: movements.length, movements });
});

app.post('/api/inventory/adjust', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { productId, size, quantityDelta, type, reason } = req.body;
  if (!productId || !size || quantityDelta === undefined || !reason) {
    return res.status(400).json({ error: { message: 'Vui lòng cung cấp sản phẩm, size, số lượng và lý do điều chỉnh' } });
  }

  const product = db.products.find((p) => p.id === Number(productId));
  if (!product) return res.status(404).json({ error: { message: 'Không tìm thấy sản phẩm' } });

  const sizeVariant = product.sizes.find((s) => s.label === String(size));
  if (!sizeVariant) return res.status(404).json({ error: { message: `Size ${size} không tồn tại` } });

  const delta = Number(quantityDelta);
  if (isNaN(delta)) {
    return res.status(400).json({ error: { message: 'Số lượng điều chỉnh không hợp lệ' } });
  }

  const prev = sizeVariant.quantity;
  const newQty = prev + delta;

  if (newQty < 0) {
    return res.status(400).json({ error: { message: 'Số lượng tồn kho không được âm' } });
  }

  sizeVariant.quantity = newQty;
  sizeVariant.available = newQty > 0;
  product.available = product.sizes.some((s) => s.quantity > 0);

  const movement: InventoryMovement = {
    id: `mv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    productId: product.id,
    productName: product.name,
    productAlias: product.alias,
    size: sizeVariant.label,
    sku: sizeVariant.sku,
    type: type || (delta >= 0 ? 'import' : 'export'),
    quantityDelta: delta,
    previousQuantity: prev,
    newQuantity: newQty,
    reason: String(reason).trim().slice(0, 500),
    performedBy: req.user!.name,
    createdAt: new Date().toISOString(),
  };

  db.inventoryMovements.unshift(movement);
  saveDb();

  res.json({ product, movement });
});

// -------------------------------------------------------------
// 9. API: COUPONS (Read Public, Write requireAdmin)
// -------------------------------------------------------------
app.get('/api/coupons', (req: Request, res: Response) => {
  const authResult = authenticateRequest(req as AuthenticatedRequest);
  if (authResult.authenticated && authResult.user?.role === 'ADMIN') {
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

  const orderSubtotal = Math.max(0, Number(subtotal) || 0);
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

app.post('/api/coupons', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { code, discountType, discountValue, minSpend, maxDiscount, usageLimit, description, isActive } = req.body;
  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ error: { message: 'Vui lòng điền đủ thông tin mã ưu đãi' } });
  }

  const clean = String(code).trim().toUpperCase().slice(0, 30);
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
// 10. API: ADMIN DASHBOARD, USERS, SETTINGS, BANNERS (Strictly requireAdmin)
// -------------------------------------------------------------
app.get('/api/admin/dashboard', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
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

  const ordersPending = db.orders.filter((o) => o.status === 'pending').length;
  const ordersConfirmed = db.orders.filter((o) => o.status === 'confirmed').length;
  const ordersShipping = db.orders.filter((o) => o.status === 'shipping').length;
  const ordersCompleted = db.orders.filter((o) => o.status === 'completed').length;
  const ordersCancelled = db.orders.filter((o) => o.status === 'cancelled').length;

  let lowStockCount = 0;
  let outOfStockCount = 0;

  db.products.forEach((p) => {
    const totalStock = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
    if (totalStock === 0) outOfStockCount++;
    else if (totalStock < 5) lowStockCount++;
  });

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

app.get('/api/admin/users', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
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

app.put('/api/admin/users/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const target = db.users.find((u) => u.id === id);
  if (!target) return res.status(404).json({ error: { message: 'Không tìm thấy người dùng' } });

  const { isBlocked, notes } = req.body;
  if (isBlocked !== undefined) target.isBlocked = Boolean(isBlocked);
  if (notes !== undefined) target.notes = String(notes).slice(0, 1000);

  saveDb();
  const { passwordHash: _, ...userSafe } = target;
  res.json({ user: userSafe });
});

app.get('/api/admin/settings', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ settings: db.settings });
});

app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  db.settings = { ...db.settings, ...req.body };
  saveDb();
  res.json({ settings: db.settings });
});

app.get('/api/admin/banners', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  res.json({ banners: db.banners });
});

app.put('/api/admin/banners', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  if (Array.isArray(req.body.banners)) {
    db.banners = req.body.banners;
    saveDb();
  }
  res.json({ banners: db.banners });
});

// -------------------------------------------------------------
// 11. CENTRALIZED ERROR HANDLING & EXPORT FOR TESTS
// -------------------------------------------------------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err?.message || err);
  // Never leak internal stack traces or secrets to clients
  res.status(500).json({ error: { message: 'Đã xảy ra lỗi nội bộ máy chủ. Vui lòng thử lại sau.' } });
});

export { app, db, saveDb, JWT_SECRET, BCRYPT_ROUNDS };

// -------------------------------------------------------------
// 12. VITE DEV MIDDLEWARE INTEGRATION (PORT 3000)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PhuAnh Sneaker secure server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
