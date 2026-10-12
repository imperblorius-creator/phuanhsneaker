import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface CollectionViewProps {
  currentCategory: string;
  products: Product[];
  isLoading: boolean;
  onNavigate: (view: 'home' | 'collection' | 'account' | 'admin', category?: string) => void;
  onSelectProduct: (product: Product) => void;
}

const CATEGORY_META: Record<string, { title: string; desc: string; banner: string }> = {
  ALL: {
    title: 'TẤT CẢ SẢN PHẨM',
    desc: 'Toàn bộ mẫu sneaker đang có sẵn tại hệ thống PhuAnh Sneaker.',
    banner: 'https://bizweb.dktcdn.net/100/623/516/themes/1096067/assets/slider_1.jpg?1767854690623',
  },
  TIGER: {
    title: 'ONITSUKA TIGER',
    desc: 'Các mẫu Onitsuka Tiger ren, kem hồng, búp bê và retro hot nhất hiện nay.',
    banner: 'https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737',
  },
  JD: {
    title: 'JORDAN JD',
    desc: 'Nhóm sản phẩm Jordan JD thấp, cổ cao, xám hồng, xám xanh và ruby sc.',
    banner: 'https://i.pinimg.com/736x/1d/29/6d/1d296d408b5e2d305e67c3b0d888f62d.jpg?v=1767596173883',
  },
  NIKE: {
    title: 'NIKE & SB58',
    desc: 'Các mẫu Nike Cortez, Nike V2K, Air Force 1 và Nike SB58 cực chất.',
    banner: 'https://bizweb.dktcdn.net/100/623/516/products/z7856406356461-6c8cd4a5ccaa0f3ca927642af1d7f33b-1779514525734.jpg?v=1779514528587',
  },
  MLB: {
    title: 'MLB KOREA',
    desc: 'Sản phẩm MLB Korea Liner, Chunky và NY đang được ưa chuộng.',
    banner: 'https://bizweb.dktcdn.net/100/623/516/products/z7703354883588-3d1f2a6c28335bce6b9a8a8a5245504a-1775623794295.jpg?v=1775623997380',
  },
  LV: {
    title: 'LOUIS VUITTON',
    desc: 'Các mẫu sneaker LV Trainer, họa tiết hoa, charm và vải rách thời thượng.',
    banner: 'https://bizweb.dktcdn.net/100/623/516/products/z6186988758725-9ec60a1435702f97e83c492bf6b698cd-1735724754784.jpg?v=1767057650527',
  },
  PUMA: {
    title: 'PUMA',
    desc: 'Puma Speedcat, Palermo, Bella và búp bê Puma nơ độc đáo.',
    banner: 'https://bizweb.dktcdn.net/100/623/516/products/z7823749185240-c1bde3cf15d8e63ed082e72c24d61fb8-1778729575317.jpg?v=1778729709983',
  },
  ADIDAS: {
    title: 'ADIDAS',
    desc: 'Samba quai dán, Samba bèo, Spezial và UltraBoost 4.0.',
    banner: 'https://bizweb.dktcdn.net/100/623/516/products/z7838101482445-5343f8ed27f0dc909e5261a4c14bacfe-1779085238028.jpg?v=1779085241283',
  },
  NB: {
    title: 'NEW BALANCE',
    desc: 'Các mẫu NB 530, NB 574 V2, NB 2002 và NB 327 năng động.',
    banner: 'https://bizweb.dktcdn.net/100/623/516/products/z7856406367011-af50479d06d15462c2d6306540261c9e-1779512129393.jpg?v=1779512133703',
  },
  VANS: {
    title: 'VANS',
    desc: 'Vans Knu Skool và Vans Old Skool huyền thoại.',
    banner: 'https://bizweb.dktcdn.net/100/623/516/products/z7628844857830-07b7a7ac1fce1b62cd5c08ad69705355-1773820459669.jpg?v=1773820462833',
  },
};

const SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];

export const CollectionView: React.FC<CollectionViewProps> = ({
  currentCategory,
  products,
  isLoading,
  onNavigate,
  onSelectProduct,
}) => {
  const [selectedPriceBracket, setSelectedPriceBracket] = useState<string>('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [visibleLimit, setVisibleLimit] = useState<number>(24);

  const meta = CATEGORY_META[currentCategory] || {
    title: currentCategory,
    desc: `Các mẫu sneaker dòng ${currentCategory} tại PhuAnh Sneaker`,
    banner: CATEGORY_META.ALL.banner,
  };

  // Size toggle
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedPriceBracket('all');
    setSelectedSizes([]);
    setSelectedSort('newest');
    setOnlyInStock(false);
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (currentCategory && currentCategory !== 'ALL') {
      result = result.filter((p) => p.category.toUpperCase() === currentCategory.toUpperCase());
    }

    // Price bracket
    if (selectedPriceBracket === 'under450') {
      result = result.filter((p) => p.priceValue < 450000);
    } else if (selectedPriceBracket === '450to480') {
      result = result.filter((p) => p.priceValue >= 450000 && p.priceValue <= 480000);
    } else if (selectedPriceBracket === 'above480') {
      result = result.filter((p) => p.priceValue > 480000);
    }

    // Sizes
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes && p.sizes.some((s) => selectedSizes.includes(s.label) && s.available && s.quantity > 0)
      );
    }

    // In stock
    if (onlyInStock) {
      result = result.filter((p) => p.available);
    }

    // Sort
    if (selectedSort === 'price_asc') {
      result.sort((a, b) => a.priceValue - b.priceValue);
    } else if (selectedSort === 'price_desc') {
      result.sort((a, b) => b.priceValue - a.priceValue);
    } else if (selectedSort === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [products, currentCategory, selectedPriceBracket, selectedSizes, onlyInStock, selectedSort]);

  // Categories list with counts
  const categoriesList = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const cat = p.category;
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [products]);

  const displayedList = filteredProducts.slice(0, visibleLimit);

  return (
    <div className="bg-white">
      {/* Dynamic Collection Banner */}
      <div className="w-full h-[25vh] md:h-[35vh] relative bg-black flex items-center justify-center overflow-hidden">
        <img
          src={meta.banner}
          className="absolute inset-0 w-full h-full object-cover opacity-45"
          alt={meta.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-widest mb-2 italic">
            {meta.title}
          </h1>
          <p className="text-gray-300 text-xs md:text-base font-medium max-w-xl mx-auto">
            {meta.desc}
          </p>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 py-3 text-xs font-semibold text-gray-500 flex items-center space-x-2">
          <button onClick={() => onNavigate('home')} className="hover:text-black">
            Trang chủ
          </button>
          <span>/</span>
          <button onClick={() => onNavigate('collection', 'ALL')} className="hover:text-black">
            Danh mục
          </button>
          <span>/</span>
          <span className="text-black font-bold uppercase">{meta.title}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="w-full flex items-center justify-between border border-gray-300 p-3.5 rounded bg-gray-50 text-xs font-bold uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <i className="ph ph-faders text-lg"></i> Bộ lọc & Danh mục ({filteredProducts.length} SP)
              </span>
              <i className={`ph ${isMobileFilterOpen ? 'ph-caret-up' : 'ph-caret-down'}`}></i>
            </button>
          </div>

          {/* Sidebar Filter Container */}
          <aside
            className={`w-full lg:w-1/4 flex-shrink-0 ${
              isMobileFilterOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="sticky top-24 space-y-6 bg-white p-4 lg:p-0 rounded border lg:border-none border-gray-200">
              <div className="flex justify-between items-center pb-3 border-b-2 border-black">
                <h3 className="font-black text-lg uppercase tracking-wide">Bộ Lọc Sản Phẩm</h3>
                {(selectedPriceBracket !== 'all' || selectedSizes.length > 0 || onlyInStock) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#cc0000] font-bold hover:underline"
                  >
                    Đặt lại tất cả
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="pb-5 border-b border-gray-200">
                <h4 className="font-bold text-xs uppercase mb-3 tracking-wider text-black flex items-center justify-between">
                  <span>Dòng Thương Hiệu</span>
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <label
                    onClick={() => onNavigate('collection', 'ALL')}
                    className={`flex items-center justify-between cursor-pointer text-xs font-semibold p-1.5 rounded hover:bg-gray-50 ${
                      currentCategory === 'ALL' ? 'text-[#cc0000] font-black bg-red-50' : 'text-gray-700'
                    }`}
                  >
                    <span>Tất cả sản phẩm</span>
                    <span className="text-gray-400">({products.length})</span>
                  </label>
                  {categoriesList.map(([cat, count]) => (
                    <label
                      key={cat}
                      onClick={() => onNavigate('collection', cat)}
                      className={`flex items-center justify-between cursor-pointer text-xs font-semibold p-1.5 rounded hover:bg-gray-50 ${
                        currentCategory === cat ? 'text-[#cc0000] font-black bg-red-50' : 'text-gray-700'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-gray-400">({count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="pb-5 border-b border-gray-200">
                <h4 className="font-bold text-xs uppercase mb-3 tracking-wider text-black">Khoảng Giá</h4>
                <div className="space-y-2 text-xs font-semibold text-gray-700">
                  <label className="flex items-center cursor-pointer gap-2.5">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceBracket === 'all'}
                      onChange={() => setSelectedPriceBracket('all')}
                      className="accent-black"
                    />
                    <span>Tất cả mức giá</span>
                  </label>
                  <label className="flex items-center cursor-pointer gap-2.5">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceBracket === 'under450'}
                      onChange={() => setSelectedPriceBracket('under450')}
                      className="accent-black"
                    />
                    <span>Dưới 450.000₫</span>
                  </label>
                  <label className="flex items-center cursor-pointer gap-2.5">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceBracket === '450to480'}
                      onChange={() => setSelectedPriceBracket('450to480')}
                      className="accent-black"
                    />
                    <span>450.000₫ - 480.000₫</span>
                  </label>
                  <label className="flex items-center cursor-pointer gap-2.5">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceBracket === 'above480'}
                      onChange={() => setSelectedPriceBracket('above480')}
                      className="accent-black"
                    />
                    <span>Trên 480.000₫</span>
                  </label>
                </div>
              </div>

              {/* Size Filter */}
              <div className="pb-5 border-b border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-black">Kích Cỡ Giày</h4>
                  {selectedSizes.length > 0 && (
                    <button
                      onClick={() => setSelectedSizes([])}
                      className="text-[11px] text-gray-400 hover:text-[#cc0000]"
                    >
                      Xóa chọn
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`size-btn border py-2 text-xs font-bold transition rounded-sm ${
                          isSelected
                            ? 'bg-black text-white border-black'
                            : 'border-gray-200 text-gray-700 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* In-Stock Filter Checkbox */}
              <div className="pb-2">
                <label className="flex items-center gap-2.5 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="accent-black w-4 h-4"
                  />
                  <span>Chỉ hiện sản phẩm còn hàng</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products Container */}
          <div className="w-full lg:w-3/4">
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 mb-6 rounded-sm gap-4">
              <p className="text-xs sm:text-sm font-semibold text-gray-600">
                Hiển thị <span className="text-black font-black">{displayedList.length}</span> trên tổng{' '}
                <span className="text-black font-black">{filteredProducts.length}</span> sản phẩm phù hợp
              </p>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Sắp xếp:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full sm:w-48 bg-white border border-gray-300 text-xs font-bold py-2 px-3 rounded focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="newest">Sản phẩm mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="name_asc">Tên A-Z</option>
                </select>
              </div>
            </div>

            {/* Active Filters Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="bg-gray-100 border border-gray-200 text-xs font-bold px-3 py-1 rounded-sm flex items-center">
                PhuAnh Sneaker
              </span>
              <span className="bg-gray-100 border border-gray-200 text-xs font-bold px-3 py-1 rounded-sm flex items-center">
                {meta.title}
                {currentCategory !== 'ALL' && (
                  <button
                    onClick={() => onNavigate('collection', 'ALL')}
                    className="ml-2 hover:text-[#cc0000]"
                  >
                    ✕
                  </button>
                )}
              </span>
              {selectedPriceBracket !== 'all' && (
                <span className="bg-red-50 border border-red-200 text-xs font-bold px-3 py-1 rounded-sm text-[#cc0000] flex items-center">
                  Khoảng giá: {selectedPriceBracket}
                  <button onClick={() => setSelectedPriceBracket('all')} className="ml-2">✕</button>
                </span>
              )}
              {selectedSizes.map((s) => (
                <span
                  key={s}
                  className="bg-black text-white text-xs font-bold px-2.5 py-1 rounded-sm flex items-center gap-1.5"
                >
                  Size {s}
                  <button onClick={() => toggleSize(s)} className="text-gray-300 hover:text-white">✕</button>
                </span>
              ))}
              {onlyInStock && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-sm flex items-center gap-1">
                  Chỉ còn hàng
                  <button onClick={() => setOnlyInStock(false)}>✕</button>
                </span>
              )}
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 p-4 rounded animate-pulse">
                    <div className="bg-gray-200 aspect-square mb-4 rounded"></div>
                    <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
                    <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                  </div>
                ))}
              </div>
            ) : displayedList.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-sm">
                <i className="ph ph-sneaker text-5xl text-gray-300 mb-3 block"></i>
                <h3 className="text-base font-bold text-black mb-1">Không tìm thấy sản phẩm nào</h3>
                <p className="text-xs text-gray-500 mb-4">Vui lòng thử điều chỉnh lại bộ lọc hoặc khoảng giá</p>
                <button
                  onClick={resetFilters}
                  className="bg-black text-white text-xs font-black uppercase px-5 py-2.5 rounded hover:bg-[#cc0000] transition"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {displayedList.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onSelectProduct(product)}
                    isNew={product.isNewArrival}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {displayedList.length < filteredProducts.length && (
              <div className="flex justify-center mt-12 mb-8">
                <button
                  type="button"
                  onClick={() => setVisibleLimit((prev) => prev + 12)}
                  className="inline-flex items-center bg-black text-white font-black py-3.5 px-8 text-xs uppercase tracking-wider hover:bg-[#cc0000] transition cursor-pointer shadow-md rounded-sm"
                >
                  Xem thêm {filteredProducts.length - displayedList.length} sản phẩm <i className="ph ph-caret-down ml-2 text-base"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
