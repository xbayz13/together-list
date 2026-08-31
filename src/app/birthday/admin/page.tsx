"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getBirthdaySlides,
  getBirthdayConfig,
  createBirthdaySlide,
  updateBirthdaySlide,
  deleteBirthdaySlide,
  reorderBirthdaySlides,
  updateBirthdayMusic,
  type BirthdaySlideData,
} from "../actions/birthday";
import { getPolaroids, type PolaroidData } from "../../actions/polaroids";
import { getSongs, type SongData } from "../../actions/songs";
import SlideList from "./components/SlideList";
import SlideEditor from "./components/SlideEditor";
import MusicPicker from "./components/MusicPicker";
import "../admin/admin.css";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_BIRTHDAY_ADMIN_PASSWORD;
const AUTH_KEY = "birthday-admin-auth";

export default function BirthdayAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [slides, setSlides] = useState<BirthdaySlideData[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<BirthdaySlideData | null>(null);
  const [musicSongId, setMusicSongId] = useState<number | null>(null);
  const [polaroids, setPolaroids] = useState<PolaroidData[]>([]);
  const [songs, setSongs] = useState<SongData[]>([]);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check existing auth
  useEffect(() => {
    if (!ADMIN_PASSWORD) {
      // No password set = open access (dev mode)
      setAuthenticated(true);
      return;
    }
    const stored = sessionStorage.getItem(AUTH_KEY);
    if (stored === ADMIN_PASSWORD) {
      setAuthenticated(true);
    }
  }, []);

  // Load data after auth
  useEffect(() => {
    if (!authenticated) return;
    refresh();
  }, [authenticated]);

  const refresh = useCallback(async () => {
    const [s, c, p, sg] = await Promise.all([
      getBirthdaySlides(),
      getBirthdayConfig(),
      getPolaroids(),
      getSongs(),
    ]);
    setSlides(s);
    setMusicSongId(c.musicSongId);
    setPolaroids(p.filter((po) => po.type === "photo" && po.imageUrl));
    setSongs(sg);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, passwordInput);
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleReorder = async (ids: number[]) => {
    const reordered = ids.map((id, index) => {
      const slide = slides.find((s) => s.id === id)!;
      return { ...slide, order: index };
    });
    setSlides(reordered);
    await reorderBirthdaySlides(ids);
  };

  const handleAddPhoto = () => {
    setShowPhotoPicker(true);
  };

  const handleSelectPhoto = async (photoId: number) => {
    await createBirthdaySlide("photo", undefined, photoId);
    setShowPhotoPicker(false);
    await refresh();
  };

  const handleAddMessage = async () => {
    await createBirthdaySlide("message", "");
    await refresh();
  };

  const handleAddBanner = async () => {
    await createBirthdaySlide("banner");
    await refresh();
  };

  const handleDelete = async (id: number) => {
    await deleteBirthdaySlide(id);
    if (selectedSlide?.id === id) setSelectedSlide(null);
    await refresh();
  };

  const handleSaveMessage = async (id: number, content: string) => {
    await updateBirthdaySlide(id, { content });
    setSelectedSlide(null);
    await refresh();
  };

  const handleMusicSelect = async (songId: number | null) => {
    setMusicSongId(songId);
    await updateBirthdayMusic(songId);
  };

  // Auth gate
  if (!authenticated) {
    return (
      <div className="admin-page">
        <div style={{ maxWidth: 320, margin: "40vh auto", textAlign: "center" }}>
          <h2 style={{ marginBottom: 16, color: "#374151" }}>Birthday Admin</h2>
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #D1D5DB",
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 12,
              outline: "none",
            }}
          />
          {passwordError && (
            <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>Password salah</p>
          )}
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "10px 0",
              background: "#A8D8EA",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Masuk
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <p style={{ color: "#6B7280" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Birthday Admin</h1>
        <a href="/birthday" target="_blank" className="btn-preview" style={{ width: "auto", padding: "8px 16px", fontSize: "13px" }}>
          Preview
        </a>
      </div>

      <SlideList
        slides={slides}
        onReorder={handleReorder}
        onSelect={setSelectedSlide}
        onDelete={handleDelete}
        onAddPhoto={handleAddPhoto}
        onAddMessage={handleAddMessage}
        onAddBanner={handleAddBanner}
        selectedId={selectedSlide?.id || null}
      />

      {showPhotoPicker && (
        <div className="photo-picker">
          <div className="slide-editor-header">
            <h3 className="slide-editor-title">Pilih Foto</h3>
            <button className="btn-secondary" onClick={() => setShowPhotoPicker(false)}>
              Batal
            </button>
          </div>
          <div className="photo-picker-grid">
            {polaroids.map((p) => (
              <div
                key={p.id}
                className="photo-picker-item"
                onClick={() => handleSelectPhoto(p.id)}
              >
                <img src={p.imageUrl || undefined} alt={p.title} />
              </div>
            ))}
          </div>
          {polaroids.length === 0 && (
            <p className="music-empty">Belum ada foto di polaroid gallery</p>
          )}
        </div>
      )}

      {selectedSlide && selectedSlide.type === "message" && (
        <SlideEditor
          slide={selectedSlide}
          onSave={handleSaveMessage}
          onClose={() => setSelectedSlide(null)}
        />
      )}

      <MusicPicker
        songs={songs}
        selectedSongId={musicSongId}
        onSelect={handleMusicSelect}
      />
    </div>
  );
}
