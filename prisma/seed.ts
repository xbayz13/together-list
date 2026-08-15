import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const defaultSongs = [
  {
    title: "Merry Christmas, i miss you",
    artist: "Alex Crichton",
    videoId: "gwmIfKy7kEQ",
    thumbnailUrl: "https://img.youtube.com/vi/gwmIfKy7kEQ/mqdefault.jpg",
    duration: null,
    order: 0,
  },
  {
    title: "There Is A Light That Never Goes Out",
    artist: "The Smiths",
    videoId: "siO6dkqidc4",
    thumbnailUrl: "https://img.youtube.com/vi/siO6dkqidc4/mqdefault.jpg",
    duration: null,
    order: 1,
  },
];

async function main() {
  console.log("Seeding songs...");

  for (const song of defaultSongs) {
    const existing = await prisma.song.findUnique({
      where: { videoId: song.videoId },
    });

    if (!existing) {
      await prisma.song.create({ data: song });
      console.log(`  ✓ Added: ${song.artist} - ${song.title}`);
    } else {
      console.log(`  → Skipped (exists): ${song.artist} - ${song.title}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
