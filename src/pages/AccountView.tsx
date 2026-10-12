import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { Order } from '../types';

interface AccountViewProps {
  onNavigateHome: () => void;
  onNavigateShop: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ onNavigateHome, onNavigateShop }) => {
  const { user, updateProfile, openLoginModal } = useAuth();
  const { showToast } = useNotification();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [selectedOrderTab, setSelectedOrderTab] = useState<string>('all');

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editCity, setEditCity] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Change password state
  const { changePassword } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
      setEditCity(user.city || 'TP. Hồ Chí Minh');
      loadOrders();
    } else {
      setIsLoadingOrders(false);
    }
  }, [user]);

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await api.getOrders();
      setOrders(res.orders || []);
    } catch (err: any) {
      showToast(err.message || 'Không thể tải danh sách đơn hàng', 'error');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const success = await updateProfile({
      name: editName,
      phone: editPhone,
      address: editAddress,
      city: editCity,
    });
    setIsSavingProfile(false);
    if (success) {
      setIsEditingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      showToast('Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm cả chữ cái và chữ số', 'error');
      return;
    }

    setIsSubmittingPassword(true);
    const success = await changePassword({ currentPassword, newPassword });
    setIsSubmittingPassword(false);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderId}? Thao tác này sẽ hoàn lại kho.`)) {
      return;
    }
    try {
      await api.updateOrderStatus(orderId, {
        status: 'cancelled',
        note: 'Khách hàng yêu cầu hủy đơn',
      });
      showToast(`Đã hủy đơn hàng ${orderId} thành công`, 'success');
      loadOrders();
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy đơn hàng', 'error');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500 text-3xl">
          <i className="ph ph-user"></i>
        </div>
        <h2 className="text-2xl font-black uppercase text-black mb-2">Tài Khoản Khách Hàng</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Vui lòng đăng nhập hoặc đăng ký tài khoản để xem hồ sơ và lịch sử đơn hàng của bạn.
        </p>
        <button
          onClick={() => openLoginModal('login')}
          className="w-full bg-[#cc0000] text-white font-bold py-3 uppercase text-xs rounded hover:bg-black transition cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (selectedOrderTab === 'all') return true;
    return o.status === selectedOrderTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded">Chờ xử lý</span>;
      case 'confirmed':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded">Đã xác nhận</span>;
      case 'shipping':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded">Đang giao hàng</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded">Hoàn thành</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded">Đã hủy</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded">{status}</span>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="text-xs font-semibold text-gray-500 mb-6 flex items-center space-x-2">
          <button onClick={onNavigateHome} className="hover:text-black">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-black font-bold uppercase">Hồ Sơ & Đơn Hàng</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_2.5fr] gap-8 items-start">
          {/* User Profile Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
              <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-2xl font-black">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-black truncate">{user.name}</h3>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 bg-red-50 text-[#cc0000] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {user.role}
                </span>
              </div>
            </div>

            {/* Profile Info / Form */}
            {!isEditingProfile ? (
              <div className="pt-5 space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[10px]">Số điện thoại</span>
                  <p className="font-semibold text-black">{user.phone || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[10px]">Địa chỉ giao hàng</span>
                  <p className="font-semibold text-black">{user.address || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase text-[10px]">Tỉnh / Thành phố</span>
                  <p className="font-semibold text-black">{user.city || 'TP. Hồ Chí Minh'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full mt-3 bg-gray-100 hover:bg-black hover:text-white text-black font-bold py-2 text-xs uppercase tracking-wider rounded transition"
                >
                  Cập nhật thông tin
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full bg-white hover:bg-red-50 border border-gray-300 hover:border-[#cc0000] text-gray-700 hover:text-[#cc0000] font-bold py-2 text-xs uppercase tracking-wider rounded transition"
                >
                  🔒 Đổi mật khẩu
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="pt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full border border-gray-300 p-2 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Thành phố</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded text-xs"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 bg-[#cc0000] text-white font-bold py-2 rounded uppercase text-[11px]"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded text-[11px]"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}

            {/* Change Password Dialog/Modal */}
            {isChangingPassword && (
              <form onSubmit={handleChangePasswordSubmit} className="pt-4 mt-4 border-t border-gray-200 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-1">
                  <span className="font-bold text-black uppercase">Đổi mật khẩu tài khoản</span>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="text-gray-400 hover:text-black font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border border-gray-300 p-2 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mật khẩu mới (≥8 ký tự, chữ & số)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border border-gray-300 p-2 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border border-gray-300 p-2 rounded text-xs"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="flex-1 bg-black hover:bg-[#cc0000] text-white font-bold py-2 rounded uppercase text-[11px] transition"
                  >
                    {isSubmittingPassword ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded text-[11px]"
                  >
                    Đóng
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Orders Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200 gap-3">
              <h2 className="text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
                <i className="ph ph-package text-2xl text-[#cc0000]"></i>
                Lịch Sử Đơn Hàng ({orders.length})
              </h2>
              <button
                type="button"
                onClick={loadOrders}
                className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1"
              >
                <i className="ph ph-arrow-clockwise"></i> Làm mới
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto gap-4 py-3 text-xs font-bold text-gray-500">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'pending', label: 'Chờ xử lý' },
                { key: 'confirmed', label: 'Đã xác nhận' },
                { key: 'shipping', label: 'Đang giao' },
                { key: 'completed', label: 'Hoàn thành' },
                { key: 'cancelled', label: 'Đã hủy' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedOrderTab(tab.key)}
                  className={`pb-1 border-b-2 transition whitespace-nowrap cursor-pointer ${
                    selectedOrderTab === tab.key
                      ? 'border-[#cc0000] text-[#cc0000] font-black'
                      : 'border-transparent hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {isLoadingOrders ? (
              <div className="py-12 text-center text-gray-400">Đang tải danh sách đơn hàng...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <i className="ph ph-receipt text-5xl mb-2 block"></i>
                <p className="text-sm font-bold text-black mb-1">Chưa có đơn hàng nào</p>
                <p className="text-xs text-gray-500 mb-4">Bạn chưa có đơn hàng nào trong mục này</p>
                <button
                  onClick={onNavigateShop}
                  className="bg-black text-white text-xs font-bold uppercase py-2.5 px-6 rounded hover:bg-[#cc0000] transition"
                >
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-3">
                    {/* Header info */}
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-200 pb-2.5">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase">Mã đơn: </span>
                        <strong className="text-sm font-black text-black font-mono">{order.id}</strong>
                        <span className="text-xs text-gray-400 ml-2">
                          ({new Date(order.createdAt).toLocaleDateString('vi-VN')})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id)}
                            className="bg-red-50 hover:bg-red-100 text-[#cc0000] text-[11px] font-bold px-2 py-0.5 rounded border border-red-200 transition"
                          >
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={`${item.id}_${item.size}`} className="flex items-center gap-3 bg-white p-2.5 rounded border border-gray-100">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded bg-gray-50" />
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

                    {/* Summary & Carrier Info */}
                    <div className="flex flex-wrap justify-between items-center text-xs pt-2 border-t border-gray-200 gap-2">
                      <div className="text-gray-600">
                        <span>Phương thức: </span>
                        <strong className="uppercase font-bold text-black">{order.payment}</strong>
                        {order.trackingCode && (
                          <span className="ml-3 bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                            Vận đơn: {order.trackingCode} ({order.shippingCarrier || 'ĐVVC'})
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Tổng thanh toán: </span>
                        <strong className="text-sm font-black text-[#cc0000]">
                          {order.total.toLocaleString('vi-VN')}₫
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
