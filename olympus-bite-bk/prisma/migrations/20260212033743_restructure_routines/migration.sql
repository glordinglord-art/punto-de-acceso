/*
  Warnings:

  - You are about to drop the column `notes` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `routine_id` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `day_of_week` on the `routines` table. All the data in the column will be lost.
  - You are about to drop the column `duration_minutes` on the `routines` table. All the data in the column will be lost.
  - Added the required column `routine_day_id` to the `exercises` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MuscleGroup" ADD VALUE 'quads';
ALTER TYPE "MuscleGroup" ADD VALUE 'hamstrings';
ALTER TYPE "MuscleGroup" ADD VALUE 'calves';
ALTER TYPE "MuscleGroup" ADD VALUE 'forearms';
ALTER TYPE "MuscleGroup" ADD VALUE 'traps';
ALTER TYPE "MuscleGroup" ADD VALUE 'core';
ALTER TYPE "MuscleGroup" ADD VALUE 'abductors';
ALTER TYPE "MuscleGroup" ADD VALUE 'adductors';
ALTER TYPE "MuscleGroup" ADD VALUE 'hybrid';

-- DropForeignKey
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_routine_id_fkey";

-- AlterTable
ALTER TABLE "exercises" DROP COLUMN "notes",
DROP COLUMN "routine_id",
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "routine_day_id" TEXT NOT NULL,
ALTER COLUMN "reps" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "routines" DROP COLUMN "day_of_week",
DROP COLUMN "duration_minutes",
ADD COLUMN     "week_count" INTEGER NOT NULL DEFAULT 4,
ALTER COLUMN "description" SET DEFAULT '';

-- CreateTable
CREATE TABLE "routine_days" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "focus_area" TEXT NOT NULL,
    "is_rest_day" BOOLEAN NOT NULL DEFAULT false,
    "rest_day_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_logs" (
    "id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "reps_done" TEXT,
    "observations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "routine_days_routine_id_day_number_key" ON "routine_days"("routine_id", "day_number");

-- CreateIndex
CREATE UNIQUE INDEX "workout_logs_exercise_id_user_id_week_number_key" ON "workout_logs"("exercise_id", "user_id", "week_number");

-- AddForeignKey
ALTER TABLE "routine_days" ADD CONSTRAINT "routine_days_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_routine_day_id_fkey" FOREIGN KEY ("routine_day_id") REFERENCES "routine_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
