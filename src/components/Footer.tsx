import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

interface FooterProps {
  onNavigate: (view: 'home' | 'collection' | 'account' | 'admin', category?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const { showToast } = useNotification();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Cảm ơn bạn đã đăng ký nhận thông tin khuyến mãi!', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#111111] text-gray-300 pt-16 pb-8 border-t-[6px] border-[#cc0000]">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: About */}
          <div>
            <div className="font-black text-2xl tracking-tighter text-white uppercase flex flex-col leading-none mb-6">
              <span>PHUANH</span>
              <span className="text-[#cc0000] text-xl">SNEAKER</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              PhuAnh Sneaker cung cấp các mẫu sneaker đang cập nhật, nổi bật với nhiều lựa chọn Onitsuka Tiger, Jordan JD, Nike SB58, MLB Korea, Louis Vuitton, Vans và New Balance chính hãng chất lượng cao.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-[#cc0000] transition"
                aria-label="Facebook"
              >
                <i className="ph-fill ph-facebook-logo text-xl"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-[#cc0000] transition"
                aria-label="Instagram"
              >
                <i className="ph-fill ph-instagram-logo text-xl"></i>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-[#cc0000] transition"
                aria-label="YouTube"
              >
                <i className="ph-fill ph-youtube-logo text-xl"></i>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-[#cc0000] transition"
                aria-label="TikTok"
              >
                <i className="ph-fill ph-tiktok-logo text-xl"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Links */}
          <div>
            <h4 className="text-white font-bold uppercase mb-6 tracking-wide text-sm border-l-2 border-[#cc0000] pl-3">
              Về PhuAnh Sneaker
            </h4>
            <ul className="space-y-3 text-sm text-gray-400 font-medium">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#cc0000] transition flex items-center text-left"
                >
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Trang chủ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('collection', 'ALL')}
                  className="hover:text-[#cc0000] transition flex items-center text-left"
                >
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Danh mục sản phẩm
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('collection', 'TIGER')}
                  className="hover:text-[#cc0000] transition flex items-center text-left"
                >
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Bộ sưu tập Onitsuka Tiger
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('collection', 'JD')}
                  className="hover:text-[#cc0000] transition flex items-center text-left"
                >
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Bộ sưu tập Jordan JD
                </button>
              </li>
              <li>
                <a href="tel:0397233999" className="hover:text-[#cc0000] transition flex items-center text-left">
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Hotline hỗ trợ: 0397233999
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy */}
          <div>
            <h4 className="text-white font-bold uppercase mb-6 tracking-wide text-sm border-l-2 border-[#cc0000] pl-3">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3 text-sm text-gray-400 font-medium">
              <li>
                <span className="hover:text-[#cc0000] transition flex items-center cursor-pointer">
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Hướng dẫn chọn size giày
                </span>
              </li>
              <li>
                <span className="hover:text-[#cc0000] transition flex items-center cursor-pointer">
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Chính sách giao hàng toàn quốc
                </span>
              </li>
              <li>
                <span className="hover:text-[#cc0000] transition flex items-center cursor-pointer">
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Chính sách đổi trả & Hoàn tiền 7 ngày
                </span>
              </li>
              <li>
                <span className="hover:text-[#cc0000] transition flex items-center cursor-pointer">
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Bảo hành keo chỉ 6 tháng
                </span>
              </li>
              <li>
                <span className="hover:text-[#cc0000] transition flex items-center cursor-pointer">
                  <i className="ph ph-caret-right mr-2 text-xs"></i> Khách hàng thân thiết (VIP Club)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-white font-bold uppercase mb-6 tracking-wide text-sm border-l-2 border-[#cc0000] pl-3">
              Đăng ký nhận tin
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Đăng ký nhận thông tin sản phẩm mới và mã ưu đãi giảm giá độc quyền từ{' '}
              <span className="text-white font-bold">PhuAnh Sneaker</span>.
            </p>
            <form onSubmit={handleSubscribe} className="flex mb-6 shadow-lg rounded overflow-hidden">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 text-white px-4 py-3 w-full focus:outline-none focus:bg-gray-700 text-sm placeholder-gray-500"
              />
              <button
                type="submit"
                className="bg-[#cc0000] text-white px-5 py-3 font-bold hover:bg-red-700 transition uppercase text-sm whitespace-nowrap cursor-pointer"
                aria-label="Gửi đăng ký"
              >
                <i className="ph-fill ph-paper-plane-right text-lg"></i>
              </button>
            </form>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-gray-500 font-semibold">Bảo mật thông tin:</span>
              <span className="bg-gray-800 text-gray-300 text-[10px] font-bold px-2 py-1 rounded">SSL 256-Bit</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium">
          <p>&copy; 2026 PHUANH SNEAKER. Mọi quyền được bảo lưu.</p>
          <div className="flex space-x-3 mt-4 md:mt-0 items-center">
            <span>Thanh toán an toàn:</span>
            <span className="font-bold text-gray-300 tracking-wider">COD / VIETQR / VISA / MASTERCARD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
