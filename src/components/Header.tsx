import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'home' | 'collection' | 'account' | 'admin', category?: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onSearch,
  searchQuery,
}) => {
  const { user, isAdmin, openLoginModal, logout } = useAuth();
  const { itemCount, openCheckout } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      onSearch(localSearch.trim());
      onNavigate('collection', 'ALL');
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#111111] text-white text-[11px] md:text-xs font-semibold py-2 px-4 flex justify-between items-center relative z-50">
        <div className="hidden md:flex space-x-6 items-center">
          <span className="hover:text-gray-300 transition flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <i className="ph ph-map-pin mr-1 text-base text-[#cc0000]"></i>
            PhuAnh Sneaker
          </span>
          <a href="tel:0397233999" className="hover:text-gray-300 transition flex items-center">
            <i className="ph ph-phone mr-1 text-base text-[#cc0000]"></i>
            Hotline: 0397233999
          </a>
        </div>
        <div className="w-full md:w-auto text-center font-bold tracking-wider text-[#cc0000] uppercase animate-pulse">
          SẢN PHẨM MỚI CẬP NHẬT TẠI PHUANH SNEAKER
        </div>
        <div className="hidden md:flex space-x-4 items-center">
          <a href="mailto:phuanhsneaker@gmail.com" className="hover:text-gray-300 transition">
            phuanhsneaker@gmail.com
          </a>
          <span className="text-gray-600">|</span>
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 font-semibold cursor-pointer" onClick={() => onNavigate('account')}>
                {user.name}
              </span>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="bg-[#cc0000] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase hover:bg-red-700"
                >
                  Admin
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => openLoginModal('login')}
              className="hover:text-gray-300 transition cursor-pointer font-bold"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 left-0 right-0 w-full bg-white shadow-sm z-40 border-b border-gray-100 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-3 md:py-4'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-2xl text-black focus:outline-none p-1 hover:text-[#cc0000] transition"
            aria-label="Menu"
          >
            <i className="ph ph-list"></i>
          </button>

          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex-shrink-0 flex items-center cursor-pointer text-left"
          >
            <div className="font-black text-2xl md:text-3xl tracking-tighter text-black uppercase flex flex-col leading-none">
              <span>PHUANH</span>
              <span className="text-[#cc0000] text-xl md:text-2xl mt-0.5">SNEAKER</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 font-bold text-[13px] tracking-wide relative">
            <button
              onClick={() => onNavigate('home')}
              className={`nav-link py-3 transition uppercase ${
                currentView === 'home' ? 'text-[#cc0000] border-b-2 border-[#cc0000]' : 'text-black hover:text-[#cc0000]'
              }`}
            >
              TRANG CHỦ
            </button>

            {/* Mega Menu Dropdown */}
            <div className="group py-3 cursor-pointer relative">
              <button
                onClick={() => onNavigate('collection', 'ALL')}
                className="nav-link text-black hover:text-[#cc0000] transition flex items-center uppercase"
              >
                SẢN PHẨM <i className="ph ph-caret-down ml-1 text-gray-400 group-hover:rotate-180 transition"></i>
              </button>
              <div className="mega-menu absolute top-full left-0 w-[580px] bg-white border border-gray-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50 flex p-6 gap-8">
                <div className="w-1/3">
                  <h4 className="font-black text-sm mb-4 border-b pb-2 text-black">DÒNG SẢN PHẨM</h4>
                  <ul className="space-y-2.5 text-sm font-medium text-gray-600">
                    {['TIGER', 'JD', 'NIKE', 'MLB', 'LV', 'PUMA', 'ADIDAS', 'NB', 'VANS'].map((brand) => (
                      <li key={brand}>
                        <button
                          onClick={() => onNavigate('collection', brand)}
                          className="hover:text-[#cc0000] hover:translate-x-1 block transition transform text-left w-full font-semibold"
                        >
                          {brand}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-2/3 relative overflow-hidden rounded group/img">
                  <img
                    src="https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737"
                    className="w-full h-full object-cover transform transition duration-700 group-hover/img:scale-105"
                    alt="PhuAnh Sneaker"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-white font-black text-lg tracking-widest border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition">
                      PHUANH SNEAKER
                    </span>
                    <button
                      onClick={() => onNavigate('collection', 'ALL')}
                      className="mt-3 text-xs text-white underline font-bold"
                    >
                      Xem toàn bộ 424 sản phẩm
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('collection', 'TIGER')}
              className="nav-link text-black hover:text-[#cc0000] transition py-3 uppercase"
            >
              TIGER
            </button>
            <button
              onClick={() => onNavigate('collection', 'JD')}
              className="nav-link text-black hover:text-[#cc0000] transition py-3 uppercase"
            >
              JD
            </button>
            <button
              onClick={() => onNavigate('collection', 'NIKE')}
              className="nav-link text-black hover:text-[#cc0000] transition py-3 uppercase"
            >
              NIKE
            </button>
            <button
              onClick={() => onNavigate('collection', 'MLB')}
              className="nav-link text-black hover:text-[#cc0000] transition py-3 uppercase"
            >
              MLB
            </button>
            <button
              onClick={() => onNavigate('collection', 'LV')}
              className="nav-link text-black hover:text-[#cc0000] transition py-3 uppercase"
            >
              LV
            </button>
            <button
              onClick={() => onNavigate('collection', 'ALL')}
              className="nav-link text-red-600 hover:text-red-800 transition py-3 flex items-center uppercase font-black"
            >
              <i className="ph-fill ph-fire text-lg mr-1 text-red-600"></i> XEM TẤT CẢ
            </button>
          </nav>

          {/* Right Icons & Search */}
          <div className="flex items-center space-x-3 md:space-x-5">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative group">
              <input
                type="text"
                placeholder="Tìm sản phẩm, SKU..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="bg-gray-100 text-sm font-medium rounded-full py-2.5 pl-5 pr-10 focus:outline-none focus:ring-1 focus:ring-black w-44 lg:w-56 transition-all duration-300 focus:w-64 border border-transparent focus:bg-white"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black cursor-pointer"
                aria-label="Tìm kiếm"
              >
                <i className="ph ph-magnifying-glass text-lg"></i>
              </button>
            </form>

            {/* Mobile Search Button */}
            <button
              onClick={() => onNavigate('collection', 'ALL')}
              className="md:hidden text-2xl text-black hover:text-[#cc0000] p-1"
              aria-label="Tìm kiếm"
            >
              <i className="ph ph-magnifying-glass"></i>
            </button>

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!user) {
                    openLoginModal('login');
                  } else {
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }
                }}
                className="text-2xl text-black hover:text-[#cc0000] transition flex items-center p-1"
                aria-label="Tài khoản"
              >
                {user ? (
                  <i className="ph-fill ph-user-circle text-2xl text-[#cc0000]"></i>
                ) : (
                  <i className="ph ph-user text-2xl"></i>
                )}
              </button>

              {user && isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 py-2 animate-slide-in"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold">Tài khoản</p>
                    <p className="text-sm font-bold text-black truncate">{user.name}</p>
                    <span className="inline-block bg-gray-100 text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-600 uppercase mt-0.5">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('account');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#cc0000] flex items-center"
                  >
                    <i className="ph ph-user mr-3 text-lg"></i>Hồ sơ cá nhân
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('account');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#cc0000] flex items-center"
                  >
                    <i className="ph ph-package mr-3 text-lg"></i>Đơn hàng của tôi
                  </button>

                  {isAdmin && (
                    <>
                      <div className="my-1 border-t border-gray-100"></div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#cc0000] hover:bg-red-50 flex items-center"
                      >
                        <i className="ph-fill ph-lightning mr-3 text-lg text-[#cc0000]"></i>Admin Panel
                      </button>
                    </>
                  )}

                  <div className="my-1 border-t border-gray-100"></div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#cc0000] flex items-center"
                  >
                    <i className="ph ph-sign-out mr-3 text-lg"></i>Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={openCheckout}
              className="text-2xl text-black hover:text-[#cc0000] transition relative flex items-center p-1 cursor-pointer"
              aria-label="Giỏ hàng"
            >
              <i className="ph ph-shopping-bag"></i>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#cc0000] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm">
          <div className="bg-white w-[85%] max-w-sm h-full shadow-2xl flex flex-col animate-slide-in">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <div className="font-black text-xl tracking-tighter text-black uppercase flex flex-col leading-none">
                <span>PHUANH</span>
                <span className="text-[#cc0000] text-lg">SNEAKER</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl text-gray-600 hover:text-[#cc0000] bg-gray-200 rounded-full p-1"
              >
                <i className="ph ph-x"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col py-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="px-5 py-3.5 border-b border-gray-100 text-sm font-bold text-left text-[#cc0000]"
                >
                  TRANG CHỦ
                </button>
                {['ALL', 'TIGER', 'JD', 'NIKE', 'MLB', 'LV', 'PUMA', 'ADIDAS', 'NB', 'VANS'].map((brand) => (
                  <button
                    key={brand}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('collection', brand);
                    }}
                    className="px-5 py-3.5 border-b border-gray-100 text-sm font-bold flex justify-between items-center hover:bg-gray-50 text-left"
                  >
                    <span>{brand === 'ALL' ? 'TẤT CẢ SẢN PHẨM' : brand}</span>
                    <i className="ph ph-caret-right text-gray-400"></i>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t space-y-2">
              {user ? (
                <>
                  <div className="pb-2 mb-2 border-b border-gray-200">
                    <p className="text-xs text-gray-500 font-bold">Đã đăng nhập</p>
                    <p className="font-bold text-sm text-black">{user.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('account');
                    }}
                    className="w-full text-left text-sm font-bold text-gray-700 py-2 flex items-center hover:text-[#cc0000]"
                  >
                    <i className="ph ph-user mr-3 text-lg"></i> Hồ sơ & Đơn hàng
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onNavigate('admin');
                      }}
                      className="w-full text-left text-sm font-bold text-[#cc0000] py-2 flex items-center"
                    >
                      <i className="ph-fill ph-lightning mr-3 text-lg"></i> Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left text-sm font-bold text-gray-600 py-2 flex items-center hover:text-[#cc0000]"
                  >
                    <i className="ph ph-sign-out mr-3 text-lg"></i> Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openLoginModal('login');
                  }}
                  className="w-full bg-[#cc0000] text-white font-bold py-3 uppercase text-xs tracking-wider rounded text-center flex items-center justify-center gap-2"
                >
                  <i className="ph ph-user text-lg"></i> Đăng nhập / Đăng ký
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
