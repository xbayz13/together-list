-- AlterTable
ALTER TABLE "polaroids" ADD COLUMN     "duration" DOUBLE PRECISION,
ADD COLUMN     "thumbnailUrl" VARCHAR(500),
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'photo',
ADD COLUMN     "videoUrl" VARCHAR(500),
ALTER COLUMN "imageUrl" DROP NOT NULL;
