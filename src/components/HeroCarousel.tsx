import React, { useState, useEffect, useRef } from 'react';
import { Banner } from '../types';

interface HeroCarouselProps {
  banners: Banner[];
  onNavigate: (view: 'collection', category: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners, onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<any>(null);

  const activeBanners = banners.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
  const count = activeBanners.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % count);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + count) % count);
  };

  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, currentSlide]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleMouseLeave = () => {
    if (count > 1) {
      timerRef.current = setInterval(nextSlide, 5000);
    }
  };

  if (!count) return null;

  const currentBanner = activeBanners[currentSlide];

  return (
    <section
      className="relative w-full h-[50vh] md:h-[70vh] lg:h-[82vh] bg-black overflow-hidden group select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Slides */}
      {activeBanners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover object-center opacity-80"
          />
        </div>
      ))}

      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/40 to-black/20 opacity-90 z-10 pointer-events-none"></div>

      {/* Slide Content */}
      <div className="absolute bottom-12 md:bottom-20 left-0 w-full text-center px-4 z-20 pointer-events-none">
        <span className="inline-block bg-[#cc0000] text-white text-[11px] md:text-xs font-black px-3.5 py-1 mb-3 tracking-widest uppercase pointer-events-auto">
          {currentBanner.subtitle}
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4 drop-shadow-2xl italic pointer-events-auto whitespace-pre-line leading-tight">
          {currentBanner.title}
        </h2>
        <button
          onClick={() => onNavigate('collection', currentBanner.linkCollection || 'ALL')}
          className="mt-2 inline-flex items-center bg-white text-black font-black py-3.5 px-8 text-xs md:text-sm uppercase tracking-wider hover:bg-[#cc0000] hover:text-white transition-all duration-300 pointer-events-auto cursor-pointer shadow-lg"
        >
          {currentBanner.linkText} <i className="ph ph-arrow-right ml-2 text-lg"></i>
        </button>
      </div>

      {/* Carousel Controls */}
      {count > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 cursor-pointer"
            aria-label="Previous slide"
          >
            <i className="ph ph-caret-left text-xl md:text-2xl"></i>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 cursor-pointer"
            aria-label="Next slide"
          >
            <i className="ph ph-caret-right text-xl md:text-2xl"></i>
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-5 left-0 w-full flex justify-center space-x-2 z-30">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide ? 'w-8 bg-[#cc0000]' : 'w-4 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
