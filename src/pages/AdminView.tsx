import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import {
  Product,
  Order,
  InventoryMovement,
  Coupon,
  Banner,
  StoreSettings,
  DashboardStats,
  OrderStatus,
} from '../types';

interface AdminViewProps {
  onNavigateHome: () => void;
}

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'categories'
  | 'coupons'
  | 'storefront'
  | 'reports';

export const AdminView: React.FC<AdminViewProps> = ({ onNavigateHome }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals & form state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'NIKE',
    priceValue: 450000,
    compareAtValue: 0,
    sku: '',
    image: '',
    description: '',
    sizes: [
      { label: '36', available: true, quantity: 4, sku: '' },
      { label: '37', available: true, quantity: 4, sku: '' },
      { label: '38', available: true, quantity: 4, sku: '' },
      { label: '39', available: true, quantity: 4, sku: '' },
      { label: '40', available: true, quantity: 4, sku: '' },
    ],
  });

  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<{ product: Product; size: string } | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(5);
  const [adjustType, setAdjustType] = useState<string>('import');
  const [adjustReason, setAdjustReason] = useState<string>('Nhập hàng lô mới');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateVal, setStatusUpdateVal] = useState<OrderStatus>('confirmed');
  const [statusNoteVal, setStatusNoteVal] = useState('');
  const [trackingCodeVal, setTrackingCodeVal] = useState('');
  const [shippingCarrierVal, setShippingCarrierVal] = useState('Giao Hàng Tiết Kiệm');

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'fixed' as 'fixed' | 'percentage',
    discountValue: 50000,
    minSpend: 500000,
    maxDiscount: 100000,
    usageLimit: 100,
    description: '',
    isActive: true,
  });

  // Filters for tabs
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, prodRes, ordRes, movRes, coupRes, banRes, setRes, userRes] = await Promise.all([
        api.getDashboardStats(),
        api.getProducts(),
        api.getOrders(),
        api.getInventoryMovements({ limit: 50 }),
        api.getCoupons(),
        api.getBanners(),
        api.getSettings(),
        api.getAdminUsers(),
      ]);

      setStats(statsRes);
      setProducts(prodRes.products || []);
      setOrders(ordRes.orders || []);
      setMovements(movRes.movements || []);
      setCoupons(coupRes.coupons || []);
      setBanners(banRes.banners || []);
      setSettings(setRes.settings || null);
      setCustomers(userRes.users || []);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tải dữ liệu quản trị', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#cc0000] text-3xl">
          <i className="ph ph-shield-warning"></i>
        </div>
        <h2 className="text-2xl font-black uppercase text-black mb-2">Truy Cập Bị Từ Chối</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium">
          Khu vực quản trị chỉ dành cho tài khoản có quyền ADMIN. Vui lòng đăng nhập bằng tài khoản quản trị viên.
        </p>
        <button
          onClick={onNavigateHome}
          className="w-full bg-black text-white font-bold py-3 uppercase text-xs rounded hover:bg-[#cc0000] transition"
        >
          Trở về trang chủ
        </button>
      </div>
    );
  }

  // --- Handlers: Product Management ---
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'NIKE',
      priceValue: 450000,
      compareAtValue: 0,
      sku: `PVN${Math.floor(100 + Math.random() * 900)}`,
      image: 'https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7856406356461-6c8cd4a5ccaa0f3ca927642af1d7f33b-1779514525734.jpg?v=1779514528587',
      description: 'Giày sneaker chính hãng PhuAnh Sneaker, đế cao su êm ái bền bỉ.',
      sizes: [
        { label: '36', available: true, quantity: 4, sku: '' },
        { label: '37', available: true, quantity: 4, sku: '' },
        { label: '38', available: true, quantity: 4, sku: '' },
        { label: '39', available: true, quantity: 4, sku: '' },
        { label: '40', available: true, quantity: 4, sku: '' },
      ],
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      priceValue: prod.priceValue,
      compareAtValue: prod.compareAtValue || 0,
      sku: prod.sku,
      image: prod.image,
      description: prod.description || '',
      sizes: prod.sizes && prod.sizes.length ? [...prod.sizes] : [
        { label: '36', available: true, quantity: 0, sku: '' },
        { label: '37', available: true, quantity: 0, sku: '' },
        { label: '38', available: true, quantity: 0, sku: '' },
        { label: '39', available: true, quantity: 0, sku: '' },
      ],
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productForm);
        showToast(`Đã cập nhật sản phẩm ${productForm.name}`, 'success');
      } else {
        await api.createProduct(productForm);
        showToast(`Đã thêm mới sản phẩm ${productForm.name}`, 'success');
      }
      setIsProductModalOpen(false);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu sản phẩm', 'error');
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${name}?`)) return;
    try {
      await api.deleteProduct(id);
      showToast(`Đã xóa sản phẩm ${name}`, 'success');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa sản phẩm', 'error');
    }
  };

  // --- Handlers: Inventory Adjustment ---
  const handleAdjustInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    try {
      await api.adjustInventory({
        productId: adjustTarget.product.id,
        size: adjustTarget.size,
        quantityDelta: adjustType === 'export' ? -Math.abs(adjustDelta) : Math.abs(adjustDelta),
        type: adjustType,
        reason: adjustReason,
      });
      showToast('Đã điều chỉnh kho thành công', 'success');
      setIsInventoryModalOpen(false);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi điều chỉnh kho', 'error');
    }
  };

  // --- Handlers: Order Management ---
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    try {
      await api.updateOrderStatus(selectedOrder.id, {
        status: statusUpdateVal,
        note: statusNoteVal,
        trackingCode: trackingCodeVal,
        shippingCarrier: shippingCarrierVal,
      });
      showToast(`Cập nhật đơn hàng ${selectedOrder.id} thành công`, 'success');
      setSelectedOrder(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật đơn hàng', 'error');
    }
  };

  // --- Handlers: Coupon Management ---
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveCoupon(couponForm);
      showToast(`Đã lưu mã ưu đãi ${couponForm.code}`, 'success');
      setIsCouponModalOpen(false);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu mã ưu đãi', 'error');
    }
  };

  // Export CSV Helper
  const exportToCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã xuất file ${filename}`, 'success');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Admin Top Navigation */}
      <div className="bg-[#111111] text-white px-4 lg:px-8 py-3.5 flex justify-between items-center border-b-2 border-[#cc0000] sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="font-black text-xl tracking-tighter uppercase flex items-center gap-2">
            <span className="text-white">PHUANH</span>
            <span className="text-[#cc0000]">ADMIN</span>
          </div>
          <span className="hidden md:inline-block bg-red-950 text-red-200 text-[10px] font-bold px-2 py-0.5 rounded border border-red-800 uppercase">
            Hệ Thống Quản Trị Cửa Hàng
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-300 font-semibold hidden sm:inline">
            Xin chào, <strong>{user.name}</strong>
          </span>
          <button
            onClick={onNavigateHome}
            className="bg-white/10 hover:bg-[#cc0000] text-white text-xs font-bold py-1.5 px-3 rounded uppercase transition flex items-center gap-1.5"
          >
            <i className="ph ph-arrow-square-out text-base"></i> Về Cửa Hàng
          </button>
        </div>
      </div>

      {/* Admin Tabs Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-20 shadow-sm overflow-x-auto hide-scrollbar">
        <div className="container mx-auto px-4 lg:px-8 flex space-x-1 sm:space-x-4 text-xs font-bold whitespace-nowrap">
          {[
            { id: 'dashboard', label: 'Tổng Quan', icon: 'ph-gauge' },
            { id: 'products', label: 'Sản Phẩm', icon: 'ph-sneaker' },
            { id: 'inventory', label: 'Quản Lý Kho', icon: 'ph-warehouse' },
            { id: 'orders', label: 'Đơn Hàng', icon: 'ph-receipt' },
            { id: 'customers', label: 'Khách Hàng', icon: 'ph-users' },
            { id: 'categories', label: 'Danh Mục', icon: 'ph-squares-four' },
            { id: 'coupons', label: 'Khuyến Mãi', icon: 'ph-ticket' },
            { id: 'storefront', label: 'Giao Diện & Cài Đặt', icon: 'ph-paint-brush' },
            { id: 'reports', label: 'Báo Cáo & CSV', icon: 'ph-chart-line-up' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`py-3.5 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#cc0000] text-[#cc0000] font-black'
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              <i className={`ph ${tab.icon} text-base`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {isLoading ? (
          <div className="py-20 text-center font-bold text-gray-400">Đang tải dữ liệu quản trị...</div>
        ) : (
          <>
            {/* ----------------- TAB 1: DASHBOARD ----------------- */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-8 animate-slide-in">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Tổng Doanh Thu</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-black mt-1">
                      {stats.totalRevenue.toLocaleString('vi-VN')}₫
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-bold mt-2">
                      Hôm nay: +{stats.revenueToday.toLocaleString('vi-VN')}₫
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Doanh Thu Tháng</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-[#cc0000] mt-1">
                      {stats.revenueMonth.toLocaleString('vi-VN')}₫
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium mt-2">
                      Năm nay: {stats.revenueYear.toLocaleString('vi-VN')}₫
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Đơn Hàng Mới</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-black mt-1">
                      {stats.ordersPending} / {stats.totalOrders}
                    </h3>
                    <p className="text-[11px] text-purple-600 font-bold mt-2">
                      Đang giao: {stats.ordersShipping} đơn
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase">Cảnh Báo Tồn Kho</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-amber-600 mt-1">
                      {stats.lowStockCount} SP sắp hết
                    </h3>
                    <p className="text-[11px] text-red-600 font-bold mt-2">
                      Hết hàng: {stats.outOfStockCount} SP
                    </p>
                  </div>
                </div>

                {/* 7-Day Revenue Bar Chart & Status Pipeline */}
                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
                  {/* Revenue Chart */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-sm uppercase mb-4 text-black flex items-center justify-between">
                      <span>Doanh Thu 7 Ngày Gần Nhất</span>
                      <span className="text-xs text-gray-400 font-normal">Đơn vị: VNĐ</span>
                    </h4>
                    <div className="flex items-end justify-between h-48 pt-6 border-b border-gray-200 gap-2">
                      {stats.revenueChart.map((bar) => {
                        const max = Math.max(1, ...stats.revenueChart.map((b) => b.revenue));
                        const pct = Math.max(10, Math.round((bar.revenue / max) * 100));
                        return (
                          <div key={bar.date} className="flex-1 flex flex-col items-center gap-2 group">
                            <span className="text-[10px] text-gray-500 font-bold opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                              {(bar.revenue / 1000).toFixed(0)}k
                            </span>
                            <div
                              style={{ height: `${pct}%` }}
                              className="w-full max-w-[36px] bg-black group-hover:bg-[#cc0000] rounded-t transition"
                            ></div>
                            <span className="text-[10px] font-bold text-gray-600">{bar.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Orders Pipeline Breakdown */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-sm uppercase mb-4 text-black">Tiến Trình Đơn Hàng</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2.5 rounded bg-amber-50 border border-amber-200">
                        <span className="text-xs font-bold text-amber-900">1. Chờ xử lý</span>
                        <strong className="text-base text-amber-900">{stats.ordersPending}</strong>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded bg-blue-50 border border-blue-200">
                        <span className="text-xs font-bold text-blue-900">2. Đã xác nhận</span>
                        <strong className="text-base text-blue-900">{stats.ordersConfirmed}</strong>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded bg-purple-50 border border-purple-200">
                        <span className="text-xs font-bold text-purple-900">3. Đang giao hàng</span>
                        <strong className="text-base text-purple-900">{stats.ordersShipping}</strong>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded bg-emerald-50 border border-emerald-200">
                        <span className="text-xs font-bold text-emerald-900">4. Đã hoàn thành</span>
                        <strong className="text-base text-emerald-900">{stats.ordersCompleted}</strong>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded bg-red-50 border border-red-200">
                        <span className="text-xs font-bold text-red-900">5. Đã hủy</span>
                        <strong className="text-base text-red-900">{stats.ordersCancelled}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best Selling Products */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-sm uppercase mb-4 text-black">Top Sản Phẩm Bán Chạy Nhất</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 font-bold text-gray-500 uppercase">
                          <th className="pb-3">Sản phẩm</th>
                          <th className="pb-3 text-center">Số lượng bán</th>
                          <th className="pb-3 text-right">Doanh thu thu về</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {stats.bestSellers.map((item) => (
                          <tr key={item.productId} className="hover:bg-gray-50">
                            <td className="py-3 flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded bg-gray-100" />
                              <strong className="text-black">{item.name}</strong>
                            </td>
                            <td className="py-3 text-center font-bold text-black">{item.totalQuantity} đôi</td>
                            <td className="py-3 text-right font-black text-[#cc0000]">
                              {item.totalRevenue.toLocaleString('vi-VN')}₫
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB 2: PRODUCTS ----------------- */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-slide-in">
                {/* Actions & Filters Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded border border-gray-200">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Tìm tên, SKU..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="border border-gray-300 px-3 py-2 text-xs font-semibold rounded w-48 focus:outline-none focus:border-black"
                    />
                    <select
                      value={productCatFilter}
                      onChange={(e) => setProductCatFilter(e.target.value)}
                      className="border border-gray-300 px-3 py-2 text-xs font-semibold rounded bg-white"
                    >
                      <option value="ALL">Tất cả thương hiệu</option>
                      {['TIGER', 'JD', 'NIKE', 'MLB', 'LV', 'PUMA', 'ADIDAS', 'NB', 'GUCCI', 'VANS', 'CHAMPION', 'KHÁC'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={openAddProductModal}
                    className="bg-black hover:bg-[#cc0000] text-white font-bold text-xs uppercase px-4 py-2.5 rounded transition flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <i className="ph ph-plus-circle text-base"></i> Thêm Sản Phẩm Mới
                  </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-gray-600">
                      <tr>
                        <th className="p-3.5">Mẫu giày</th>
                        <th className="p-3.5">Mã SKU</th>
                        <th className="p-3.5">Dòng</th>
                        <th className="p-3.5">Giá bán</th>
                        <th className="p-3.5 text-center">Tổng tồn</th>
                        <th className="p-3.5">Trạng thái</th>
                        <th className="p-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products
                        .filter((p) => {
                          const matchesCat = productCatFilter === 'ALL' || p.category === productCatFilter;
                          const matchesQ =
                            !productSearch ||
                            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.sku.toLowerCase().includes(productSearch.toLowerCase());
                          return matchesCat && matchesQ;
                        })
                        .map((prod) => {
                          const totalStock = prod.sizes.reduce((sum, s) => sum + s.quantity, 0);
                          return (
                            <tr key={prod.id} className="hover:bg-gray-50">
                              <td className="p-3.5 flex items-center gap-3">
                                <img src={prod.image} alt={prod.name} className="w-12 h-12 object-cover rounded bg-gray-100" />
                                <div>
                                  <strong className="text-black block">{prod.name}</strong>
                                  <span className="text-[11px] text-gray-400">{prod.sizes.length} kích cỡ</span>
                                </div>
                              </td>
                              <td className="p-3.5 font-mono font-bold text-black">{prod.sku}</td>
                              <td className="p-3.5 font-black uppercase text-[#cc0000]">{prod.category}</td>
                              <td className="p-3.5 font-bold text-black">{prod.price}</td>
                              <td className="p-3.5 text-center font-bold">
                                <span className={totalStock === 0 ? 'text-red-600 font-black' : totalStock < 5 ? 'text-amber-600' : 'text-black'}>
                                  {totalStock} đôi
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${prod.available ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                                  {prod.available ? 'Đang bán' : 'Hết hàng / Ẩn'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right space-x-2">
                                <button
                                  onClick={() => openEditProductModal(prod)}
                                  className="text-blue-600 hover:text-blue-800 font-bold"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="text-red-600 hover:text-red-800 font-bold"
                                >
                                  Xóa
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ----------------- TAB 3: INVENTORY ----------------- */}
            {activeTab === 'inventory' && (
              <div className="space-y-6 animate-slide-in">
                <div className="flex justify-between items-center bg-white p-4 rounded border border-gray-200">
                  <div>
                    <h3 className="font-bold text-sm uppercase text-black">Quản Lý Tồn Kho & Biến Động</h3>
                    <p className="text-xs text-gray-500">Mọi thao tác xuất/nhập/điều chỉnh đều được lưu lịch sử đối soát an toàn</p>
                  </div>
                  <button
                    onClick={() => {
                      const rows: (string | number)[][] = [
                        ['Mã SP', 'Tên sản phẩm', 'Thương hiệu', 'Size', 'Mã SKU biến thể', 'Số lượng tồn'],
                        ...products.flatMap((p) =>
                          p.sizes.map((s) => [p.id, p.name, p.category, s.label, s.sku, s.quantity])
                        ),
                      ];
                      exportToCSV(`phuanh_inventory_${new Date().toISOString().slice(0, 10)}.csv`, rows);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase px-3.5 py-2 rounded transition flex items-center gap-1.5"
                  >
                    <i className="ph ph-file-csv text-base"></i> Xuất Báo Cáo Kho CSV
                  </button>
                </div>

                {/* Variant Stock Quick Adjustment Grid */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-xs uppercase mb-3 text-black">Kiểm Kê Tồn Kho Biến Thể Từng Mẫu</h4>
                  <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                    {products.slice(0, 15).map((prod) => (
                      <div key={prod.id} className="border border-gray-200 p-3 rounded bg-gray-50/50">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <img src={prod.image} alt={prod.name} className="w-8 h-8 object-cover rounded" />
                            <strong className="text-xs text-black">{prod.name} ({prod.category})</strong>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">SKU: {prod.sku}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {prod.sizes.map((s) => (
                            <button
                              key={s.label}
                              type="button"
                              onClick={() => {
                                setAdjustTarget({ product: prod, size: s.label });
                                setIsInventoryModalOpen(true);
                              }}
                              className="border border-gray-300 hover:border-black px-2.5 py-1 rounded bg-white text-xs flex items-center gap-1.5 transition"
                            >
                              <span className="font-bold">Size {s.label}:</span>
                              <strong className={s.quantity === 0 ? 'text-red-600' : 'text-black'}>{s.quantity}</strong>
                              <i className="ph ph-pencil-simple text-gray-400"></i>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit Trail Movements Log */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-xs uppercase mb-3 text-black">Nhật Ký Biến Động Kho (Audit Log)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-gray-600">
                        <tr>
                          <th className="p-2.5">Thời gian</th>
                          <th className="p-2.5">Sản phẩm / Size</th>
                          <th className="p-2.5">Loại</th>
                          <th className="p-2.5 text-center">Biến động</th>
                          <th className="p-2.5">Tồn sau</th>
                          <th className="p-2.5">Lý do</th>
                          <th className="p-2.5">Người thực hiện</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {movements.map((m) => (
                          <tr key={m.id} className="hover:bg-gray-50">
                            <td className="p-2.5 text-gray-500">
                              {new Date(m.createdAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="p-2.5">
                              <strong className="text-black">{m.productName}</strong> (Size {m.size})
                            </td>
                            <td className="p-2.5 uppercase font-bold text-[10px]">
                              {m.type === 'sale' ? (
                                <span className="text-blue-700">Bán hàng</span>
                              ) : m.type === 'import' ? (
                                <span className="text-emerald-700">Nhập kho</span>
                              ) : m.type === 'cancel_restore' ? (
                                <span className="text-amber-700">Hoàn kho hủy đơn</span>
                              ) : (
                                <span className="text-purple-700">{m.type}</span>
                              )}
                            </td>
                            <td className="p-2.5 text-center font-black">
                              <span className={m.quantityDelta > 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold text-black">{m.newQuantity}</td>
                            <td className="p-2.5 text-gray-600">{m.reason}</td>
                            <td className="p-2.5 text-gray-500">{m.performedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB 4: ORDERS ----------------- */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-slide-in">
                {/* Orders Filter Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded border border-gray-200">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Tìm mã đơn, tên, SĐT..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="border border-gray-300 px-3 py-2 text-xs font-semibold rounded w-48 focus:outline-none focus:border-black"
                    />
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="border border-gray-300 px-3 py-2 text-xs font-semibold rounded bg-white"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="pending">Chờ xử lý</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="shipping">Đang giao</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const rows: (string | number)[][] = [
                        ['Mã đơn', 'Ngày tạo', 'Khách hàng', 'SĐT', 'Địa chỉ', 'PT thanh toán', 'Trạng thái', 'Tổng tiền (VND)'],
                        ...orders.map((o) => [
                          o.id,
                          o.createdAt,
                          o.customer.fullName,
                          o.customer.phone,
                          o.customer.address,
                          o.payment,
                          o.status,
                          o.total,
                        ]),
                      ];
                      exportToCSV(`phuanh_orders_${new Date().toISOString().slice(0, 10)}.csv`, rows);
                    }}
                    className="bg-black hover:bg-[#cc0000] text-white font-bold text-xs uppercase px-4 py-2.5 rounded transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="ph ph-file-csv text-base"></i> Xuất Đơn Hàng CSV
                  </button>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-gray-600">
                      <tr>
                        <th className="p-3.5">Mã đơn</th>
                        <th className="p-3.5">Khách hàng</th>
                        <th className="p-3.5">Sản phẩm</th>
                        <th className="p-3.5">Thanh toán</th>
                        <th className="p-3.5">Tổng tiền</th>
                        <th className="p-3.5">Trạng thái</th>
                        <th className="p-3.5 text-right">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders
                        .filter((o) => {
                          const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
                          const matchesSearch =
                            !orderSearch ||
                            o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                            o.customer.phone.includes(orderSearch);
                          return matchesStatus && matchesSearch;
                        })
                        .map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="p-3.5 font-mono font-black text-black">{order.id}</td>
                            <td className="p-3.5">
                              <strong className="text-black block">{order.customer.fullName}</strong>
                              <span className="text-[11px] text-gray-500">{order.customer.phone}</span>
                            </td>
                            <td className="p-3.5">
                              {order.items.map((i) => (
                                <span key={`${i.id}_${i.size}`} className="block text-gray-700 truncate max-w-xs">
                                  {i.name} (Size {i.size} x{i.quantity})
                                </span>
                              ))}
                            </td>
                            <td className="p-3.5 uppercase font-bold text-gray-700">{order.payment}</td>
                            <td className="p-3.5 font-black text-[#cc0000]">
                              {order.total.toLocaleString('vi-VN')}₫
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                order.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : order.status === 'cancelled'
                                  ? 'bg-red-50 text-red-800'
                                  : order.status === 'shipping'
                                  ? 'bg-purple-50 text-purple-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setStatusUpdateVal(order.status);
                                  setTrackingCodeVal(order.trackingCode || '');
                                  setShippingCarrierVal(order.shippingCarrier || 'Giao Hàng Tiết Kiệm');
                                }}
                                className="bg-gray-100 hover:bg-black hover:text-white px-2.5 py-1.5 rounded font-bold text-gray-800 transition"
                              >
                                Xử lý
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ----------------- TAB 5: CUSTOMERS ----------------- */}
            {activeTab === 'customers' && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4 animate-slide-in">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <h3 className="font-bold text-sm uppercase text-black">Danh Sách Khách Hàng ({customers.length})</h3>
                  <span className="text-xs text-gray-400">Bảo mật thông tin cá nhân theo tiêu chuẩn SSL</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 font-bold uppercase text-gray-600">
                      <tr>
                        <th className="p-3">Họ tên & Email</th>
                        <th className="p-3">Số điện thoại</th>
                        <th className="p-3">Địa chỉ</th>
                        <th className="p-3 text-center">Số đơn mua</th>
                        <th className="p-3 text-right">Tổng chi tiêu</th>
                        <th className="p-3 text-center">Trạng thái</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {customers.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <strong className="text-black block">{c.name}</strong>
                            <span className="text-gray-400">{c.email}</span>
                          </td>
                          <td className="p-3 text-gray-700">{c.phone || 'Chưa cập nhật'}</td>
                          <td className="p-3 text-gray-600 truncate max-w-xs">{c.address || 'Chưa có'}</td>
                          <td className="p-3 text-center font-bold">{c.totalOrders || 0}</td>
                          <td className="p-3 text-right font-black text-[#cc0000]">
                            {(c.totalSpent || 0).toLocaleString('vi-VN')}₫
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.isBlocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {c.isBlocked ? 'Đã khóa' : 'Hoạt động'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={async () => {
                                await api.updateAdminUser(c.id, { isBlocked: !c.isBlocked });
                                showToast(`Đã ${c.isBlocked ? 'mở khóa' : 'khóa'} tài khoản ${c.name}`, 'info');
                                loadAllData();
                              }}
                              className={`text-xs font-bold ${c.isBlocked ? 'text-emerald-700' : 'text-red-600'} hover:underline`}
                            >
                              {c.isBlocked ? 'Mở khóa' : 'Khóa TK'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ----------------- TAB 6: CATEGORIES & BRANDS ----------------- */}
            {activeTab === 'categories' && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4 animate-slide-in">
                <h3 className="font-bold text-sm uppercase text-black pb-2 border-b border-gray-200">
                  Danh Mục & Dòng Thương Hiệu
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['TIGER', 'JD', 'NIKE', 'MLB', 'LV', 'PUMA', 'ADIDAS', 'NB', 'GUCCI', 'VANS', 'CHAMPION', 'KHÁC'].map((b) => {
                    const count = products.filter((p) => p.category === b).length;
                    return (
                      <div key={b} className="border border-gray-200 p-4 rounded bg-gray-50/50">
                        <h4 className="font-black text-base uppercase text-black">{b}</h4>
                        <p className="text-xs text-gray-500 mt-1">{count} sản phẩm đang bán</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ----------------- TAB 7: COUPONS ----------------- */}
            {activeTab === 'coupons' && (
              <div className="space-y-6 animate-slide-in">
                <div className="flex justify-between items-center bg-white p-4 rounded border border-gray-200">
                  <h3 className="font-bold text-sm uppercase text-black">Mã Giảm Giá Khuyến Mãi ({coupons.length})</h3>
                  <button
                    onClick={() => {
                      setCouponForm({
                        code: `KM${Math.floor(10 + Math.random() * 90)}`,
                        discountType: 'fixed',
                        discountValue: 50000,
                        minSpend: 500000,
                        maxDiscount: 100000,
                        usageLimit: 200,
                        description: 'Khuyến mãi đặc biệt PhuAnh Sneaker',
                        isActive: true,
                      });
                      setIsCouponModalOpen(true);
                    }}
                    className="bg-black hover:bg-[#cc0000] text-white font-bold text-xs uppercase px-4 py-2 rounded transition flex items-center gap-1.5"
                  >
                    <i className="ph ph-plus"></i> Tạo Mã Khuyến Mãi
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {coupons.map((c) => (
                    <div key={c.code} className="bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-black text-base bg-red-50 text-[#cc0000] px-2.5 py-1 rounded">
                          {c.code}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                          {c.isActive ? 'Đang bật' : 'Tắt'}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-black">
                        {c.discountType === 'percentage'
                          ? `Giảm ${c.discountValue}% (tối đa ${(c.maxDiscount || 0).toLocaleString('vi-VN')}₫)`
                          : `Giảm ${c.discountValue.toLocaleString('vi-VN')}₫`}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Đơn tối thiểu: {(c.minSpend || 0).toLocaleString('vi-VN')}₫
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Đã sử dụng: <strong>{c.usageCount}</strong> / {c.usageLimit || 'Không giới hạn'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- TAB 8: STOREFRONT & SETTINGS ----------------- */}
            {activeTab === 'storefront' && settings && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6 animate-slide-in">
                <div>
                  <h3 className="font-bold text-sm uppercase text-black pb-2 border-b border-gray-200">
                    Cấu Hình Cửa Hàng & Thanh Toán
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 pt-4 text-xs">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Hotline cửa hàng</label>
                      <input
                        type="text"
                        value={settings.hotline}
                        onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Email liên hệ</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Thông báo đầu trang</label>
                      <input
                        type="text"
                        value={settings.announcementText}
                        onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Ngân hàng thụ hưởng</label>
                      <input
                        type="text"
                        value={settings.bankName}
                        onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                        className="w-full border border-gray-300 p-2 rounded"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Số tài khoản chuyển khoản</label>
                      <input
                        type="text"
                        value={settings.bankAccount}
                        onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                        className="w-full border border-gray-300 p-2 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        value={settings.bankOwner}
                        onChange={(e) => setSettings({ ...settings, bankOwner: e.target.value })}
                        className="w-full border border-gray-300 p-2 rounded font-bold"
                      />
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await api.updateSettings(settings);
                      showToast('Đã lưu cấu hình cửa hàng', 'success');
                    }}
                    className="mt-4 bg-[#cc0000] text-white font-bold text-xs uppercase px-5 py-2.5 rounded hover:bg-black transition"
                  >
                    Lưu Thay Đổi Cài Đặt
                  </button>
                </div>

                {/* Banners Manager */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-bold text-xs uppercase text-black mb-3">Quản Lý Banner Trang Chủ ({banners.length})</h4>
                  <div className="space-y-3">
                    {banners.map((b) => (
                      <div key={b.id} className="flex gap-4 border border-gray-200 p-3 rounded items-center bg-gray-50/50">
                        <img src={b.image} alt={b.title} className="w-24 h-14 object-cover rounded bg-black shrink-0" />
                        <div className="flex-1 min-w-0 text-xs">
                          <strong className="block text-black truncate">{b.title}</strong>
                          <span className="text-gray-500">{b.subtitle}</span>
                        </div>
                        <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded">
                          Thứ tự: {b.order}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB 9: REPORTS ----------------- */}
            {activeTab === 'reports' && stats && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6 animate-slide-in">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <h3 className="font-bold text-sm uppercase text-black">Báo Cáo Hoạt Động & Xuất Dữ Liệu</h3>
                  <span className="text-xs text-gray-500">Định nghĩa doanh thu thống nhất không tính đơn đã hủy</span>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 p-4 rounded bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase">Doanh thu tuần này</p>
                    <h4 className="text-xl font-black text-black mt-1">{stats.revenueWeek.toLocaleString('vi-VN')}₫</h4>
                  </div>
                  <div className="border border-gray-200 p-4 rounded bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase">Doanh thu tháng này</p>
                    <h4 className="text-xl font-black text-[#cc0000] mt-1">{stats.revenueMonth.toLocaleString('vi-VN')}₫</h4>
                  </div>
                  <div className="border border-gray-200 p-4 rounded bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase">Tỷ lệ hủy đơn</p>
                    <h4 className="text-xl font-black text-gray-700 mt-1">
                      {stats.totalOrders > 0 ? ((stats.ordersCancelled / stats.totalOrders) * 100).toFixed(1) : 0}%
                    </h4>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const rows: (string | number)[][] = [
                        ['Mã đơn', 'Ngày', 'Khách hàng', 'SĐT', 'Phương thức', 'Trạng thái', 'Doanh thu (VND)'],
                        ...orders.map((o) => [o.id, o.createdAt, o.customer.fullName, o.customer.phone, o.payment, o.status, o.total]),
                      ];
                      exportToCSV('bao_cao_doanh_thu.csv', rows);
                    }}
                    className="bg-black hover:bg-[#cc0000] text-white text-xs font-bold uppercase px-4 py-2.5 rounded transition flex items-center gap-1.5"
                  >
                    <i className="ph ph-download-simple"></i> Xuất Báo Cáo Doanh Thu CSV
                  </button>
                  <button
                    onClick={() => {
                      const rows: (string | number)[][] = [
                        ['Mã SP', 'Tên sản phẩm', 'Thương hiệu', 'Size', 'Mã SKU', 'Tồn kho'],
                        ...products.flatMap((p) => p.sizes.map((s) => [p.id, p.name, p.category, s.label, s.sku, s.quantity])),
                      ];
                      exportToCSV('bao_cao_ton_kho.csv', rows);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase px-4 py-2.5 rounded transition flex items-center gap-1.5"
                  >
                    <i className="ph ph-warehouse"></i> Xuất Báo Cáo Tồn Kho CSV
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- MODAL: ADD / EDIT PRODUCT --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <h3 className="font-black text-lg uppercase text-black">
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Mới Sản Phẩm Sneaker'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-xl p-1">✕</button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Dòng thương hiệu *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded bg-white"
                  >
                    {['TIGER', 'JD', 'NIKE', 'MLB', 'LV', 'PUMA', 'ADIDAS', 'NB', 'GUCCI', 'VANS', 'CHAMPION', 'KHÁC'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    value={productForm.priceValue}
                    onChange={(e) => setProductForm({ ...productForm, priceValue: Number(e.target.value) })}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Mã SKU chính *</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    required
                    className="w-full border border-gray-300 p-2 rounded font-mono uppercase"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">URL Hình ảnh</label>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
              </div>

              {/* Sizes and stock */}
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-gray-800 font-bold mb-2">Số lượng tồn kho theo Size</label>
                <div className="grid grid-cols-5 gap-2">
                  {productForm.sizes.map((s, idx) => (
                    <div key={s.label} className="border border-gray-200 p-2 rounded bg-gray-50 text-center">
                      <span className="font-bold block mb-1">Size {s.label}</span>
                      <input
                        type="number"
                        min="0"
                        value={s.quantity}
                        onChange={(e) => {
                          const updated = [...productForm.sizes];
                          updated[idx] = { ...s, quantity: Number(e.target.value), available: Number(e.target.value) > 0 };
                          setProductForm({ ...productForm, sizes: updated });
                        }}
                        className="w-full border border-gray-300 p-1 text-center font-bold text-xs bg-white rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#cc0000] hover:bg-black text-white px-5 py-2 rounded uppercase font-bold"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: INVENTORY ADJUSTMENT --- */}
      {isInventoryModalOpen && adjustTarget && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl p-6">
            <h3 className="font-black text-base uppercase text-black mb-1">
              Điều Chỉnh Tồn Kho Biến Thể
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {adjustTarget.product.name} (Size {adjustTarget.size})
            </p>

            <form onSubmit={handleAdjustInventory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Hình thức thao tác</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded bg-white font-bold"
                >
                  <option value="import">Nhập kho (+ cộng thêm)</option>
                  <option value="export">Xuất kho (- trừ bớt)</option>
                  <option value="adjustment">Điều chỉnh đối soát</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Số lượng đôi</label>
                <input
                  type="number"
                  min="1"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  required
                  className="w-full border border-gray-300 p-2 rounded font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Lý do điều chỉnh (Bắt buộc để lưu nhật ký)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hàng nhập lô xưởng mới, kiểm kê thực tế..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#cc0000] hover:bg-black text-white px-5 py-2 rounded uppercase font-bold"
                >
                  Xác Nhận Lưu Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ORDER DETAILS & STATUS UPDATE --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-black text-lg uppercase text-black">
                  Chi Tiết Đơn Hàng: {selectedOrder.id}
                </h3>
                <p className="text-xs text-gray-400">
                  Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-xl p-1">✕</button>
            </div>

            {/* Customer info */}
            <div className="bg-gray-50 p-3.5 rounded text-xs space-y-1 border border-gray-200">
              <p>Khách hàng: <strong>{selectedOrder.customer.fullName}</strong> ({selectedOrder.customer.phone})</p>
              <p>Địa chỉ: <strong>{selectedOrder.customer.address}, {selectedOrder.customer.city}</strong></p>
              {selectedOrder.customer.notes && <p>Ghi chú khách: <em>{selectedOrder.customer.notes}</em></p>}
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase text-gray-600">Sản phẩm</h4>
              {selectedOrder.items.map((i) => (
                <div key={`${i.id}_${i.size}`} className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <img src={i.image} alt={i.name} className="w-10 h-10 object-cover rounded" />
                    <div>
                      <strong className="text-black block">{i.name}</strong>
                      <span className="text-gray-500">Size: {i.size} | SL: {i.quantity}</span>
                    </div>
                  </div>
                  <strong className="text-black font-mono">
                    {(i.priceValue * i.quantity).toLocaleString('vi-VN')}₫
                  </strong>
                </div>
              ))}
            </div>

            {/* Status change actions */}
            <div className="pt-3 border-t border-gray-200 space-y-3 text-xs">
              <h4 className="font-bold uppercase text-black">Cập nhật tiến trình đơn hàng</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Trạng thái đơn</label>
                  <select
                    value={statusUpdateVal}
                    onChange={(e) => setStatusUpdateVal(e.target.value as OrderStatus)}
                    className="w-full border border-gray-300 p-2 rounded bg-white font-bold"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao hàng</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Hủy đơn (Tự động hoàn kho)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Mã vận đơn (Tracking Code)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: VNP-998214"
                    value={trackingCodeVal}
                    onChange={(e) => setTrackingCodeVal(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Đơn vị vận chuyển</label>
                  <input
                    type="text"
                    value={shippingCarrierVal}
                    onChange={(e) => setShippingCarrierVal(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Ghi chú cập nhật</label>
                  <input
                    type="text"
                    placeholder="Ghi chú cho khách hoặc nội bộ..."
                    value={statusNoteVal}
                    onChange={(e) => setStatusNoteVal(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 px-3 rounded flex items-center gap-1.5"
              >
                <i className="ph ph-printer"></i> In Hóa Đơn
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="bg-gray-100 text-gray-800 text-xs font-bold py-2 px-4 rounded"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleUpdateOrderStatus}
                  className="bg-[#cc0000] text-white text-xs font-bold uppercase py-2 px-5 rounded hover:bg-black transition"
                >
                  Lưu Cập Nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE COUPON --- */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl p-6">
            <h3 className="font-black text-base uppercase text-black mb-4">
              Tạo Mã Khuyến Mãi Mới
            </h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Mã Code (In hoa) *</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full border border-gray-300 p-2 rounded font-mono font-bold uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Loại giảm</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full border border-gray-300 p-2 rounded bg-white"
                  >
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                    <option value="percentage">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    required
                    className="w-full border border-gray-300 p-2 rounded font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Đơn tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  value={couponForm.minSpend}
                  onChange={(e) => setCouponForm({ ...couponForm, minSpend: Number(e.target.value) })}
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Giới hạn số lượt dùng</label>
                <input
                  type="number"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })}
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#cc0000] text-white px-5 py-2 rounded uppercase font-bold"
                >
                  Lưu Mã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
