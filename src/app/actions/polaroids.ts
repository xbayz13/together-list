"use server";

import { prisma } from "../lib/db";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

export type PolaroidData = {
  id: number;
  title: string;
  imageUrl: string;
  createdAt: Date;
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "polaroids");
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function getPolaroids(): Promise<PolaroidData[]> {
  try {
    const polaroids = await prisma.polaroid.findMany({
      orderBy: { createdAt: "desc" },
    });
    return polaroids;
  } catch (error) {
    console.error("Failed to fetch polaroids:", error);
    throw new Error("Gagal mengambil data polaroid");
  }
}

export async function createPolaroid(
  title: string,
  file: File
): Promise<PolaroidData> {
  // Validation
  if (!title || title.trim().length === 0) {
    throw new Error("Judul wajib diisi");
  }
  if (title.length > 50) {
    throw new Error("Judul maksimal 50 karakter");
  }
  if (!file) {
    throw new Error("Foto wajib diisi");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Format foto tidak didukung (jpg, png, webp, heic)");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Ukuran foto maksimal 5MB");
  }

  try {
    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // Generate filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${random}.webp`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Convert to WebP using Sharp
    const buffer = Buffer.from(await file.arrayBuffer());
    await sharp(buffer)
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    // Save to database
    const imageUrl = `/uploads/polaroids/${filename}`;
    const polaroid = await prisma.polaroid.create({
      data: {
        title: title.trim(),
        imageUrl,
      },
    });

    return polaroid;
  } catch (error) {
    console.error("Failed to create polaroid:", error);
    throw new Error("Gagal upload foto");
  }
}

export async function deletePolaroid(id: number): Promise<void> {
  try {
    // Get polaroid to find file path
    const polaroid = await prisma.polaroid.findUnique({ where: { id } });
    if (!polaroid) {
      throw new Error("Polaroid tidak ditemukan");
    }

    // Delete file from disk
    const filepath = path.join(process.cwd(), "public", polaroid.imageUrl);
    try {
      await fs.unlink(filepath);
    } catch {
      // File might not exist, continue with database delete
    }

    // Delete from database
    await prisma.polaroid.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete polaroid:", error);
    throw new Error("Gagal menghapus polaroid");
  }
}
