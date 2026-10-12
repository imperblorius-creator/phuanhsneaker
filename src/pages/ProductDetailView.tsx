import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onNavigateHome: () => void;
  onNavigateCollection: (category?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts,
  onBack,
  onNavigateHome,
  onNavigateCollection,
  onSelectProduct,
}) => {
  const { addToCart, openCheckout } = useCart();
  const { showToast } = useNotification();

  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Auto-select first available size
  useEffect(() => {
    setActiveImage(product.image);
    const firstAvailable = product.sizes?.find((s) => s.available && s.quantity > 0);
    setSelectedSize(firstAvailable ? firstAvailable.label : '');
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const selectedSizeInfo = product.sizes?.find((s) => s.label === selectedSize);
  const availableSizesCount = product.sizes?.filter((s) => s.available && s.quantity > 0).length || 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast('Vui lòng chọn size giày còn hàng trước khi thêm', 'error');
      return;
    }
    addToCart(product, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      showToast('Vui lòng chọn size giày còn hàng', 'error');
      return;
    }
    const added = addToCart(product, selectedSize, quantity);
    if (added) {
      openCheckout();
    }
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 py-3 text-xs font-semibold text-gray-500 flex items-center space-x-2">
          <button onClick={onNavigateHome} className="hover:text-black">
            Trang chủ
          </button>
          <span>/</span>
          <button onClick={() => onNavigateCollection(product.category)} className="hover:text-black uppercase">
            {product.category}
          </button>
          <span>/</span>
          <span className="text-black font-bold uppercase truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Product Details Section */}
      <section className="container mx-auto px-4 lg:px-8 py-8 lg:py-14">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-xs font-black uppercase tracking-wider text-gray-500 hover:text-[#cc0000] transition mb-8 cursor-pointer"
        >
          <i className="ph ph-arrow-left mr-2 text-base"></i> Quay lại danh sách sản phẩm
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Left Column: Gallery */}
          <div>
            <div className="relative bg-gray-100 aspect-square overflow-hidden border border-gray-200 rounded-sm">
              <span
                className={`absolute top-4 left-4 z-10 text-white text-[11px] font-black px-3 py-1 uppercase rounded-sm shadow ${
                  product.available ? 'bg-black' : 'bg-gray-500'
                }`}
              >
                {product.available ? 'Còn hàng' : 'Hết hàng'}
              </span>
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`border aspect-square overflow-hidden rounded-sm transition cursor-pointer ${
                      activeImage === img ? 'border-2 border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Actions */}
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-black text-[#cc0000] uppercase tracking-[0.2em] mb-2">
              {product.category}
            </p>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-black mb-4">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-end gap-3 mb-6">
              <span className="text-3xl font-black text-[#cc0000]">
                {product.price}
              </span>
              {product.compareAt && (
                <span className="text-base font-bold text-gray-400 line-through">
                  {product.compareAt}
                </span>
              )}
            </div>

            {/* Stat Summary Boxes */}
            <div className="grid grid-cols-3 gap-3 mb-7">
              <div className="border border-gray-200 p-3.5 rounded-sm bg-gray-50">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Mã SP (SKU)</p>
                <p className="font-black text-sm text-black font-mono">{product.sku}</p>
              </div>
              <div className="border border-gray-200 p-3.5 rounded-sm bg-gray-50">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Tình trạng</p>
                <p className={`font-black text-sm ${product.available ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {product.available ? 'Còn hàng' : 'Hết hàng'}
                </p>
              </div>
              <div className="border border-gray-200 p-3.5 rounded-sm bg-gray-50">
                <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Size có sẵn</p>
                <p className="font-black text-sm text-black">{availableSizesCount} size</p>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black uppercase tracking-wide text-xs md:text-sm text-black">
                  Kích cỡ giày (EU Size)
                </h3>
                {selectedSizeInfo && (
                  <span className="text-xs font-bold text-gray-500">
                    Kho còn: <strong className="text-black">{selectedSizeInfo.quantity}</strong> đôi
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes?.map((size) => {
                  const isAvailable = size.available && size.quantity > 0;
                  const isSelected = selectedSize === size.label;
                  return (
                    <button
                      key={size.label}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(size.label)}
                      className={`size-btn border py-2.5 text-xs font-bold transition rounded-sm cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white border-black ring-2 ring-black'
                          : isAvailable
                          ? 'border-gray-300 text-black hover:border-black'
                          : 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                      }`}
                      title={isAvailable ? `Còn ${size.quantity} đôi trong kho` : 'Hết hàng'}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-7">
              <span className="text-xs font-bold uppercase text-gray-700">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 flex items-center justify-center font-bold text-sm hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-12 text-center text-sm font-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedSizeInfo && quantity >= selectedSizeInfo.quantity) {
                      showToast(`Kho chỉ còn ${selectedSizeInfo.quantity} đôi cho size ${selectedSize}`, 'error');
                      return;
                    }
                    setQuantity((prev) => prev + 1);
                  }}
                  className="w-9 h-9 flex items-center justify-center font-bold text-sm hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons: Add to Cart & Buy Now */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.available}
                className="flex-1 bg-black text-white font-black uppercase py-4 rounded hover:bg-[#cc0000] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs md:text-sm tracking-wider shadow-md"
              >
                Thêm vào giỏ <i className="ph ph-shopping-bag text-lg"></i>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!product.available}
                className="flex-1 bg-[#cc0000] text-white font-black uppercase py-4 rounded hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs md:text-sm tracking-wider shadow-md"
              >
                Thanh toán ngay <i className="ph ph-credit-card text-lg"></i>
              </button>
            </div>

            {/* Product Description */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-black uppercase tracking-wide text-xs md:text-sm mb-3">
                Thông tin chi tiết sản phẩm
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {product.description ||
                  `Mẫu giày sneaker ${product.name} chính hãng mang phong cách thiết kế hiện đại, đế cao su êm ái chống trơn trượt và chất liệu cao cấp. Phù hợp cho cả đi chơi, dạo phố và vận động thể thao hằng ngày.`}
              </p>
              <ul className="mt-3 text-xs text-gray-500 space-y-1.5 list-disc pl-4 font-medium">
                <li>Cam kết giày chuẩn form, đầy đủ phụ kiện.</li>
                <li>Hỗ trợ đổi size trong vòng 7 ngày nếu không vừa chân.</li>
                <li>Giao hàng toàn quốc - Được kiểm tra hàng trước khi thanh toán.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-24 border-t border-gray-200 pt-10">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                  Sản Phẩm Cùng Dòng {product.category}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Khám phá thêm các mẫu sneaker cùng thương hiệu để bạn so sánh nhanh.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onClick={() => onSelectProduct(rel)}
                  isNew={rel.isNewArrival}
                />
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
};
