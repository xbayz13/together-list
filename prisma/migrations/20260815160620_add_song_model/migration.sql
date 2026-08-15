-- CreateTable
CREATE TABLE "songs" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "artist" VARCHAR(200) NOT NULL,
    "videoId" VARCHAR(20) NOT NULL,
    "thumbnailUrl" VARCHAR(500) NOT NULL,
    "duration" VARCHAR(10),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "songs_videoId_key" ON "songs"("videoId");
