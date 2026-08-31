-- CreateTable
CREATE TABLE "birthday_slides" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "photoId" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birthday_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "birthday_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "musicSongId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birthday_config_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "birthday_slides" ADD CONSTRAINT "birthday_slides_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "polaroids"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birthday_config" ADD CONSTRAINT "birthday_config_musicSongId_fkey" FOREIGN KEY ("musicSongId") REFERENCES "songs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
