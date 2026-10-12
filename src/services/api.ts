import { Product, Order, User, InventoryMovement, Coupon, Banner, StoreSettings, DashboardStats } from '../types';

function getToken(): string | null {
  try {
    return localStorage.getItem('phuanh_token');
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('phuanh_token', token);
    } else {
      localStorage.removeItem('phuanh_token');
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: { name: string; email: string; password: string; phone?: string; address?: string; city?: string }) =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  updateProfile: (payload: { name?: string; phone?: string; address?: string; city?: string }) =>
    request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  logout: () => {
    setToken(null);
    return request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  // Products
  getProducts: (params: { category?: string; q?: string; minPrice?: number; maxPrice?: number; size?: string; sort?: string; inStock?: boolean } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'ALL') searchParams.set('category', params.category);
    if (params.q) searchParams.set('q', params.q);
    if (params.minPrice) searchParams.set('minPrice', String(params.minPrice));
    if (params.maxPrice) searchParams.set('maxPrice', String(params.maxPrice));
    if (params.size) searchParams.set('size', params.size);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.inStock) searchParams.set('inStock', 'true');

    const query = searchParams.toString();
    return request<{ total: number; allCount: number; products: Product[] }>(`/api/products${query ? `?${query}` : ''}`);
  },

  getProduct: (idOrAlias: string | number) =>
    request<{ product: Product; related: Product[] }>(`/api/products/${idOrAlias}`),

  createProduct: (payload: Partial<Product>) =>
    request<{ product: Product }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProduct: (id: number | string, payload: Partial<Product>) =>
    request<{ product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id: number | string) =>
    request<{ success: boolean; message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  // Orders
  getOrders: (params: { status?: string; search?: string; limit?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);
    if (params.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return request<{ total: number; orders: Order[] }>(`/api/orders${query ? `?${query}` : ''}`);
  },

  getOrder: (id: string) => request<{ order: Order }>(`/api/orders/${id}`),

  createOrder: (payload: {
    customer: { fullName: string; phone: string; address: string; city: string; notes?: string };
    items: { id: number; alias: string; name: string; category: string; image: string; price: string; priceValue: number; size: string; quantity: number }[];
    payment: 'cod' | 'transfer' | 'card';
    couponCode?: string;
  }) =>
    request<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateOrderStatus: (id: string, payload: { status: string; note?: string; trackingCode?: string; shippingCarrier?: string; internalNotes?: string }) =>
    request<{ order: Order }>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Inventory
  getInventoryMovements: (params: { sku?: string; productId?: number; type?: string; limit?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.sku) searchParams.set('sku', params.sku);
    if (params.productId) searchParams.set('productId', String(params.productId));
    if (params.type) searchParams.set('type', params.type);
    if (params.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return request<{ total: number; movements: InventoryMovement[] }>(`/api/inventory/movements${query ? `?${query}` : ''}`);
  },

  adjustInventory: (payload: { productId: number; size: string; quantityDelta: number; type?: string; reason: string }) =>
    request<{ product: Product; movement: InventoryMovement }>('/api/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Coupons
  getCoupons: () => request<{ coupons: Coupon[] }>('/api/coupons'),

  verifyCoupon: (code: string, subtotal: number) =>
    request<{ valid: boolean; coupon: Coupon; discount: number }>('/api/coupons/verify', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),

  saveCoupon: (payload: Partial<Coupon>) =>
    request<{ coupon: Coupon }>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Admin
  getDashboardStats: () => request<DashboardStats>('/api/admin/dashboard'),

  getAdminUsers: () => request<{ users: (User & { totalOrders: number; totalSpent: number; lastOrderAt: string | null })[] }>('/api/admin/users'),

  updateAdminUser: (id: string, payload: { isBlocked?: boolean; notes?: string }) =>
    request<{ user: User }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getSettings: () => request<{ settings: StoreSettings }>('/api/admin/settings'),

  updateSettings: (payload: Partial<StoreSettings>) =>
    request<{ settings: StoreSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getBanners: () => request<{ banners: Banner[] }>('/api/admin/banners'),

  updateBanners: (banners: Banner[]) =>
    request<{ banners: Banner[] }>('/api/admin/banners', {
      method: 'PUT',
      body: JSON.stringify({ banners }),
    }),
};
