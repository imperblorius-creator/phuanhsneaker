import React from 'react';
import { Product, Banner } from '../types';
import { HeroCarousel } from '../components/HeroCarousel';
import { BrandRibbon } from '../components/BrandRibbon';
import { ProductCard } from '../components/ProductCard';

interface HomeViewProps {
  banners: Banner[];
  products: Product[];
  isLoading: boolean;
  onNavigate: (view: 'home' | 'collection' | 'account' | 'admin', category?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  banners,
  products,
  isLoading,
  onNavigate,
  onSelectProduct,
}) => {
  const newArrivals = products.slice(0, 8);
  const featured = products.filter((p) => p.isFeatured).slice(0, 8);
  const displayProducts = featured.length >= 4 ? featured : newArrivals;

  return (
    <div className="bg-white">
      {/* Hero Carousel */}
      <HeroCarousel banners={banners} onNavigate={onNavigate} />

      {/* Brand Ribbon */}
      <BrandRibbon onSelectBrand={(brand) => onNavigate('collection', brand)} />

      {/* Sản phẩm mới / Bán chạy nhất */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 border-b border-gray-200 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#cc0000] text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                  HOT DEALS
                </span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  PhuAnh Sneaker
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-black">
                Sản Phẩm Mới & Nổi Bật
              </h2>
              <p className="text-gray-500 font-medium text-xs md:text-sm mt-1">
                Danh sách các mẫu giày sneaker hot nhất đang có sẵn tại PhuAnh Sneaker.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('collection', 'ALL')}
                className="bg-black hover:bg-[#cc0000] text-white text-xs font-bold px-4 py-2.5 uppercase tracking-wider transition flex items-center gap-1.5"
              >
                Xem tất cả ({products.length}) <i className="ph ph-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 p-4 rounded animate-pulse">
                  <div className="bg-gray-200 aspect-square mb-4 rounded"></div>
                  <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
                  <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onSelectProduct(product)}
                  isNew={product.isNewArrival}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotional Sneaker Highlight Banner */}
      <section className="py-12 bg-black text-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <span className="bg-[#cc0000] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest inline-block mb-3">
              Ưu đãi đặc biệt
            </span>
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">
              Mã Giảm Giá Đến 100.000₫
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">
              Nhập mã <strong className="text-white font-mono bg-gray-800 px-2 py-0.5 border border-gray-700">PHUANH50</strong> hoặc{' '}
              <strong className="text-white font-mono bg-gray-800 px-2 py-0.5 border border-gray-700">SNEAKER10</strong> khi thanh toán để nhận ngay ưu đãi hấp dẫn. Miễn phí vận chuyển toàn quốc cho đơn từ 1.000.000₫.
            </p>
            <button
              onClick={() => onNavigate('collection', 'ALL')}
              className="bg-[#cc0000] hover:bg-white hover:text-black text-white font-black py-3.5 px-8 text-xs uppercase tracking-wider transition duration-300"
            >
              Khám phá ngay
            </button>
          </div>
          <div className="w-full md:w-auto max-w-sm flex justify-center">
            <img
              src="https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7856406372134-2d59da8a838ba387aa010a4043b50e0b-1779511395075.jpg?v=1779511398317"
              alt="Promo sneaker"
              className="w-72 h-72 object-cover rounded shadow-2xl border-4 border-white/20 transform hover:scale-105 transition"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
