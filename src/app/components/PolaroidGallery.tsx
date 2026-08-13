"use client";

import { useState, useEffect, useCallback } from "react";
import { PolaroidData, getPolaroids } from "../actions/polaroids";
import PolaroidCard from "./PolaroidCard";

type PolaroidGalleryProps = {
  onPolaroidClick: (polaroid: PolaroidData) => void;
  onPolaroidsLoaded?: (polaroids: PolaroidData[]) => void;
};

const DESKTOP_ROTATIONS = [7, -5, 9, -8, 11];
const MOBILE_ROTATIONS = [4, -3, 5, -4, 6, -5];

export default function PolaroidGallery({
  onPolaroidClick,
  onPolaroidsLoaded,
}: PolaroidGalleryProps) {
  const [polaroids, setPolaroids] = useState<PolaroidData[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch polaroids
  useEffect(() => {
    async function fetchPolaroids() {
      try {
        const data = await getPolaroids();
        setPolaroids(data);
        onPolaroidsLoaded?.(data);
      } catch (error) {
        console.error("Failed to fetch polaroids:", error);
      }
    }
    fetchPolaroids();
  }, [onPolaroidsLoaded]);

  // Auto-scroll carousel (desktop only)
  const scrollNext = useCallback(() => {
    if (polaroids.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % polaroids.length);
  }, [polaroids.length]);

  useEffect(() => {
    if (isMobile || isHovered || polaroids.length === 0) return;

    const interval = setInterval(scrollNext, 5000);
    return () => clearInterval(interval);
  }, [isMobile, isHovered, polaroids.length, scrollNext]);

  // Empty state
  if (polaroids.length === 0) {
    return (
      <div className="polaroid-gallery-empty">
        <div className="polaroid-empty-card" style={{ transform: "rotate(-3deg)" }}>
          <div className="polaroid-empty-frame">
            <div className="polaroid-empty-image">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
                <line x1="2" y1="2" x2="22" y2="22" stroke="#EF4444" strokeWidth="2" />
              </svg>
              <span className="polaroid-empty-text">Belum ada foto</span>
            </div>
            <div className="polaroid-empty-caption">
              <span>Klik 📸 untuk upload</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile: Grid 2 columns
  if (isMobile) {
    return (
      <div className="polaroid-gallery-mobile">
        <div className="polaroid-grid">
          {polaroids.map((polaroid, index) => (
            <PolaroidCard
              key={polaroid.id}
              polaroid={polaroid}
              rotation={MOBILE_ROTATIONS[index % MOBILE_ROTATIONS.length]}
              onClick={() => onPolaroidClick(polaroid)}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop: Shuffle stack carousel
  const visibleCount = Math.min(3, polaroids.length);

  return (
    <div
      className="polaroid-gallery-desktop"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hero */}
      <div className="polaroid-hero">
        <h3 className="polaroid-hero-title" style={{ textShadow: "2px 2px 0 #9A9A9A, 4px 4px 0 #D8D8D8" }}>Moments & <span className="text-accent">Memories</span></h3>
        <p className="polaroid-hero-subtitle">klik untuk melihat semua foto</p>
      </div>

      <div className="polaroid-carousel">
        {Array.from({ length: visibleCount }).map((_, i) => {
          const polaroidIndex = (activeIndex + i) % polaroids.length;
          const polaroid = polaroids[polaroidIndex];
          // Shuffle stack: alternating offset and more rotation for messy look
          const offsetX = i === 0 ? 0 : (i % 2 === 1 ? -12 : 12);
          const offsetY = i * 8;
          const rotation = i === 0 ? 0 : (i % 2 === 1 ? -8 : 8);
          const scale = 1 - i * 0.08;
          const zIndex = 10 - i;
          const opacity = 1 - i * 0.15;

          return (
            <div
              key={`${polaroid.id}-${i}`}
              className="polaroid-carousel-item"
              style={{
                transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
                zIndex,
                opacity,
              }}
            >
              <PolaroidCard
                polaroid={polaroid}
                rotation={0}
                onClick={() => onPolaroidClick(polaroid)}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation dots */}
      <div className="polaroid-carousel-dots">
        {polaroids.map((_, index) => (
          <button
            key={index}
            className={`polaroid-dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to photo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
