"use server";

import { prisma } from "../lib/db";
import path from "path";
import fs from "fs/promises";
import { convertToWebM } from "../lib/ffmpeg";

const VIDEO_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "polaroids",
  "videos"
);
const THUMBNAIL_UPLOAD_DIR = path.join(
  process.cwd(),
  "public",
  "uploads",
  "polaroids",
  "thumbnails"
);
const MAX_VIDEO_SIZE = 255 * 1024 * 1024; // 255MB
const MAX_DURATION = 180; // 3 menit
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export type VideoUploadResult = {
  id: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  type: string;
  createdAt: Date;
};

export async function uploadVideo(
  title: string,
  videoFile: File,
  thumbnailFile: File,
  duration: number
): Promise<VideoUploadResult> {
  // Validation
  if (!title || title.trim().length === 0) {
    throw new Error("Judul wajib diisi");
  }
  if (title.length > 50) {
    throw new Error("Judul maksimal 50 karakter");
  }
  if (!videoFile) {
    throw new Error("Video wajib diisi");
  }
  if (!ALLOWED_VIDEO_TYPES.includes(videoFile.type)) {
    throw new Error("Format video tidak didukung (mp4, webm, mov)");
  }
  if (videoFile.size > MAX_VIDEO_SIZE) {
    throw new Error("Ukuran video maksimal 255MB");
  }
  if (duration > MAX_DURATION) {
    throw new Error("Durasi video maksimal 3 menit");
  }
  if (duration <= 0) {
    throw new Error("Durasi video tidak valid");
  }
  if (!thumbnailFile || !thumbnailFile.type.startsWith("image/")) {
    throw new Error("Thumbnail tidak valid");
  }

  try {
    // Ensure directories exist
    await fs.mkdir(VIDEO_UPLOAD_DIR, { recursive: true });
    await fs.mkdir(THUMBNAIL_UPLOAD_DIR, { recursive: true });

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    // Save video file
    const videoExt = getVideoExtension(videoFile.type);
    const videoFilename = `${timestamp}-${random}${videoExt}`;
    const videoPath = path.join(VIDEO_UPLOAD_DIR, videoFilename);
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    await fs.writeFile(videoPath, videoBuffer);

    // Save thumbnail file
    const thumbFilename = `${timestamp}-${random}-thumb.webp`;
    const thumbPath = path.join(THUMBNAIL_UPLOAD_DIR, thumbFilename);
    const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
    await fs.writeFile(thumbPath, thumbBuffer);

    // DB paths
    const videoUrl = `/uploads/polaroids/videos/${videoFilename}`;
    const thumbnailUrl = `/uploads/polaroids/thumbnails/${thumbFilename}`;

    // Save to database
    const polaroid = await prisma.polaroid.create({
      data: {
        title: title.trim(),
        videoUrl,
        thumbnailUrl,
        duration,
        type: "video",
      },
    });

    // Background: convert to WebM (don't await)
    const webmPath = path.join(
      VIDEO_UPLOAD_DIR,
      `${timestamp}-${random}.webm`
    );
    convertToWebM(videoPath, webmPath, polaroid.id).catch((err) => {
      console.error("[VideoUpload] Background convert error:", err);
    });

    return polaroid as VideoUploadResult;
  } catch (error) {
    console.error("Failed to upload video:", error);
    throw new Error("Gagal upload video");
  }
}

function getVideoExtension(mimeType: string): string {
  switch (mimeType) {
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    default:
      return ".mp4";
  }
}
