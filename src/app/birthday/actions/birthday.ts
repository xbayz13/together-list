"use server";

import { PrismaClient } from "../../../../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

export type BirthdaySlideData = {
  id: number;
  type: string;
  content: string | null;
  photoId: number | null;
  photoUrl: string | null;
  videoUrl: string | null;
  order: number;
};

export type BirthdayConfigData = {
  musicSongId: number | null;
};

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function getBirthdaySlides(): Promise<BirthdaySlideData[]> {
  const slides = await prisma.birthdaySlide.findMany({
    orderBy: { order: "asc" },
    include: { photo: true },
  });
  return slides.map((s) => ({
    id: s.id,
    type: s.type,
    content: s.content,
    photoId: s.photoId,
    photoUrl: s.photo?.imageUrl || null,
    videoUrl: s.photo?.videoUrl || null,
    order: s.order,
  }));
}

export async function getBirthdayConfig(): Promise<BirthdayConfigData> {
  const config = await prisma.birthdayConfig.findUnique({ where: { id: 1 } });
  return { musicSongId: config?.musicSongId || null };
}

export async function createBirthdaySlide(
  type: "photo" | "message" | "banner",
  content?: string,
  photoId?: number
): Promise<ActionResult & { slide?: BirthdaySlideData }> {
  try {
    const maxOrder = await prisma.birthdaySlide.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const slide = await prisma.birthdaySlide.create({
      data: {
        type,
        content: content || null,
        photoId: photoId || null,
        order: nextOrder,
      },
      include: { photo: true },
    });

    return {
      success: true,
      slide: {
        id: slide.id,
        type: slide.type,
        content: slide.content,
        photoId: slide.photoId,
        photoUrl: slide.photo?.imageUrl || null,
        videoUrl: slide.photo?.videoUrl || null,
        order: slide.order,
      },
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Gagal membuat slide" };
  }
}

export async function updateBirthdaySlide(
  id: number,
  data: { content?: string; order?: number }
): Promise<ActionResult> {
  try {
    await prisma.birthdaySlide.update({ where: { id }, data });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Gagal update slide" };
  }
}

export async function deleteBirthdaySlide(id: number): Promise<ActionResult> {
  try {
    await prisma.birthdaySlide.delete({ where: { id } });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Gagal hapus slide" };
  }
}

export async function reorderBirthdaySlides(orderedIds: number[]): Promise<ActionResult> {
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.birthdaySlide.update({
          where: { id },
          data: { order: index },
        })
      )
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Gagal reorder slide" };
  }
}

export async function updateBirthdayMusic(songId: number | null): Promise<ActionResult> {
  try {
    await prisma.birthdayConfig.upsert({
      where: { id: 1 },
      update: { musicSongId: songId },
      create: { id: 1, musicSongId: songId },
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Gagal update musik" };
  }
}
