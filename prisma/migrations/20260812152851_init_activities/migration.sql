-- CreateEnum
CREATE TYPE "Status" AS ENUM ('IDE', 'DIJADKANIN', 'DONE', 'BATAL');

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "date" TIMESTAMP(3),
    "status" "Status" NOT NULL DEFAULT 'IDE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);
