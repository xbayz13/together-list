"use client";

import { useEffect, useRef, useMemo } from "react";
import type { LyricLine } from "../actions/lyrics";

type Props = {
  syncedLyrics: LyricLine[] | null;
  plainLyrics: string | null;
  currentTime: number;
  songId?: number | string;
};

// Find the active line index based on current time
const findActiveLineIndex = (lyrics: LyricLine[], time: number): number => {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (time >= lyrics[i].time) {
      return i;
    }
  }
  return 0;
};

// Get line state: active, nearby (±1), or far
const getLineState = (
  lineIndex: number,
  activeIndex: number
): "active" | "nearby" | "far" => {
  const diff = Math.abs(lineIndex - activeIndex);
  if (diff === 0) return "active";
  if (diff <= 1) return "nearby";
  return "far";
};

export default function LyricsDisplay({
  syncedLyrics,
  plainLyrics,
  currentTime,
  songId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastActiveIndexRef = useRef<number>(-1);

  // Reset scroll index when song changes
  useEffect(() => {
    lastActiveIndexRef.current = -1;
  }, [songId]);

  const activeLineIndex = useMemo(() => {
    if (!syncedLyrics || syncedLyrics.length === 0) return -1;
    return findActiveLineIndex(syncedLyrics, currentTime);
  }, [syncedLyrics, currentTime]);

  // Scroll to active line only when it changes
  useEffect(() => {
    if (
      activeLineIndex === lastActiveIndexRef.current ||
      activeLineIndex < 0 ||
      !containerRef.current
    ) {
      return;
    }

    lastActiveIndexRef.current = activeLineIndex;

    const activeElement = containerRef.current.querySelector(
      `[data-line-index="${activeLineIndex}"]`
    );

    if (activeElement) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();
      
      // Calculate scroll position to center the element
      const scrollTop = container.scrollTop;
      const elementTop = elementRect.top - containerRect.top + scrollTop;
      const targetScroll = elementTop - (containerRect.height / 2) + (elementRect.height / 2);
      
      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  }, [activeLineIndex]);

  // No lyrics at all - hide area
  if (!syncedLyrics && !plainLyrics) {
    return null;
  }

  // Synced lyrics display
  if (syncedLyrics && syncedLyrics.length > 0) {
    return (
      <div ref={containerRef} className="lyrics-container">
        {/* Spacer for top padding */}
        <div className="lyrics-spacer" aria-hidden="true" />
        {syncedLyrics.map((line, index) => {
          const state = getLineState(index, activeLineIndex);
          return (
            <p
              key={`${line.time}-${index}`}
              data-line-index={index}
              className={`lyrics-line lyrics-${state}`}
            >
              {line.text || "\u00A0"}
            </p>
          );
        })}
        {/* Spacer for bottom padding */}
        <div className="lyrics-spacer" aria-hidden="true" />
      </div>
    );
  }

  // Plain lyrics fallback - static, no auto-scroll
  if (plainLyrics) {
    return (
      <div className="lyrics-container lyrics-plain">
        {plainLyrics.split("\n").map((line, index) => (
          <p key={index} className="lyrics-line lyrics-plain-line">
            {line || "\u00A0"}
          </p>
        ))}
      </div>
    );
  }

  return null;
}
