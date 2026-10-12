export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  createdAt: string;
  lastLoginAt?: string;
  isBlocked?: boolean;
  notes?: string;
}

export interface Session {
  id: string; // jti
  userId: string;
  tokenHash: string;
  csrfToken: string;
  createdAt: string;
  expiresAt: string;
  revokedAt?: string;
  ip?: string;
  userAgent?: string;
}

export interface ProductSize {
  label: string;
  available: boolean;
  quantity: number;
  sku: string;
}

export interface Product {
  id: number;
  alias: string;
  name: string;
  category: string;
  price: string;
  priceValue: number;
  compareAt?: string;
  compareAtValue?: number;
  image: string;
  images: string[];
  available: boolean;
  sku: string;
  sizes: ProductSize[];
  description?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  createdAt?: string;
}

export interface CartItem {
  id: number;
  alias: string;
  name: string;
  category: string;
  image: string;
  price: string;
  priceValue: number;
  size: string;
  sizeSku: string;
  quantity: number;
}

export type PaymentMethod = 'cod' | 'transfer' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

export interface OrderCustomer {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  updatedAt: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string; // e.g. PA-98214
  userId?: string;
  customer: OrderCustomer;
  items: CartItem[];
  payment: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  trackingCode?: string;
  shippingCarrier?: string;
  internalNotes?: string;
  statusHistory: OrderStatusHistoryItem[];
  inventoryRestored?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InventoryMovementType = 'import' | 'export' | 'sale' | 'cancel_restore' | 'adjustment';

export interface InventoryMovement {
  id: string;
  productId: number;
  productName: string;
  productAlias: string;
  size: string;
  sku: string;
  type: InventoryMovementType;
  quantityDelta: number; // positive for addition, negative for reduction
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  orderId?: string;
  performedBy: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
  maxDiscount?: number;
  expiresAt?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  description?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  linkText: string;
  linkCollection: string;
  order: number;
  isActive: boolean;
}

export interface StoreSettings {
  storeName: string;
  hotline: string;
  email: string;
  announcementText: string;
  address: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  shippingFee: number;
  freeShippingThreshold: number;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  revenueYear: number;
  totalOrders: number;
  ordersPending: number;
  ordersConfirmed: number;
  ordersShipping: number;
  ordersCompleted: number;
  ordersCancelled: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  bestSellers: {
    productId: number;
    name: string;
    image: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  revenueChart: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}
