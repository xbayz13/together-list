"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { uploadVideo } from "../actions/video-upload";

type VideoUploadModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

type UploadStatus = "idle" | "uploading" | "done" | "error";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_SIZE = 255 * 1024 * 1024; // 255MB
const MAX_DURATION = 180; // 3 menit

// Utility functions — outside component, no re-creation per render
const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function VideoUploadModal({
  onClose,
  onSuccess,
}: VideoUploadModalProps) {
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoSize, setVideoSize] = useState<string>("");
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closedRef = useRef(false); // Prevent double close

  // Revoke object URLs on unmount or when they change
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [videoPreview, thumbnailPreview]);

  const generateThumbnail = useCallback(
    (video: HTMLVideoElement) => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Revoke old thumbnail URL before setting new one
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
            setThumbnailBlob(blob);
            setThumbnailPreview(URL.createObjectURL(blob));
          }
        },
        "image/jpeg",
        0.5
      );
    },
    [thumbnailPreview]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrorMessage("Format video tidak didukung (mp4, webm, mov)");
        return;
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        setErrorMessage("Ukuran video maksimal 255MB");
        return;
      }

      // Revoke old video preview before setting new one
      if (videoPreview) URL.revokeObjectURL(videoPreview);

      setVideoFile(file);
      setVideoSize(formatBytes(file.size));
      setErrorMessage(null);
      setUploadStatus("idle");

      // Create preview + get duration
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    },
    [videoPreview]
  );

  const handleVideoLoaded = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      const dur = video.duration;

      if (dur > MAX_DURATION) {
        setErrorMessage("Durasi video maksimal 3 menit");
        // Revoke URL before clearing state
        if (videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoFile(null);
        setVideoPreview(null);
        return;
      }

      setVideoDuration(dur);

      // Seek to first frame for thumbnail
      video.currentTime = 0.5;
    },
    [videoPreview]
  );

  const handleVideoSeeked = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      generateThumbnail(e.currentTarget);
    },
    [generateThumbnail]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Judul wajib diisi");
      return;
    }
    if (!videoFile || !thumbnailBlob) {
      setErrorMessage("Video wajib diisi");
      return;
    }

    setUploadStatus("uploading");
    setErrorMessage(null);

    try {
      const thumbFile = new File([thumbnailBlob], "thumbnail.jpg", {
        type: "image/jpeg",
      });

      await uploadVideo(title, videoFile, thumbFile, videoDuration);
      setUploadStatus("done");

      // Prevent double close
      setTimeout(() => {
        if (!closedRef.current) {
          closedRef.current = true;
          onSuccess();
          onClose();
        }
      }, 800);
    } catch (err) {
      setUploadStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal upload video"
      );
    }
  };

  const handleClose = () => {
    if (!closedRef.current) {
      closedRef.current = true;
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-1 text-textMuted hover:text-textMain transition-colors"
          onClick={handleClose}
          aria-label="Close"
        >
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

        <h2 className="text-xl font-bold text-textMain mb-4">Upload Video</h2>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Video preview / drop zone */}
          <div className="upload-file-section">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
            />

            {videoPreview ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full rounded-lg"
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                  controls
                  onLoadedMetadata={handleVideoLoaded}
                  onSeeked={handleVideoSeeked}
                />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(videoDuration)} · {videoSize}
                </div>
              </div>
            ) : (
              <div
                className={`upload-file-btn ${isDragOver ? "drag-over" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Klik atau drag video ke sini</span>
                <span className="upload-file-hint">
                  MP4, WebM, MOV (max 255MB, 3 menit)
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail preview */}
          {thumbnailPreview && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-textMuted">Thumbnail:</span>
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-16 h-12 object-cover rounded border"
              />
            </div>
          )}

          {/* Title input */}
          <div className="upload-title-section">
            <label htmlFor="video-title" className="upload-label">
              Judul
            </label>
            <input
              id="video-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul video..."
              maxLength={50}
              className="upload-input"
            />
            <span className="upload-char-count">{title.length}/50</span>
          </div>

          {/* Upload progress bar */}
          {uploadStatus !== "idle" && (
            <div className="video-upload-progress">
              <div
                className={`video-upload-bar ${uploadStatus}`}
                style={{
                  width:
                    uploadStatus === "uploading"
                      ? "70%"
                      : "100%",
                }}
              />
              <span className="video-upload-label">
                {uploadStatus === "uploading" && "Mengupload..."}
                {uploadStatus === "done" && "✓ Berhasil!"}
                {uploadStatus === "error" && "Upload gagal"}
              </span>
            </div>
          )}

          {/* Error message */}
          {errorMessage && <div className="upload-error">{errorMessage}</div>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={
              uploadStatus === "uploading" ||
              uploadStatus === "done" ||
              !videoFile ||
              !title.trim() ||
              !thumbnailBlob
            }
            className="upload-submit-btn"
          >
            {uploadStatus === "uploading" ? (
              <span className="upload-loading">
                <span className="spinner" />
                Uploading...
              </span>
            ) : (
              "Upload Video"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
