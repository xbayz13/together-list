-- CreateTable
CREATE TABLE "polaroids" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polaroids_pkey" PRIMARY KEY ("id")
);
