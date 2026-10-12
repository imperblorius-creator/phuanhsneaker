import React from 'react';

interface BrandRibbonProps {
  onSelectBrand: (brand: string) => void;
}

const BRANDS = ['TIGER', 'JD', 'NIKE', 'PUMA', 'ADIDAS', 'MLB', 'LV', 'NB', 'GUCCI', 'VANS', 'CHAMPION'];

export const BrandRibbon: React.FC<BrandRibbonProps> = ({ onSelectBrand }) => {
  return (
    <section className="border-b border-gray-200 py-6 bg-white shadow-sm relative z-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center space-x-8 md:space-x-12 overflow-x-auto hide-scrollbar text-gray-400">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => onSelectBrand(brand)}
              className="font-black text-2xl md:text-3xl lg:text-4xl tracking-widest uppercase hover:text-black hover:scale-105 cursor-pointer transition transform flex-shrink-0"
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
