"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import StorySlide from "./components/StorySlide";
import DotIndicator from "./components/DotIndicator";
import BirthdayConfetti from "./components/BirthdayConfetti";
import BirthdayMusic from "./components/BirthdayMusic";
import "./birthday.css";

type SlideData = {
  id: number;
  type: string;
  content: string | null;
  photoUrl: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number;
};

type BirthdayPageProps = {
  slides: SlideData[];
  musicVideoId: string | null;
};

export default function BirthdayPage({ slides, musicVideoId }: BirthdayPageProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const swipedRef = useRef(false);

  const sortedSlides = useMemo(() => [...slides].sort((a, b) => a.order - b.order), [slides]);

  const nextSlide = useCallback(() => {
    if (currentIndex < sortedSlides.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, sortedSlides.length]);

  const prevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchStart(e.touches[0].clientX);
    setTouchStartTime(Date.now());
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null || touchStartTime === null) return;
      const touchEnd = e.changedTouches[0].clientX;
      const deltaX = touchEnd - touchStart;
      const elapsed = Date.now() - touchStartTime;
      const velocity = Math.abs(deltaX) / elapsed;

      const isSwipe = Math.abs(deltaX) > 50 || velocity > 0.5;
      if (isSwipe) {
        swipedRef.current = true;
        setTimeout(() => { swipedRef.current = false; }, 400);
        if (deltaX < 0) nextSlide();
        else prevSlide();
      }
      setTouchStart(null);
      setTouchStartTime(null);
    },
    [touchStart, touchStartTime, nextSlide, prevSlide]
  );

  // Click handlers (tap left/right half)
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (swipedRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const isRightHalf = x > rect.width / 2;
      if (isRightHalf) nextSlide();
      else prevSlide();
    },
    [nextSlide, prevSlide]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, router]);

  const getSlidePosition = (index: number): "prev" | "active" | "next" => {
    if (index === currentIndex) return "active";
    if (index < currentIndex) return "prev";
    return "next";
  };

  // Empty state
  if (sortedSlides.length === 0) {
    return (
      <div className="birthday-page">
        <button
          className="birthday-close"
          onClick={() => router.push("/")}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <p style={{ textAlign: "center", marginTop: "40vh", color: "#9CA3AF" }}>
          Belum ada story.
        </p>
      </div>
    );
  }

  return (
    <div className="birthday-page">
      {/* Close button */}
      <button
        className="birthday-close"
        onClick={() => router.push("/")}
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

      {/* Story container */}
      <div
        ref={containerRef}
        className="story-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {sortedSlides.map((slide, index) => (
          <StorySlide
            key={slide.id}
            slide={slide}
            isActive={index === currentIndex}
            position={getSlidePosition(index)}
          />
        ))}
      </div>

      {/* Confetti */}
      <BirthdayConfetti intensity="full" />

      {/* Dot indicator */}
      {sortedSlides.length > 1 && (
        <DotIndicator total={sortedSlides.length} current={currentIndex} />
      )}

      {/* Music toggle */}
      <BirthdayMusic videoId={musicVideoId} />
    </div>
  );
}
