"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const isVideo = polaroid.type === "video";
  const isShortVideo = isVideo && (polaroid.duration ?? 0) < 5;

  // Reset when polaroid changes
  useEffect(() => {
    setMainImgError(false);
    setIsPlaying(false);
    setVideoProgress(0);
  }, [polaroid.id]);

  // Auto-play video when lightbox opens
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isVideo, polaroid.id]);

  // Pause video on close
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keyboard navigation
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
        case " ": {
          // Space to toggle play/pause — skip untuk short video (looping terus)
          if (isVideo && !isShortVideo && videoRef.current) {
            e.preventDefault();
            togglePlay();
          }
          break;
        }
      }
    },
    [isMobile, allPolaroids, polaroid.id, onClose, onNavigate, isVideo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchEnd - touchStart;
    if (diff > 100) {
      onClose();
    }
    setTouchStart(null);
  };

  // Video controls — use videoRef.current directly, no stale closure
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isShortVideo) return;
    setVideoProgress(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current || isShortVideo) return;
    setVideoDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setVideoProgress(time);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
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

        {/* Main content (polaroid frame) */}
        <div className="polaroid-lightbox-main">
          <div className="polaroid-lightbox-frame">
            {isVideo ? (
              /* Video player */
              <div className="polaroid-lightbox-video-wrapper">
                <video
                  ref={videoRef}
                  src={polaroid.videoUrl || undefined}
                  className="polaroid-lightbox-video"
                  autoPlay
                  loop={isShortVideo}
                  muted={isShortVideo}
                  playsInline
                  onTimeUpdate={isShortVideo ? undefined : handleTimeUpdate}
                  onLoadedMetadata={isShortVideo ? undefined : handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={isShortVideo ? undefined : togglePlay}
                />

                {/* Custom controls — hanya untuk video >= 5 detik */}
                {!isShortVideo && (
                <div className="video-controls">
                  <button
                    className="video-controls-btn"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <polygon points="6 3 20 12 6 21 6 3" />
                      </svg>
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max={videoDuration || 0}
                    value={videoProgress}
                    onChange={handleSeek}
                    className="video-progress-bar"
                  />

                  <span className="video-time">
                    {formatTime(videoProgress)} / {formatTime(videoDuration)}
                  </span>

                  <button
                    className="video-controls-btn"
                    onClick={toggleFullscreen}
                    aria-label="Fullscreen"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </div>
                )}
              </div>
            ) : (
              /* Photo */
              <>
                {mainImgError ? (
                  <div
                    className="polaroid-lightbox-image flex items-center justify-center bg-cream/50"
                    style={{ minWidth: "200px", minHeight: "200px" }}
                  >
                    <div className="text-center">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto mb-2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                        <line
                          x1="2"
                          y1="2"
                          x2="22"
                          y2="22"
                          stroke="#EF4444"
                          strokeWidth="2"
                        />
                      </svg>
                      <p className="text-sm text-textMuted">Foto tidak tersedia</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={polaroid.imageUrl || undefined}
                    alt={polaroid.title}
                    className="polaroid-lightbox-image"
                    onError={() => setMainImgError(true)}
                  />
                )}
              </>
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
              aria-label="Previous"
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
              aria-label="Next"
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
              <ThumbWithFallback
                key={p.id}
                polaroid={p}
                isActive={p.id === polaroid.id}
                onClick={() => onNavigate(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Thumbnail with fallback — uses thumbnailUrl for video, imageUrl for photo
function ThumbWithFallback({
  polaroid,
  isActive,
  onClick,
}: {
  polaroid: PolaroidData;
  isActive: boolean;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const src =
    polaroid.type === "video"
      ? polaroid.thumbnailUrl || polaroid.imageUrl
      : polaroid.imageUrl;

  return (
    <button
      className={`polaroid-lightbox-thumb ${isActive ? "active" : ""}`}
      onClick={onClick}
      aria-label={`View ${polaroid.title}`}
    >
      {imgError ? (
        <div className="w-full h-full flex items-center justify-center bg-cream/50">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line
              x1="2"
              y1="2"
              x2="22"
              y2="22"
              stroke="#EF4444"
              strokeWidth="2"
            />
          </svg>
        </div>
      ) : (
        <img
          src={src || undefined}
          alt={polaroid.title}
          onError={() => setImgError(true)}
        />
      )}
    </button>
  );
}
