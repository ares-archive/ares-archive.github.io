import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Layers,
  Maximize2,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export interface MediaItem {
  type: 'video' | 'image';
  url: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  title: string;
  fallbackBanner: string;
}

const getYouTubeThumbnail = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
  }
  return null;
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?rel=0&autoplay=1`;
  }
  return null;
};

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  items: rawItems,
  title,
  fallbackBanner,
}) => {
  const { t } = useLanguage();

  // Filtra items vuoti o invalidi
  const items = useMemo(
    () => rawItems.filter(item => item && item.url && item.url.trim() !== ''),
    [rawItems]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [showCursor, setShowCursor] = useState(true);
  const cursorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Reset activeIndex se fuori bound
  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [items.length, activeIndex]);

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < items.length - 1;

  const goPrev = useCallback(() => {
    if (!canGoPrev) return;
    setActiveIndex(prev => prev - 1);
  }, [canGoPrev]);

  const goNext = useCallback(() => {
    if (!canGoNext) return;
    setActiveIndex(prev => prev + 1);
  }, [canGoNext]);

  // --- Touch / Swipe ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (fullscreenIndex !== null) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null || fullscreenIndex !== null) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(delta) > threshold) {
      if (delta > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // --- Keyboard per carousel principale ---
  useEffect(() => {
    if (fullscreenIndex !== null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canGoPrev) goPrev();
      else if (e.key === 'ArrowRight' && canGoNext) goNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fullscreenIndex, goPrev, goNext, canGoPrev, canGoNext]);

  // --- Keyboard per fullscreen ---
  useEffect(() => {
    if (fullscreenIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setFullscreenIndex(prev =>
          prev === null || prev === 0 ? null : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setFullscreenIndex(prev =>
          prev === null || prev >= items.length - 1 ? null : prev + 1
        );
      } else if (e.key === 'Escape') {
        setFullscreenIndex(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fullscreenIndex, items.length]);

  // --- Fullscreen cursor auto-hide ---
  const handleMouseMove = useCallback(() => {
    setShowCursor(true);
    if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current);
    cursorTimeoutRef.current = setTimeout(() => setShowCursor(false), 2000);
  }, []);

  useEffect(() => {
    if (fullscreenIndex === null) {
      setShowCursor(true);
      if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current);
      return;
    }
    window.addEventListener('mousemove', handleMouseMove);
    cursorTimeoutRef.current = setTimeout(() => setShowCursor(false), 2000);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current);
    };
  }, [fullscreenIndex, handleMouseMove]);

  if (items.length === 0) return null;

  const activeItem = items[activeIndex];
  const fullscreenItem = fullscreenIndex !== null ? items[fullscreenIndex] : null;
  const canFsPrev = fullscreenIndex !== null && fullscreenIndex > 0;
  const canFsNext = fullscreenIndex !== null && fullscreenIndex < items.length - 1;

  return (
    <section className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Layers className="w-6 h-6 text-brand-azure" />
        <h2 className="text-2xl font-black text-white uppercase tracking-widest">
          {t('gameDetails.mediaGallery')}
        </h2>
      </div>

      {/* MAIN DISPLAY */}
      <div
        className="aspect-video rounded-3xl overflow-hidden relative border border-brand-border shadow-2xl bg-black group"
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeItem.type === 'video' ? (
          <div
            className="w-full h-full relative cursor-pointer"
            onClick={() => setFullscreenIndex(activeIndex)}
          >
            <img
              src={getYouTubeThumbnail(activeItem.url) || fallbackBanner}
              className="w-full h-full object-cover"
              alt={`${title} Trailer`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackBanner;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors">
              <Play className="w-16 h-16 text-brand-azure fill-brand-azure" />
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={activeItem.url}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setFullscreenIndex(activeIndex)}
              onContextMenu={(e) => e.preventDefault()}
              alt={`${title} Screenshot ${activeIndex + 1}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackBanner;
              }}
            />
          </div>
        )}

        {/* Pulsante Fullscreen - sempre visibile */}
        <button
          onClick={() => setFullscreenIndex(activeIndex)}
          className="absolute top-4 right-4 bg-black/60 hover:bg-brand-azure p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-20"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Freccia Sinistra - solo se NON sei al primo elemento */}
        {canGoPrev && (
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-brand-azure p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Freccia Destra - solo se NON sei all'ultimo elemento */}
        {canGoNext && (
          <button
            onClick={goNext}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-brand-azure p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 hover:scale-105"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Counter badge */}
        {items.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest z-10">
            {activeIndex + 1} / {items.length}
          </div>
        )}
      </div>

      {/* THUMBNAIL STRIP */}
      {items.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-border scrollbar-track-transparent">
          {items.map((item, index) => (
            <button
              key={`thumb-${index}`}
              onClick={() => setActiveIndex(index)}
              className={`w-28 aspect-video rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all relative ${
                activeIndex === index
                  ? 'border-brand-azure scale-95 opacity-100'
                  : 'border-brand-border opacity-50 hover:opacity-100 hover:border-gray-500'
              }`}
            >
              <img
                src={item.type === 'video' ? (getYouTubeThumbnail(item.url) || fallbackBanner) : item.url}
                className="w-full h-full object-cover"
                alt=""
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = fallbackBanner;
                }}
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-6 h-6 text-brand-azure fill-brand-azure" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      <AnimatePresence>
        {fullscreenItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenIndex(null)}
            onMouseMove={handleMouseMove}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-center items-center p-4 select-none"
            style={{ cursor: showCursor ? 'default' : 'none' }}
          >
            <button
              onClick={() => setFullscreenIndex(null)}
              className={`absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 p-3 rounded-full transition-all duration-300 z-50 ${
                showCursor ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative max-w-6xl w-full aspect-video flex items-center justify-center">
              {fullscreenItem.type === 'video' ? (
                (() => {
                  const embedUrl = getYouTubeEmbedUrl(fullscreenItem.url);
                  if (embedUrl) {
                    return (
                      <iframe
                        key={`fs-video-${fullscreenIndex}`}
                        src={embedUrl}
                        className="w-full h-full rounded-2xl max-h-[85vh] border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    );
                  }
                  return (
                    <video
                      src={fullscreenItem.url}
                      controls
                      autoPlay
                      className="max-h-[85vh] rounded-2xl w-full"
                    />
                  );
                })()
              ) : (
                <img
                  src={fullscreenItem.url}
                  className="max-h-[85vh] rounded-2xl object-contain"
                  alt="Fullscreen"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackBanner;
                  }}
                />
              )}

              {/* Solo se NON sei al primo */}
              {canFsPrev && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenIndex(prev => (prev !== null ? prev - 1 : null));
                  }}
                  className={`absolute left-[-10px] md:left-[-60px] top-1/2 -translate-y-1/2 bg-white/5 p-4 rounded-full text-white transition-all duration-300 z-50 ${
                    showCursor ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Solo se NON sei all'ultimo */}
              {canFsNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenIndex(prev => (prev !== null ? prev + 1 : null));
                  }}
                  className={`absolute right-[-10px] md:right-[-60px] top-1/2 -translate-y-1/2 bg-white/5 p-4 rounded-full text-white transition-all duration-300 z-50 ${
                    showCursor ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            <div
              className={`absolute bottom-6 text-gray-500 font-mono text-sm uppercase tracking-widest transition-all duration-300 ${
                showCursor ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {t('gameDetails.mediaCount', {
                current: (fullscreenIndex ?? 0) + 1,
                total: items.length,
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MediaCarousel;