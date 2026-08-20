"use client";

import { useState } from "react";

type Props = {
  onAddActivity: () => void;
  onUploadPhoto: () => void;
  onUploadVideo: () => void;
  playerActive?: boolean;
  mobilePlayerExpanded?: boolean;
};

export default function FloatingActionButton({
  onAddActivity,
  onUploadPhoto,
  onUploadVideo,
  playerActive = false,
  mobilePlayerExpanded = false,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMainClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddActivity = () => {
    setIsExpanded(false);
    onAddActivity();
  };

  const handleUploadPhoto = () => {
    setIsExpanded(false);
    onUploadPhoto();
  };

  const handleUploadVideo = () => {
    setIsExpanded(false);
    onUploadVideo();
  };

  return (
    <div className={`fab-container ${playerActive ? "player-active" : ""} ${mobilePlayerExpanded ? "mobile-player-expanded" : ""}`}>
      {/* Overlay to close when clicking outside */}
      {isExpanded && (
        <div
          className="fab-overlay"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Child buttons */}
      <div className={`fab-children ${isExpanded ? "expanded" : ""}`}>
        <button
          className="fab-child"
          onClick={handleAddActivity}
          aria-label="Tambah aktivitas"
          style={{ animationDelay: "0ms" }}
        >
          <span className="fab-child-icon">➕</span>
          <span className="fab-child-label">Aktivitas</span>
        </button>
        <button
          className="fab-child"
          onClick={handleUploadPhoto}
          aria-label="Upload foto"
          style={{ animationDelay: "100ms" }}
        >
          <span className="fab-child-icon">📸</span>
          <span className="fab-child-label">Foto</span>
        </button>
        <button
          className="fab-child"
          onClick={handleUploadVideo}
          aria-label="Upload video"
          style={{ animationDelay: "200ms" }}
        >
          <span className="fab-child-icon">🎬</span>
          <span className="fab-child-label">Video</span>
        </button>
      </div>

      {/* Main FAB button */}
      <button
        className={`fab-main ${isExpanded ? "expanded" : ""}`}
        onClick={handleMainClick}
        aria-label={isExpanded ? "Tutup menu" : "Buka menu"}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
