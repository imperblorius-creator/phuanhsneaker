import React from 'react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative z-10 bg-white w-full max-w-xl rounded-lg shadow-2xl overflow-hidden animate-slide-in">
        {/* Header Banner */}
        <div className="bg-[#111111] text-white p-6 text-center border-b-4 border-[#cc0000]">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-3xl shadow-lg">
            <i className="ph-fill ph-check-circle"></i>
          </div>
          <p className="text-xs font-bold text-red-200 tracking-widest uppercase">PhuAnh Sneaker</p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
            Đặt Hàng Thành Công!
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Mã đơn hàng: <strong className="text-white text-base tracking-wider">{order.id}</strong>
          </p>
        </div>

        {/* Body Details */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5 text-sm">
          {/* Order Snapshot info */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Khách hàng:</span>
              <strong className="text-black">{order.customer.fullName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số điện thoại:</span>
              <strong className="text-black">{order.customer.phone}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Địa chỉ giao:</span>
              <strong className="text-black text-right max-w-[70%]">
                {order.customer.address}, {order.customer.city}
              </strong>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-500">Phương thức thanh toán:</span>
              <strong className="uppercase text-black">
                {order.payment === 'cod' ? 'COD (Tiền mặt khi nhận)' : order.payment === 'transfer' ? 'Chuyển khoản Vietcombank' : 'Thẻ / Ví'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng tiền thanh toán:</span>
              <strong className="text-[#cc0000] text-lg font-black">
                {order.total.toLocaleString('vi-VN')}₫
              </strong>
            </div>
          </div>

          {/* Bank transfer info if transfer */}
          {order.payment === 'transfer' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded text-xs space-y-2">
              <p className="font-bold text-[#cc0000] uppercase text-sm">
                Hướng Dẫn Chuyển Khoản Ngân Hàng:
              </p>
              <div className="space-y-1 text-gray-800">
                <p>Ngân hàng: <strong>Vietcombank</strong></p>
                <p>Số tài khoản: <strong className="text-black text-sm font-mono">0397233999</strong></p>
                <p>Chủ tài khoản: <strong>PHUANH SNEAKER</strong></p>
                <p>Số tiền: <strong className="text-[#cc0000] text-sm">{order.total.toLocaleString('vi-VN')}₫</strong></p>
                <p>
                  Nội dung chuyển khoản:{' '}
                  <strong className="bg-white px-2 py-0.5 border border-red-300 font-mono text-black">
                    {order.id} {order.customer.phone}
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* Purchased Items Snapshot */}
          <div>
            <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">Sản phẩm trong đơn ({order.items.length})</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={`${item.id}_${item.size}`} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded border border-gray-200">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded bg-white" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-black truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-500">Size: {item.size} | SL: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-xs text-black">
                    {(item.priceValue * item.quantity).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onViewOrders}
            className="flex-1 bg-black text-white font-bold py-3 text-xs uppercase tracking-wider rounded hover:bg-gray-800 transition"
          >
            Xem đơn hàng của tôi
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#cc0000] text-white font-bold py-3 text-xs uppercase tracking-wider rounded hover:bg-red-700 transition"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};
