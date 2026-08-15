"use server";

import { prisma } from "../lib/db";

export type SongData = {
  id: number;
  title: string;
  artist: string;
  videoId: string;
  thumbnailUrl: string;
  duration: string | null;
  order: number;
  createdAt: Date;
};

export async function getSongs(): Promise<SongData[]> {
  try {
    const songs = await prisma.song.findMany({
      orderBy: { order: "asc" },
    });
    return songs;
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    throw new Error("Gagal mengambil data lagu");
  }
}

export async function addSong(
  videoId: string,
  title: string,
  artist: string,
  thumbnailUrl: string,
  duration: string | null
): Promise<SongData> {
  if (!videoId || videoId.trim().length === 0) {
    throw new Error("Video ID wajib diisi");
  }
  if (!title || title.trim().length === 0) {
    throw new Error("Judul lagu wajib diisi");
  }
  if (!artist || artist.trim().length === 0) {
    throw new Error("Nama artist wajib diisi");
  }

  // Check for duplicate
  const existing = await prisma.song.findUnique({
    where: { videoId },
  });
  if (existing) {
    throw new Error("Lagu sudah ada di playlist");
  }

  try {
    // Get max order
    const maxOrderSong = await prisma.song.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (maxOrderSong?.order ?? -1) + 1;

    const song = await prisma.song.create({
      data: {
        videoId,
        title: title.trim(),
        artist: artist.trim(),
        thumbnailUrl,
        duration,
        order: nextOrder,
      },
    });
    return song;
  } catch (error) {
    console.error("Failed to add song:", error);
    throw new Error("Gagal menambahkan lagu");
  }
}

export async function deleteSong(id: number): Promise<void> {
  try {
    await prisma.song.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete song:", error);
    throw new Error("Gagal menghapus lagu");
  }
}
