"use client";

import { useState, useRef } from "react";
import { createPolaroid } from "../actions/polaroids";

type PolaroidUploadModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function PolaroidUploadModal({
  onClose,
  onSuccess,
}: PolaroidUploadModalProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Format foto tidak didukung (jpg, png, webp, heic)");
      return;
    }

    // Validate file size (15MB)
    if (selectedFile.size > 15 * 1024 * 1024) {
      setError("Ukuran foto maksimal 15MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Judul wajib diisi");
      return;
    }
    if (title.length > 50) {
      setError("Judul maksimal 50 karakter");
      return;
    }
    if (!file) {
      setError("Foto wajib diisi");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createPolaroid(title, file);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload foto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in">
        {/* Close button */}
        <button className="absolute top-4 right-4 p-1 text-textMuted hover:text-textMain transition-colors" onClick={onClose} aria-label="Close">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-textMain mb-4">Upload Foto</h2>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* File input */}
          <div className="upload-file-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="hidden"
            />
            <button
              type="button"
              className="upload-file-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="upload-preview-image"
                />
              ) : (
                <>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Klik untuk pilih foto</span>
                  <span className="upload-file-hint">
                    JPG, PNG, WebP, HEIC (max 15MB)
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Title input */}
          <div className="upload-title-section">
            <label htmlFor="polaroid-title" className="upload-label">
              Judul
            </label>
            <input
              id="polaroid-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul foto..."
              maxLength={50}
              className="upload-input"
            />
            <span className="upload-char-count">{title.length}/50</span>
          </div>

          {/* Error message */}
          {error && <div className="upload-error">{error}</div>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || !file || !title.trim()}
            className="upload-submit-btn"
          >
            {isLoading ? (
              <span className="upload-loading">
                <span className="spinner" />
                Uploading...
              </span>
            ) : (
              "Upload"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
