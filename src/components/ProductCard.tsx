import React, { useState } from 'react';
import { Product } from '../types';
import { useNotification } from '../context/NotificationContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isNew?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, isNew }) => {
  const [isLiked, setIsLiked] = useState(false);
  const { showToast } = useNotification();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    showToast(!isLiked ? `Đã thêm ${product.name} vào danh sách yêu thích` : `Đã bỏ khỏi yêu thích`, 'info');
  };

  const image = product.image || 'https://bizweb.dktcdn.net/thumb/large/100/623/516/products/z7841003971170-cccce3f2d2b2842c1d6fcd1222dd345f-1779179014463.jpg?v=1779186926737';

  return (
    <div
      onClick={onClick}
      className="product-card text-left group bg-white flex flex-col relative border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden rounded-sm"
    >
      <div className="relative bg-gray-100 overflow-hidden aspect-square">
        {isNew && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide">
              Mới
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleLike}
          className={`absolute top-3 right-3 z-20 text-xl rounded-full p-1.5 shadow transition-all duration-200 ${
            isLiked ? 'text-[#cc0000] bg-white opacity-100' : 'text-gray-400 hover:text-[#cc0000] bg-white/90 opacity-0 group-hover:opacity-100'
          }`}
          aria-label="Yêu thích"
        >
          <i className={isLiked ? 'ph-fill ph-heart' : 'ph ph-heart'}></i>
        </button>

        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
        />

        <div className="absolute bottom-0 left-0 w-full p-3.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 backdrop-blur-sm z-20">
          <span className="block w-full bg-black text-white text-center text-xs font-bold py-2.5 uppercase group-hover:bg-[#cc0000] transition">
            Xem chi tiết
          </span>
        </div>
      </div>

      <div className="p-3.5 md:p-4 flex-grow flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
            {product.category}
          </span>
          <span className={`text-[10px] font-bold uppercase ${product.available ? 'text-emerald-700' : 'text-gray-400'}`}>
            {product.available ? 'Còn hàng' : 'Hết hàng'}
          </span>
        </div>

        <h3 className="text-xs md:text-sm font-bold text-black mb-2 line-clamp-2 group-hover:text-[#cc0000] transition flex-grow">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-sm md:text-base font-black text-black">
            {product.price}
          </span>
          {product.compareAt && (
            <span className="text-xs text-gray-400 line-through font-semibold">
              {product.compareAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
