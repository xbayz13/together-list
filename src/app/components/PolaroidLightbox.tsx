"use client";

import { useState, useEffect, useCallback } from "react";
import { PolaroidData } from "../actions/polaroids";

type PolaroidLightboxProps = {
  polaroid: PolaroidData;
  allPolaroids: PolaroidData[];
  onClose: () => void;
  onNavigate: (polaroid: PolaroidData) => void;
};

export default function PolaroidLightbox({
  polaroid,
  allPolaroids,
  onClose,
  onNavigate,
}: PolaroidLightboxProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [mainImgError, setMainImgError] = useState(false);

  // Reset image error when polaroid changes
  useEffect(() => {
    setMainImgError(false);
  }, [polaroid.id]);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keyboard navigation (desktop only)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isMobile) return;

      const currentIndex = allPolaroids.findIndex((p) => p.id === polaroid.id);

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft": {
          const prevIndex =
            (currentIndex - 1 + allPolaroids.length) % allPolaroids.length;
          onNavigate(allPolaroids[prevIndex]);
          break;
        }
        case "ArrowRight": {
          const nextIndex = (currentIndex + 1) % allPolaroids.length;
          onNavigate(allPolaroids[nextIndex]);
          break;
        }
      }
    },
    [isMobile, allPolaroids, polaroid.id, onClose, onNavigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Touch handlers for swipe down (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchEnd - touchStart;

    // Swipe down > 100px to close
    if (diff > 100) {
      onClose();
    }
    setTouchStart(null);
  };

  const currentIndex = allPolaroids.findIndex((p) => p.id === polaroid.id);

  return (
    <div
      className="polaroid-lightbox-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="polaroid-lightbox-content">
        {/* Close button */}
        <button
          className="polaroid-lightbox-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Main photo (polaroid frame) */}
        <div className="polaroid-lightbox-main">
          <div className="polaroid-lightbox-frame">
            {mainImgError ? (
              <div className="polaroid-lightbox-image flex items-center justify-center bg-cream/50" style={{ minWidth: "200px", minHeight: "200px" }}>
                <div className="text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                    <line x1="2" y1="2" x2="22" y2="22" stroke="#EF4444" strokeWidth="2" />
                  </svg>
                  <p className="text-sm text-textMuted">Foto tidak tersedia</p>
                </div>
              </div>
            ) : (
              <img
                src={polaroid.imageUrl}
                alt={polaroid.title}
                className="polaroid-lightbox-image"
                onError={() => setMainImgError(true)}
              />
            )}
            <div className="polaroid-lightbox-caption">
              <span>{polaroid.title}</span>
            </div>
          </div>
        </div>

        {/* Navigation arrows (desktop only) */}
        {!isMobile && allPolaroids.length > 1 && (
          <>
            <button
              className="polaroid-lightbox-nav prev"
              onClick={() => {
                const prevIndex =
                  (currentIndex - 1 + allPolaroids.length) %
                  allPolaroids.length;
                onNavigate(allPolaroids[prevIndex]);
              }}
              aria-label="Previous photo"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className="polaroid-lightbox-nav next"
              onClick={() => {
                const nextIndex =
                  (currentIndex + 1) % allPolaroids.length;
                onNavigate(allPolaroids[nextIndex]);
              }}
              aria-label="Next photo"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Thumbnail strip (desktop only) */}
        {!isMobile && allPolaroids.length > 1 && (
          <div className="polaroid-lightbox-thumbnails">
            {allPolaroids.map((p) => (
              <ThumbWithFallback key={p.id} polaroid={p} isActive={p.id === polaroid.id} onClick={() => onNavigate(p)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for thumbnail with error handling
function ThumbWithFallback({ polaroid, isActive, onClick }: { polaroid: PolaroidData; isActive: boolean; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      className={`polaroid-lightbox-thumb ${isActive ? "active" : ""}`}
      onClick={onClick}
      aria-label={`View ${polaroid.title}`}
    >
      {imgError ? (
        <div className="w-full h-full flex items-center justify-center bg-cream/50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="2" y1="2" x2="22" y2="22" stroke="#EF4444" strokeWidth="2" />
          </svg>
        </div>
      ) : (
        <img src={polaroid.imageUrl} alt={polaroid.title} onError={() => setImgError(true)} />
      )}
    </button>
  );
}
