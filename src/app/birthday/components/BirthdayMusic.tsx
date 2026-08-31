"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type BirthdayMusicProps = {
  videoId: string | null;
};

export default function BirthdayMusic({ videoId }: BirthdayMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef("yt-birthday-player");

  // Load YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;
    if (window.YT) {
      setApiReady(true);
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Chain with existing callback if any
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
      existingCallback?.();
    };
  }, [videoId]);

  // Create player when API is ready
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current || !window.YT) return;
    if (playerRef.current) return;

    const playerId = playerIdRef.current;

    const player = new window.YT.Player(playerId, {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        loop: 1,
        modestbranding: 1,
        playlist: videoId,
        rel: 0,
        showinfo: 0,
        start: 0,
      },
      events: {
        onReady: () => {
          playerRef.current = player;
          // Autoplay (may be blocked by browser without user gesture)
          player.playVideo();
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === window.YT!.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (
            event.data === window.YT!.PlayerState.PAUSED ||
            event.data === window.YT!.PlayerState.ENDED
          ) {
            setIsPlaying(false);
          }
        },
      },
    });

    return () => {
      // Always destroy — player local var, not dependent on onReady
      player.destroy();
      playerRef.current = null;
    };
  }, [apiReady, videoId]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  if (!videoId) return null;

  return (
    <>
      <div
        ref={containerRef}
        id={playerIdRef.current}
        style={{
          position: "fixed",
          bottom: "-100px",
          left: "-100px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <button
        className="birthday-music-toggle"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? "🔊" : "🔇"}
      </button>
    </>
  );
}
