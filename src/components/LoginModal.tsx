import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, loginModalTab, closeLoginModal, login, register, openLoginModal } = useAuth();
  const { showToast } = useNotification();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regTerms, setRegTerms] = useState(true);

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Vui lòng nhập email và mật khẩu', 'error');
      return;
    }
    setIsSubmitting(true);
    await login(loginEmail, loginPassword);
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      showToast('Vui lòng điền đầy đủ các trường bắt buộc', 'error');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    if (regPassword.length < 8 || !/[a-zA-Z]/.test(regPassword) || !/[0-9]/.test(regPassword)) {
      showToast('Mật khẩu phải có ít nhất 8 ký tự, bao gồm cả chữ cái và chữ số', 'error');
      return;
    }
    if (!regTerms) {
      showToast('Vui lòng đồng ý với điều khoản sử dụng', 'error');
      return;
    }

    setIsSubmitting(true);
    await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
    });
    setIsSubmitting(false);
  };

  const fillDemoAdmin = () => {
    setLoginEmail('admin@phuanhsneaker.local');
    setLoginPassword('Admin@123456');
    showToast('Đã điền thông tin tài khoản Admin', 'info');
  };

  const fillDemoCustomer = () => {
    setLoginEmail('customer@gmail.com');
    setLoginPassword('Customer@123');
    showToast('Đã điền thông tin tài khoản Khách hàng', 'info');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeLoginModal}
      ></div>

      {/* Modal Container */}
      <div className="relative z-10 bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden animate-slide-in">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#111111] to-[#cc0000] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">PhuAnh</h2>
            <p className="text-red-200 text-xs font-bold tracking-widest uppercase">SNEAKER AUTHENTIC</p>
          </div>
          <button
            onClick={closeLoginModal}
            className="text-2xl text-white/80 hover:text-white transition p-1"
            aria-label="Đóng"
          >
            <i className="ph ph-x"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={() => openLoginModal('login')}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition flex items-center justify-center gap-2 ${
              loginModalTab === 'login'
                ? 'text-[#cc0000] border-[#cc0000] bg-white'
                : 'text-gray-500 border-transparent hover:text-black'
            }`}
          >
            <i className="ph ph-sign-in"></i> Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => openLoginModal('register')}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition flex items-center justify-center gap-2 ${
              loginModalTab === 'register'
                ? 'text-[#cc0000] border-[#cc0000] bg-white'
                : 'text-gray-500 border-transparent hover:text-black'
            }`}
          >
            <i className="ph ph-user-plus"></i> Đăng ký
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {loginModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@phuanhsneaker.local"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#cc0000] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#cc0000] transition"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center text-xs font-medium text-gray-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mr-2 accent-[#cc0000]" />
                  Ghi nhớ đăng nhập
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Vui lòng liên hệ hotline: 0397233999 để khôi phục mật khẩu', 'info')}
                  className="text-xs font-bold text-[#cc0000] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#cc0000] text-white font-black py-3 rounded-lg uppercase tracking-wider hover:bg-red-700 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <i className="ph ph-sign-in text-lg"></i>
                {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập ngay'}
              </button>

              {/* Quick Fill Demo Credentials */}
              <div className="pt-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500 mb-2 font-semibold">Tài khoản demo có sẵn:</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={fillDemoAdmin}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold py-1.5 px-2 rounded border border-gray-300 transition"
                  >
                    👑 Admin (Quản trị)
                  </button>
                  <button
                    type="button"
                    onClick={fillDemoCustomer}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold py-1.5 px-2 rounded border border-gray-300 transition"
                  >
                    👟 Khách hàng
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#cc0000] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#cc0000] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="0901234567"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#cc0000] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#cc0000] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Xác nhận mật khẩu *
                </label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#cc0000] transition"
                />
              </div>

              <label className="flex items-start text-xs font-medium text-gray-600 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regTerms}
                  onChange={(e) => setRegTerms(e.target.checked)}
                  className="mr-2 mt-0.5 accent-[#cc0000]"
                />
                <span>
                  Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật của PhuAnh Sneaker
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#cc0000] text-white font-black py-3 rounded-lg uppercase tracking-wider hover:bg-red-700 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <i className="ph ph-user-plus text-lg"></i>
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-3.5 text-center border-t border-gray-100">
          <p className="text-[11px] text-gray-500 font-medium">
            🔒 Mật khẩu được mã hóa an toàn SHA-256. Không lưu mật khẩu thô.
          </p>
        </div>
      </div>
    </div>
  );
};
