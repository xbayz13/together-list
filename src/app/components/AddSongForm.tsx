"use client";

import { useState, useCallback } from "react";
import { fetchVideoMetadata } from "../actions/youtube";
import { extractVideoId } from "../lib/youtube-utils";
import { addSong } from "../actions/songs";

type Props = {
  onClose: () => void;
  onAdded: () => void;
};

type PreviewData = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration: string | null;
};

export default function AddSongForm({ onClose, onAdded }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!url.trim()) {
      setError("Masukkan link YouTube");
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Link tidak valid");
      return;
    }

    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const metadata = await fetchVideoMetadata(videoId);
      if (!metadata) {
        setError("Video tidak ditemukan atau tidak tersedia");
        return;
      }
      setPreview(metadata);
    } catch {
      setError("Gagal mengambil data video");
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleAdd = useCallback(async () => {
    if (!preview) return;

    setLoading(true);
    setError(null);

    try {
      await addSong(
        preview.videoId,
        preview.title,
        preview.channelTitle,
        preview.thumbnailUrl,
        preview.duration
      );
      onAdded();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menambahkan lagu";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [preview, onAdded]);

  return (
    <div className="add-song-form">
      <div className="add-song-form-header">
        <span>Tambah Lagu</span>
        <button className="add-song-form-close" onClick={onClose}>
          ×
        </button>
      </div>

      {!preview ? (
        <div className="add-song-form-input-section">
          <input
            type="text"
            className="add-song-form-input"
            placeholder="Paste link YouTube"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            disabled={loading}
          />
          {error && <p className="add-song-form-error">{error}</p>}
          <div className="add-song-form-actions">
            <button
              className="add-song-form-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>
            <button
              className="add-song-form-search"
              onClick={handleSearch}
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <span className="upload-loading">
                  <span className="spinner" />
                  Mencari...
                </span>
              ) : (
                "Cari"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="add-song-form-preview">
          <img
            src={preview.thumbnailUrl}
            alt={preview.title}
            className="add-song-form-preview-thumb"
          />
          <div className="add-song-form-preview-info">
            <p className="add-song-form-preview-title">{preview.title}</p>
            <p className="add-song-form-preview-artist">
              {preview.channelTitle}
            </p>
            {preview.duration && (
              <p className="add-song-form-preview-duration">
                {preview.duration}
              </p>
            )}
          </div>
          {error && <p className="add-song-form-error">{error}</p>}
          <div className="add-song-form-actions">
            <button
              className="add-song-form-cancel"
              onClick={() => {
                setPreview(null);
                setError(null);
              }}
              disabled={loading}
            >
              Batal
            </button>
            <button
              className="add-song-form-add"
              onClick={handleAdd}
              disabled={loading}
            >
              {loading ? (
                <span className="upload-loading">
                  <span className="spinner" />
                  Menambahkan...
                </span>
              ) : (
                "Tambah"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
