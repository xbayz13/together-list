"use client";

import { useMemo } from "react";

type Props = {
  thumbnailUrl?: string;
  isPlaying: boolean;
  size?: "mini" | "normal";
};

export default function VinylRecord({
  thumbnailUrl,
  isPlaying,
  size = "normal",
}: Props) {
  const dimensions = size === "mini" ? 32 : 200;
  const viewBox = "0 0 100 100";

  const grooveCircles = useMemo(
    () =>
      [44, 40, 36, 32, 28].map((r) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#333"
          strokeWidth="0.5"
        />
      )),
    []
  );

  return (
    <div
      className={`vinyl-record ${size} ${isPlaying ? "spinning" : ""}`}
      style={{ width: dimensions, height: dimensions }}
    >
      <svg viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
        {/* Main disc */}
        <circle cx="50" cy="50" r="48" fill="#1a1a1a" />

        {/* Grooves */}
        {grooveCircles}

        {/* Label area */}
        <circle cx="50" cy="50" r="20" fill="#A8D8EA" />

        {/* Thumbnail in label */}
        {thumbnailUrl && (
          <image
            href={thumbnailUrl}
            x="35"
            y="35"
            width="30"
            height="30"
            clipPath="circle(15 at 50 50)"
          />
        )}

        {/* Center hole */}
        <circle cx="50" cy="50" r="3" fill="#1a1a1a" />
      </svg>
    </div>
  );
}
