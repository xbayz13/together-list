"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import VinylRecord from "./VinylRecord";
import AddSongForm from "./AddSongForm";
import LyricsDisplay from "./LyricsDisplay";
import type { SongData } from "../actions/songs";
import { deleteSong } from "../actions/songs";
import { fetchLyrics, type LyricsData } from "../actions/lyrics";

// YouTube IFrame API types are from @types/youtube
type YTPlayer = {
  getDuration: () => number;
  getCurrentTime: () => number;
  getVolume: () => number;
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (time: number, allowSeekAhead: boolean) => void;
  setVolume: (vol: number) => void;
  destroy: () => void;
};

type Props = {
  songs: SongData[];
  onSongAdded: () => void;
  onSongDeleted: () => void;
  onPlayerActiveChange: (active: boolean) => void;
  onMobileExpandedChange?: (expanded: boolean) => void;
};

// SVG Icons
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const PrevIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);

const NextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

const RepeatIcon = ({ active }: { active: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ opacity: active ? 1 : 0.4 }}
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const VolumeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

export default function MusicPlayer({
  songs,
  onSongAdded,
  onSongDeleted,
  onPlayerActiveChange,
  onMobileExpandedChange,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [repeatOn, setRepeatOn] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [lyrics, setLyrics] = useState<LyricsData>({ syncedLyrics: null, plainLyrics: null });

  const playerRef = useRef<InstanceType<typeof window.YT.Player> | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const timeUpdateRef = useRef<NodeJS.Timeout | null>(null);

  // Fix 1: Use refs for values used in callbacks to avoid stale closures
  const repeatOnRef = useRef(repeatOn);
  const songsRef = useRef(songs);
  const currentSongIndexRef = useRef(currentSongIndex);
  const wasPlayingBeforeHiddenRef = useRef(false); // Track if was playing before tab hidden

  useEffect(() => { repeatOnRef.current = repeatOn; }, [repeatOn]);
  useEffect(() => { songsRef.current = songs; }, [songs]);
  useEffect(() => { currentSongIndexRef.current = currentSongIndex; }, [currentSongIndex]);

  const currentSong = songs[currentSongIndex] || null;

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };
  }, []);

  // Initialize YouTube player when API is ready
  useEffect(() => {
    if (!apiReady || !playerContainerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player("youtube-player", {
      videoId: currentSong?.videoId || "",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: () => {
          if (playerRef.current) {
            playerRef.current.setVolume(volume);
          }
        },
        // Fix 1: Use refs for stale closure prevention
        onStateChange: (event: { data: number }) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            if (repeatOnRef.current) {
              const currentIdx = currentSongIndexRef.current;
              const totalSongs = songsRef.current.length;
              setCurrentSongIndex(currentIdx >= totalSongs - 1 ? 0 : currentIdx + 1);
            } else {
              setIsPlaying(false);
            }
          }
        },
      },
    });
  }, [apiReady, currentSong?.videoId, volume]); // Remove repeatOn & songs.length from deps

  // Auto-play on first user interaction
  useEffect(() => {
    if (!apiReady || hasAutoPlayed || songs.length === 0) return;

    const handleFirstInteraction = () => {
      if (playerRef.current && typeof playerRef.current.playVideo === "function") {
        playerRef.current.playVideo();
        setIsPlaying(true);
        setHasAutoPlayed(true);
      }
    };

    // Fix 5: Use direct function reference for proper cleanup
    const clickHandler = () => handleFirstInteraction();
    const touchHandler = () => handleFirstInteraction();

    document.addEventListener("click", clickHandler, { once: true });
    document.addEventListener("touchstart", touchHandler, { once: true });

    return () => {
      document.removeEventListener("click", clickHandler);
      document.removeEventListener("touchstart", touchHandler);
    };
  }, [apiReady, hasAutoPlayed, songs.length]);

  // Update time
  useEffect(() => {
    if (!playerRef.current || !apiReady) return;

    const updateTime = () => {
      if (playerRef.current && typeof playerRef.current.getDuration === "function") {
        const dur = playerRef.current.getDuration();
        const cur = playerRef.current.getCurrentTime();
        setDuration(dur || 0);
        setCurrentTime(cur || 0);
      }
    };

    timeUpdateRef.current = setInterval(updateTime, 250);

    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, [apiReady]);

  // Handle song change with proper checks
  useEffect(() => {
    if (!currentSong || !apiReady) return;
    if (!playerRef.current) return;
    if (typeof playerRef.current.loadVideoById !== "function") return;

    playerRef.current.loadVideoById(currentSong.videoId);
    // Only pause if user hasn't started playing yet
    if (!isPlaying && !hasAutoPlayed) {
      playerRef.current.pauseVideo();
    }

    // Fetch lyrics for the new song
    const loadLyrics = async () => {
      if (currentSong.title && currentSong.artist) {
        const lyricsData = await fetchLyrics(currentSong.title, currentSong.artist);
        setLyrics(lyricsData);
      } else {
        setLyrics({ syncedLyrics: null, plainLyrics: null });
      }
    };

    loadLyrics();
  }, [currentSong?.videoId, apiReady, hasAutoPlayed]); // Remove isPlaying from deps

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current || !apiReady) return;
    if (typeof playerRef.current.playVideo !== "function") return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, apiReady]);

  // Handle volume change
  useEffect(() => {
    if (!playerRef.current || !apiReady) return;
    if (typeof playerRef.current.setVolume !== "function") return;
    playerRef.current.setVolume(volume);
  }, [volume, apiReady]);

  // Notify parent of player active state
  useEffect(() => {
    onPlayerActiveChange(songs.length > 0);
  }, [songs.length, onPlayerActiveChange]);

  // Handle visibility change — resume play saat tab visible lagi
  useEffect(() => {
    if (!apiReady) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Tab becoming hidden — save current playing state
        wasPlayingBeforeHiddenRef.current = isPlaying;
      } else if (document.visibilityState === "visible") {
        // Tab visible lagi — resume kalo sebelumnya playing
        if (wasPlayingBeforeHiddenRef.current && playerRef.current) {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [apiReady, isPlaying]);

  // Setup Media Session — biar musik jalan di background (mobile)
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    // Set metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong?.title || "Unknown",
      artist: currentSong?.artist || "Unknown",
      artwork: currentSong?.thumbnailUrl
        ? [{ src: currentSong.thumbnailUrl, sizes: "256x256", type: "image/jpeg" }]
        : [],
    });

    // Set action handlers with try-catch for unsupported handlers
    try {
      navigator.mediaSession.setActionHandler("play", () => {
        if (playerRef.current) {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        }
      });

      navigator.mediaSession.setActionHandler("previoustrack", () => {
        setCurrentSongIndex((prev) => (prev <= 0 ? songs.length - 1 : prev - 1));
      });

      navigator.mediaSession.setActionHandler("nexttrack", () => {
        setCurrentSongIndex((prev) => (prev >= songs.length - 1 ? 0 : prev + 1));
      });
    } catch {
      // Some handlers may not be supported
    }
  }, [currentSong, songs.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSongIndex((prev) => (prev <= 0 ? songs.length - 1 : prev - 1));
  }, [songs.length]);

  const handleNext = useCallback(() => {
    setCurrentSongIndex((prev) => (prev >= songs.length - 1 ? 0 : prev + 1));
  }, [songs.length]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!playerRef.current) return;
      if (typeof playerRef.current.seekTo !== "function") return;

      // Use currentTarget instead of ref to get the clicked element
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const seekTime = percent * duration;
      playerRef.current.seekTo(seekTime, true);
      setCurrentTime(seekTime);
    },
    [duration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseInt(e.target.value, 10));
    },
    []
  );

  // Fix 2: Proper index bounds after delete
  const handleDeleteSong = useCallback(
    async (id: number) => {
      try {
        await deleteSong(id);
        onSongDeleted();

        const newLength = songs.length - 1;
        if (newLength === 0) {
          // No songs left
          setCurrentSongIndex(0);
        } else if (currentSongIndex >= newLength) {
          // Deleted song was last, go to new last
          setCurrentSongIndex(newLength - 1);
        }
        // Otherwise keep current index (song shifted down)
      } catch {
        // Error handled by parent
      }
    },
    [currentSongIndex, songs.length, onSongDeleted]
  );

  if (songs.length === 0) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Fix 3: Player container with proper dimensions for iframe */}
      <div
        ref={playerContainerRef}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "1px",
          height: "1px",
          opacity: 0.01, // Hampir invisible tapi browser treat sebagai visible (prevent throttle)
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div id="youtube-player" style={{ width: "1px", height: "1px" }} />
      </div>

      {/* Desktop Player */}
      <div className="hidden md:block">
        {!isExpanded ? (
          <div className="music-player-collapsed" onClick={() => setIsExpanded(true)}>
            <VinylRecord thumbnailUrl={currentSong?.thumbnailUrl} isPlaying={isPlaying} size="mini" />
            <div className="music-player-collapsed-info">
              <p className="music-player-collapsed-title">{currentSong?.title || "Unknown"}</p>
              <p className="music-player-collapsed-artist">{currentSong?.artist || "Unknown"}</p>
            </div>
            <div className="music-player-collapsed-actions">
              {repeatOn && (
                <span className="music-player-collapsed-repeat-indicator">
                  <RepeatIcon active={true} />
                </span>
              )}
              <button className="music-player-collapsed-play" onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
            </div>
            <div ref={progressRef} className="music-player-collapsed-progress" onClick={handleProgressClick}>
              <div className="music-player-collapsed-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        ) : (
          <div className="music-player-expanded">
            <div className="music-player-expanded-header">
              <span className="music-player-expanded-title-text">Now Playing</span>
              <button className="music-player-expanded-close" onClick={() => setIsExpanded(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            <div className="music-player-expanded-vinyl">
              <VinylRecord thumbnailUrl={currentSong?.thumbnailUrl} isPlaying={isPlaying} size="normal" />
            </div>

            <div className="music-player-expanded-info">
              <p className="music-player-expanded-title">{currentSong?.title || "Unknown"}</p>
              <p className="music-player-expanded-artist">{currentSong?.artist || "Unknown"}</p>
            </div>

            <LyricsDisplay
              syncedLyrics={lyrics.syncedLyrics}
              plainLyrics={lyrics.plainLyrics}
              currentTime={currentTime}
              songId={currentSong?.id}
            />

            <div className="music-player-controls">
              <button className="music-player-btn music-player-prev" onClick={handlePrev}>
                <PrevIcon />
              </button>
              <button className="music-player-btn music-player-play-main" onClick={handlePlayPause}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button className="music-player-btn music-player-next" onClick={handleNext}>
                <NextIcon />
              </button>
            </div>

            <div className="music-player-progress-container">
              <span className="music-player-time">{formatTime(currentTime)}</span>
              <div ref={progressRef} className="music-player-progress" onClick={handleProgressClick}>
                <div className="music-player-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="music-player-time">{formatTime(duration)}</span>
            </div>

            <div className="music-player-playlist">
              <div className="music-player-playlist-header">
                <span>Playlist</span>
                <button className="music-player-add-btn" onClick={() => setShowAddForm(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
              <div className="music-player-playlist-list">
                {songs.map((song, index) => (
                  <div key={song.id} className={`music-player-playlist-item ${index === currentSongIndex ? "active" : ""}`} onClick={() => { setCurrentSongIndex(index); setIsPlaying(true); }}>
                    <img src={song.thumbnailUrl} alt={song.title} className="music-player-playlist-thumb" />
                    <div className="music-player-playlist-item-info">
                      <p className="music-player-playlist-item-title">{song.title}</p>
                      <p className="music-player-playlist-item-artist">{song.artist}</p>
                    </div>
                    <button className="music-player-playlist-item-delete" onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {showAddForm && (
              <AddSongForm onClose={() => setShowAddForm(false)} onAdded={() => { setShowAddForm(false); onSongAdded(); }} />
            )}
          </div>
        )}
      </div>

      {/* Mobile Player */}
      <div className="md:hidden">
        {!isExpanded ? (
          <div className="music-player-mini" onClick={() => { setIsExpanded(true); setIsMobileExpanded(true); onMobileExpandedChange?.(true); }}>
            <VinylRecord thumbnailUrl={currentSong?.thumbnailUrl} isPlaying={isPlaying} size="mini" />
            <div className="music-player-mini-info">
              <p className="music-player-mini-title">{currentSong?.title || "Unknown"}</p>
            </div>
            <div className="music-player-mini-actions">
              {repeatOn && (
                <span className="music-player-mini-repeat-indicator">
                  <RepeatIcon active={true} />
                </span>
              )}
              <button className="music-player-mini-play" onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
            </div>
          </div>
        ) : (
          <div className="music-player-fullscreen">
            <div className="music-player-fullscreen-header">
              <button className="music-player-fullscreen-close" onClick={() => { setIsExpanded(false); setIsMobileExpanded(false); onMobileExpandedChange?.(false); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <span>Now Playing</span>
              <span />
            </div>

            <div className="music-player-fullscreen-vinyl">
              <VinylRecord thumbnailUrl={currentSong?.thumbnailUrl} isPlaying={isPlaying} size="normal" />
            </div>

            <div className="music-player-fullscreen-info">
              <p className="music-player-fullscreen-title">{currentSong?.title || "Unknown"}</p>
              <p className="music-player-fullscreen-artist">{currentSong?.artist || "Unknown"}</p>
            </div>

            <LyricsDisplay
              syncedLyrics={lyrics.syncedLyrics}
              plainLyrics={lyrics.plainLyrics}
              currentTime={currentTime}
              songId={currentSong?.id}
            />

            <div className="music-player-controls">
              <button className="music-player-btn music-player-prev" onClick={handlePrev}>
                <PrevIcon />
              </button>
              <button className="music-player-btn music-player-play-main" onClick={handlePlayPause}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button className="music-player-btn music-player-next" onClick={handleNext}>
                <NextIcon />
              </button>
            </div>

            <div className="music-player-progress-container">
              <span className="music-player-time">{formatTime(currentTime)}</span>
              <div ref={progressRef} className="music-player-progress" onClick={handleProgressClick}>
                <div className="music-player-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="music-player-time">{formatTime(duration)}</span>
            </div>

            <div className="music-player-playlist">
              <div className="music-player-playlist-header">
                <span>Playlist</span>
                <button className="music-player-add-btn" onClick={() => setShowAddForm(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
              <div className="music-player-playlist-list">
                {songs.map((song, index) => (
                  <div key={song.id} className={`music-player-playlist-item ${index === currentSongIndex ? "active" : ""}`} onClick={() => { setCurrentSongIndex(index); setIsPlaying(true); }}>
                    <img src={song.thumbnailUrl} alt={song.title} className="music-player-playlist-thumb" />
                    <div className="music-player-playlist-item-info">
                      <p className="music-player-playlist-item-title">{song.title}</p>
                      <p className="music-player-playlist-item-artist">{song.artist}</p>
                    </div>
                    <button className="music-player-playlist-item-delete" onClick={(e) => { e.stopPropagation(); handleDeleteSong(song.id); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {showAddForm && (
              <AddSongForm onClose={() => setShowAddForm(false)} onAdded={() => { setShowAddForm(false); onSongAdded(); }} />
            )}
          </div>
        )}
      </div>
    </>
  );
}
