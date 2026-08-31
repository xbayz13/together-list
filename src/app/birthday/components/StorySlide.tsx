"use client";

import { useState, useEffect, useRef } from "react";
import TypingEffect from "./TypingEffect";

type SlideData = {
  id: number;
  type: string;
  content: string | null;
  photoUrl: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number;
};

type StorySlideProps = {
  slide: SlideData;
  isActive: boolean;
  position: "prev" | "active" | "next";
};

export default function StorySlide({ slide, isActive, position }: StorySlideProps) {
  const [imgError, setImgError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play/pause video based on active state
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  const renderContent = () => {
    switch (slide.type) {
      case "photo":
        // Video slide
        if (slide.videoUrl) {
          const isShortVideo = (slide.duration ?? 0) < 5;
          return (
            <div className="story-photo">
              <video
                ref={videoRef}
                src={slide.videoUrl}
                className="story-video"
                loop={isShortVideo}
                muted={isShortVideo}
                playsInline
                controls={!isShortVideo}
              />
            </div>
          );
        }
        // Photo slide
        if (!slide.photoUrl || imgError) {
          return (
            <div className="story-photo">
              <div className="story-photo-placeholder">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>
          );
        }
        return (
          <div className="story-photo">
            <img
              src={slide.photoUrl}
              alt={`Photo ${slide.order}`}
              onError={() => setImgError(true)}
            />
          </div>
        );

      case "banner":
        return (
          <div className="story-banner">
            {/* Floating sparkles */}
            <div className="banner-sparkles">
              <svg className="sparkle sparkle-1" width="12" height="12" viewBox="0 0 12 12">
                <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#F9E79F" />
              </svg>
              <svg className="sparkle sparkle-2" width="10" height="10" viewBox="0 0 12 12">
                <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#A8D8EA" />
              </svg>
              <svg className="sparkle sparkle-3" width="8" height="8" viewBox="0 0 12 12">
                <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#FADBD8" />
              </svg>
              <svg className="sparkle sparkle-4" width="10" height="10" viewBox="0 0 12 12">
                <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#D7BDE2" />
              </svg>
              <svg className="sparkle sparkle-5" width="7" height="7" viewBox="0 0 12 12">
                <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="#A9DFBF" />
              </svg>
            </div>

            {/* Top ornament */}
            <div className="banner-ornament banner-ornament-top">
              <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
                <line x1="0" y1="12" x2="40" y2="12" stroke="#A8D8EA" strokeWidth="1.5" />
                <circle className="ornament-dot" cx="50" cy="12" r="3" fill="#F9E79F" />
                <circle className="ornament-dot ornament-dot-pulse" cx="60" cy="12" r="4" fill="#A8D8EA" />
                <circle className="ornament-dot" cx="70" cy="12" r="3" fill="#F9E79F" />
                <line x1="80" y1="12" x2="120" y2="12" stroke="#A8D8EA" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Cake icon with animated flame */}
            <div className="banner-cake">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                {/* Candle */}
                <rect x="30" y="12" width="4" height="12" rx="2" fill="#F9E79F" />
                {/* Flame layers */}
                <ellipse className="flame flame-outer" cx="32" cy="9" rx="4" ry="5" fill="#FFD93D" />
                <ellipse className="flame flame-mid" cx="32" cy="8" rx="2.5" ry="3.5" fill="#FFAA33" />
                <ellipse className="flame flame-inner" cx="32" cy="7.5" rx="1.2" ry="2" fill="#FFF" opacity="0.8" />
                {/* Glow */}
                <circle className="flame-glow" cx="32" cy="8" r="8" fill="#FFD93D" opacity="0.15" />
                {/* Cake base */}
                <rect x="12" y="24" width="40" height="28" rx="6" fill="#A8D8EA" />
                <rect x="12" y="24" width="40" height="28" rx="6" stroke="#8EC5D6" strokeWidth="1.5" />
                {/* Frosting */}
                <path d="M12 32 Q16 28 20 32 Q24 28 28 32 Q32 28 36 32 Q40 28 44 32 Q48 28 52 32" stroke="#FFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                {/* Dots decoration */}
                <circle className="cake-dot" cx="20" cy="42" r="2" fill="#FFF" opacity="0.6" />
                <circle className="cake-dot" cx="32" cy="42" r="2" fill="#FFF" opacity="0.6" />
                <circle className="cake-dot" cx="44" cy="42" r="2" fill="#FFF" opacity="0.6" />
              </svg>
            </div>

            {/* Main text */}
            <h1 className="banner-title">Happy Birthday</h1>
            <h2 className="banner-name">Hiyori</h2>

            {/* Subtitle */}
            <p className="banner-subtitle">
              <span className="subtitle-star">✦</span>
              {" "}Special Day{" "}
              <span className="subtitle-star">✦</span>
            </p>

            {/* Bottom ornament */}
            <div className="banner-ornament banner-ornament-bottom">
              <svg width="80" height="16" viewBox="0 0 80 16" fill="none">
                <path d="M0 8 L20 8" stroke="#A8D8EA" strokeWidth="1" />
                <path d="M24 8 L36 8" stroke="#F9E79F" strokeWidth="1" />
                <circle className="ornament-dot" cx="40" cy="8" r="2" fill="#A8D8EA" />
                <path d="M44 8 L56 8" stroke="#F9E79F" strokeWidth="1" />
                <path d="M60 8 L80 8" stroke="#A8D8EA" strokeWidth="1" />
              </svg>
            </div>
          </div>
        );

      case "message":
        return (
          <div className="story-message">
            <TypingEffect
              text={slide.content || ""}
              isActive={isActive}
              speed={(slide.content?.length ?? 0) < 30 ? 110 : 50}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`story-slide ${position}`}>{renderContent()}</div>
  );
}
