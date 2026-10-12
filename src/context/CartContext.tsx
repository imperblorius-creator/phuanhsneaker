import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { api } from '../services/api';
import { useNotification } from './NotificationContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: Coupon | null;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  addToCart: (product: Product, size: string, quantity?: number) => boolean;
  updateQuantity: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SHIPPING_FEE = 30000;
const FREE_SHIPPING_MIN = 1000000;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('phuanh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const { showToast } = useNotification();

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('phuanh_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Cart storage error:', e);
    }
  }, [items]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0),
    [items]
  );

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  }, [items.length, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shipping);
  }, [subtotal, discountAmount, shipping]);

  const addToCart = useCallback(
    (product: Product, size: string, quantity: number = 1): boolean => {
      if (!size) {
        showToast('Vui lòng chọn size giày trước khi thêm vào giỏ', 'error');
        return false;
      }

      const sizeInfo = product.sizes?.find((s) => s.label === size);
      if (!sizeInfo || !sizeInfo.available || sizeInfo.quantity <= 0) {
        showToast(`Size ${size} của mẫu ${product.name} đã hết hàng`, 'error');
        return false;
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.id === product.id && i.size === size);
        if (existingIndex > -1) {
          const currentQty = prev[existingIndex].quantity;
          if (currentQty + quantity > sizeInfo.quantity) {
            showToast(`Kho chỉ còn ${sizeInfo.quantity} đôi cho size ${size}`, 'error');
            return prev;
          }
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: currentQty + quantity,
          };
          showToast(`Đã tăng số lượng ${product.name} (Size ${size}) trong giỏ`, 'success');
          return updated;
        }

        const newItem: CartItem = {
          id: product.id,
          alias: product.alias,
          name: product.name,
          category: product.category,
          image: product.image,
          price: product.price,
          priceValue: product.priceValue,
          size,
          sizeSku: sizeInfo.sku || `${product.sku}-${size}`,
          quantity,
        };
        showToast(`Đã thêm ${product.name} (Size ${size}) vào giỏ hàng`, 'success');
        return [...prev, newItem];
      });

      return true;
    },
    [showToast]
  );

  const updateQuantity = useCallback((index: number, delta: number) => {
    setItems((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const nextQty = item.quantity + delta;
      if (nextQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const updated = [...prev];
      updated[index] = { ...item, quantity: nextQty };
      return updated;
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  }, [showToast]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  }, []);

  const applyCouponCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!code.trim()) {
        showToast('Vui lòng nhập mã ưu đãi', 'error');
        return false;
      }
      try {
        const res = await api.verifyCoupon(code.trim().toUpperCase(), subtotal);
        if (res.valid) {
          setAppliedCoupon(res.coupon);
          setDiscountAmount(res.discount);
          showToast(`Áp dụng mã ${res.coupon.code} thành công: giảm ${res.discount.toLocaleString('vi-VN')}₫`, 'success');
          return true;
        }
        return false;
      } catch (err: any) {
        showToast(err.message || 'Mã ưu đãi không hợp lệ', 'error');
        return false;
      }
    },
    [subtotal, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    showToast('Đã hủy áp dụng mã ưu đãi', 'info');
  }, [showToast]);

  const openCheckout = useCallback(() => {
    setIsCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount: discountAmount,
        shipping,
        total,
        appliedCoupon,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCouponCode,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
