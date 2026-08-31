import { PrismaClient } from "../../../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import BirthdayStory from "./BirthdayStory";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

export default async function BirthdayPage() {
  const [slides, config] = await Promise.all([
    prisma.birthdaySlide.findMany({
      orderBy: { order: "asc" },
      include: { photo: true },
    }),
    prisma.birthdayConfig.findUnique({ where: { id: 1 } }),
  ]);

  const slideData = slides.map((slide) => ({
    id: slide.id,
    type: slide.type,
    content: slide.content,
    photoUrl: slide.photo?.imageUrl || null,
    order: slide.order,
  }));

  const musicVideoId = config?.musicSongId
    ? (
        await prisma.song.findUnique({
          where: { id: config.musicSongId },
          select: { videoId: true },
        })
      )?.videoId || null
    : null;

  return <BirthdayStory slides={slideData} musicVideoId={musicVideoId} />;
}
