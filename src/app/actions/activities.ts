"use server";

import { prisma } from "../lib/db";
import type { Status } from "../../../prisma/generated/prisma/enums";

export type ActivityData = {
  id: number;
  title: string;
  description: string | null;
  date: Date | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
};

export async function getActivities(): Promise<ActivityData[]> {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: [{ date: "asc" }, { createdAt: "desc" }],
    });
    return activities;
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    throw new Error("Gagal mengambil data aktivitas");
  }
}

export async function createActivity(data: {
  title: string;
  description?: string;
  date?: string | null;
  status: Status;
}): Promise<ActivityData> {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Judul wajib diisi");
  }
  if (data.title.length > 100) {
    throw new Error("Judul maksimal 100 karakter");
  }
  if (data.description && data.description.length > 500) {
    throw new Error("Deskripsi maksimal 500 karakter");
  }
  if (data.status === "DIJADKANIN" && !data.date) {
    throw new Error("Status Dijadwalin wajib ada tanggal");
  }

  try {
    const activity = await prisma.activity.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        date: data.date ? new Date(data.date) : null,
        status: data.status === "DIJADKANIN" && data.date ? "DIJADKANIN" : data.status,
      },
    });
    return activity;
  } catch (error) {
    console.error("Failed to create activity:", error);
    throw new Error("Gagal membuat aktivitas");
  }
}

export async function updateActivity(
  id: number,
  data: {
    title: string;
    description?: string;
    date?: string | null;
    status: Status;
  }
): Promise<ActivityData> {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error("Judul wajib diisi");
  }
  if (data.title.length > 100) {
    throw new Error("Judul maksimal 100 karakter");
  }
  if (data.description && data.description.length > 500) {
    throw new Error("Deskripsi maksimal 500 karakter");
  }
  if (data.status === "DIJADKANIN" && !data.date) {
    throw new Error("Status Dijadwalin wajib ada tanggal");
  }

  // Auto-clear date when status changes to IDE
  const finalDate = data.status === "IDE" ? null : data.date;

  try {
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        date: finalDate ? new Date(finalDate) : null,
        status: data.status,
      },
    });
    return activity;
  } catch (error) {
    console.error("Failed to update activity:", error);
    throw new Error("Gagal mengupdate aktivitas");
  }
}

export async function deleteActivity(id: number): Promise<void> {
  try {
    await prisma.activity.delete({ where: { id } });
  } catch (error) {
    console.error("Failed to delete activity:", error);
    throw new Error("Gagal menghapus aktivitas");
  }
}
