/*
  Warnings:

  - You are about to drop the column `groupCode` on the `GradeLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GradeLog" DROP CONSTRAINT "GradeLog_groupCode_fkey";

-- AlterTable
ALTER TABLE "GradeLog" DROP COLUMN "groupCode";
