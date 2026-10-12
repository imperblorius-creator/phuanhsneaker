import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { Order, PaymentMethod } from '../types';

interface CheckoutModalProps {
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onOrderSuccess }) => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    isCheckoutOpen,
    closeCheckout,
    updateQuantity,
    removeItem,
    clearCart,
    applyCouponCode,
    removeCoupon,
  } = useCart();

  const { user } = useAuth();
  const { showToast } = useNotification();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('TP. Hồ Chí Minh');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [couponInput, setCouponInput] = useState('');
  const [agreeCall, setAgreeCall] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autofill if user profile exists
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.address) setAddress(user.address);
      if (user.city) setCity(user.city);
    }
  }, [user]);

  if (!isCheckoutOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      showToast('Vui lòng nhập mã ưu đãi', 'error');
      return;
    }
    await applyCouponCode(couponInput.trim());
  };

  const handlePlaceOrder = async () => {
    // Basic validation
    if (!fullName.trim()) {
      showToast('Vui lòng nhập họ và tên người nhận', 'error');
      return;
    }
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!cleanPhone || !/^(0|\+84)[0-9]{9,10}$/.test(cleanPhone)) {
      showToast('Vui lòng nhập số điện thoại hợp lệ (10 chữ số)', 'error');
      return;
    }
    if (!address.trim()) {
      showToast('Vui lòng nhập địa chỉ giao hàng', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Giỏ hàng của bạn đang trống', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createOrder({
        customer: {
          fullName: fullName.trim(),
          phone: cleanPhone,
          address: address.trim(),
          city: city.trim(),
          notes: notes.trim(),
        },
        items: items.map((i) => ({
          id: i.id,
          alias: i.alias,
          name: i.name,
          category: i.category,
          image: i.image,
          price: i.price,
          priceValue: i.priceValue,
          size: i.size,
          quantity: i.quantity,
        })),
        payment: paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      clearCart();
      closeCheckout();
      onOrderSuccess(res.order);
      showToast(`Đặt hàng thành công! Mã đơn: ${res.order.id}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={closeCheckout}></div>

      {/* Modal Dialog */}
      <div className="relative min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6">
        <section className="bg-white w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl rounded-sm z-10 flex flex-col">
          {/* Header */}
          <div className="bg-[#111111] text-white px-5 md:px-8 py-5 flex items-center justify-between border-b-4 border-[#cc0000] sticky top-0 z-20">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#cc0000] mb-0.5">
                PhuAnh Sneaker
              </p>
              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">
                Giỏ Hàng & Thanh Toán
              </h2>
            </div>
            <button
              onClick={closeCheckout}
              className="w-10 h-10 bg-white/10 hover:bg-[#cc0000] text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Đóng thanh toán"
            >
              <i className="ph ph-x text-2xl"></i>
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] flex-1">
            {/* Left: Customer Info & Payment */}
            <div className="p-5 md:p-8 bg-white border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base md:text-lg font-black uppercase tracking-wide text-black flex items-center">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center mr-2">1</span>
                  Thông tin nhận hàng
                </h3>
                {user ? (
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Tài khoản: {user.name}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-semibold">Khách vãng lai</span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-gray-600">Họ và tên *</span>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên..."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-1.5 w-full border border-gray-300 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-gray-600">Số điện thoại *</span>
                  <input
                    type="tel"
                    placeholder="Ví dụ: 0397233999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-1.5 w-full border border-gray-300 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-xs font-bold uppercase text-gray-600">Địa chỉ giao hàng *</span>
                  <input
                    type="text"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="mt-1.5 w-full border border-gray-300 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-gray-600">Tỉnh / Thành phố</span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 w-full border border-gray-300 px-4 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:border-black"
                  >
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                    <option value="Khánh Hòa">Khánh Hòa</option>
                    <option value="Khác">Tỉnh thành khác</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-gray-600">Ghi chú giao hàng</span>
                  <input
                    type="text"
                    placeholder="Ví dụ: Giao sau 17h, gọi trước..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1.5 w-full border border-gray-300 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-black"
                  />
                </label>
              </div>

              {/* Payment Method */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-black uppercase tracking-wide text-black flex items-center">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center mr-2">2</span>
                    Phương thức thanh toán
                  </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`payment-option cursor-pointer p-3.5 flex flex-col gap-2 rounded ${
                      paymentMethod === 'cod' ? 'active ring-2 ring-black' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="payment-icon w-8 h-8 rounded flex items-center justify-center">
                        <i className="ph ph-money text-xl"></i>
                      </span>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-black"
                      />
                    </div>
                    <span className="font-black uppercase text-xs">COD</span>
                    <span className="payment-copy text-[11px] text-gray-500 leading-tight">
                      Thanh toán tiền mặt khi nhận hàng.
                    </span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('transfer')}
                    className={`payment-option cursor-pointer p-3.5 flex flex-col gap-2 rounded ${
                      paymentMethod === 'transfer' ? 'active ring-2 ring-black' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="payment-icon w-8 h-8 rounded flex items-center justify-center">
                        <i className="ph ph-bank text-xl"></i>
                      </span>
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={() => setPaymentMethod('transfer')}
                        className="accent-black"
                      />
                    </div>
                    <span className="font-black uppercase text-xs">Chuyển khoản</span>
                    <span className="payment-copy text-[11px] text-gray-500 leading-tight">
                      Quét mã VietQR hoặc chuyển Vietcombank.
                    </span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`payment-option cursor-pointer p-3.5 flex flex-col gap-2 rounded ${
                      paymentMethod === 'card' ? 'active ring-2 ring-black' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="payment-icon w-8 h-8 rounded flex items-center justify-center">
                        <i className="ph ph-credit-card text-xl"></i>
                      </span>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="accent-black"
                      />
                    </div>
                    <span className="font-black uppercase text-xs">Thẻ / Ví</span>
                    <span className="payment-copy text-[11px] text-gray-500 leading-tight">
                      Visa, Mastercard, MoMo, ZaloPay.
                    </span>
                  </label>
                </div>

                {/* Transfer Info Preview */}
                {paymentMethod === 'transfer' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-xs text-gray-800 space-y-1.5 animate-slide-in">
                    <p className="font-bold text-[#cc0000] uppercase flex items-center gap-1.5">
                      <i className="ph-fill ph-info"></i> Thông tin chuyển khoản Vietcombank:
                    </p>
                    <p>Ngân hàng: <strong>Vietcombank (VCB)</strong></p>
                    <p>Số tài khoản: <strong className="text-base text-black font-mono">0397233999</strong></p>
                    <p>Chủ tài khoản: <strong>PHUANH SNEAKER</strong></p>
                    <p className="text-gray-600 italic">
                      Nội dung chuyển khoản: Họ tên + SĐT người nhận hàng. Nhân viên sẽ kiểm tra và xác nhận tức thì.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 animate-slide-in">
                    <p className="font-bold mb-1">Cổng thanh toán thẻ an toàn:</p>
                    <p>Hệ thống tự động kích hoạt liên kết cổng thanh toán trực tuyến bảo mật sau khi xác nhận đơn.</p>
                  </div>
                )}
              </div>

              <label className="mt-6 flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeCall}
                  onChange={(e) => setAgreeCall(e.target.checked)}
                  className="mt-0.5 accent-black w-4 h-4"
                />
                <span className="text-xs text-gray-600 leading-relaxed font-medium">
                  Tôi đồng ý nhận cuộc gọi xác nhận size và thời gian giao hàng từ Hotline{' '}
                  <strong className="text-black">0397233999</strong>.
                </span>
              </label>
            </div>

            {/* Right: Cart Review & Pricing Summary */}
            <aside className="bg-gray-50 p-5 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                  <h3 className="text-base md:text-lg font-black uppercase tracking-wide text-black">
                    Sản phẩm ({itemCount})
                  </h3>
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs text-gray-500 hover:text-[#cc0000] font-bold"
                    >
                      Xóa giỏ hàng
                    </button>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                      <i className="ph ph-shopping-bag-open text-4xl mb-2 block"></i>
                      <p className="text-sm font-bold">Giỏ hàng của bạn đang trống</p>
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <div
                        key={`${item.id}_${item.size}`}
                        className="flex gap-3 bg-white border border-gray-200 p-3 rounded"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover bg-gray-100 rounded shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-xs text-black truncate pr-2">
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-gray-400 hover:text-[#cc0000] text-sm"
                              aria-label="Xóa dòng"
                            >
                              <i className="ph ph-trash"></i>
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Size: <span className="font-bold text-black">{item.size}</span>
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded">
                              <button
                                type="button"
                                onClick={() => updateQuantity(index, -1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-bold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(index, 1)}
                                className="w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs font-black text-black">
                              {(item.priceValue * item.quantity).toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Coupon Code Section */}
                <div className="mt-6 bg-white border border-gray-200 p-3.5 rounded">
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">
                    Mã ưu đãi / Khuyến mãi
                  </label>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ví dụ: PHUANH50, SNEAKER10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-black rounded"
                    />
                    <button
                      type="submit"
                      className="bg-black text-white px-4 text-xs font-black uppercase hover:bg-[#cc0000] transition shrink-0 rounded cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </form>
                  {appliedCoupon && (
                    <div className="mt-2 flex items-center justify-between bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded text-xs font-bold">
                      <span>Mã {appliedCoupon.code} đã áp dụng (-{discount.toLocaleString('vi-VN')}₫)</span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-red-600 hover:underline text-[11px]"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>

                {/* Calculation Details */}
                <div className="mt-6 space-y-2.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-bold text-black">{subtotal.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Giảm giá</span>
                    <span className="font-bold text-[#cc0000]">
                      {discount > 0 ? `-${discount.toLocaleString('vi-VN')}₫` : '0₫'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-bold text-black">
                      {shipping === 0 && items.length > 0 ? (
                        <span className="text-emerald-700 font-bold">Miễn phí</span>
                      ) : (
                        `${shipping.toLocaleString('vi-VN')}₫`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between items-end">
                    <span className="font-black uppercase text-sm text-black">Tổng thanh toán</span>
                    <span className="text-2xl font-black text-[#cc0000]">
                      {total.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Submission Button */}
              <div className="mt-6">
                <button
                  type="button"
                  disabled={items.length === 0 || isSubmitting}
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#cc0000] text-white font-black uppercase py-4 rounded hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm shadow-xl"
                >
                  {isSubmitting ? (
                    'Đang xử lý đặt hàng...'
                  ) : (
                    <>
                      Đặt hàng ngay <i className="ph ph-arrow-right text-lg"></i>
                    </>
                  )}
                </button>
                <p className="mt-2 text-[11px] text-gray-500 text-center font-medium">
                  Đơn hàng được lưu tự động vào cơ sở dữ liệu và trừ tồn kho an toàn.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};
