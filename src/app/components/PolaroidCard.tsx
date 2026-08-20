"use client";

import { useState } from "react";
import { PolaroidData } from "../actions/polaroids";

type PolaroidCardProps = {
  polaroid: PolaroidData;
  rotation?: number;
  onClick?: () => void;
};

export default function PolaroidCard({
  polaroid,
  rotation = 0,
  onClick,
}: PolaroidCardProps) {
  const [imgError, setImgError] = useState(false);
  const isVideo = polaroid.type === "video";
  const thumbnailSrc = isVideo
    ? polaroid.thumbnailUrl || polaroid.imageUrl
    : polaroid.imageUrl;

  return (
    <div
      className="polaroid-card cursor-pointer group"
      style={{ transform: `rotate(${rotation}deg)` }}
      onClick={onClick}
    >
      <div className="polaroid-frame">
        <div className="polaroid-image-wrapper">
          {imgError ? (
            <div className="polaroid-image flex items-center justify-center bg-cream/50">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
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
            </div>
          ) : (
            <>
              <img
                src={thumbnailSrc || undefined}
                alt={polaroid.title}
                className="polaroid-image"
                loading="lazy"
                onError={() => setImgError(true)}
              />
              {/* Play icon overlay for video */}
              {isVideo && (
                <div className="polaroid-play-overlay">
                  <div className="polaroid-play-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      className="polaroid-play-triangle"
                    >
                      <polygon points="8 5 19 12 8 19 8 5" />
                    </svg>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="polaroid-caption">
          <span className="polaroid-title">{polaroid.title}</span>
        </div>
      </div>
    </div>
  );
}
