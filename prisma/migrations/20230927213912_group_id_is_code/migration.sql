/*
  Warnings:

  - You are about to drop the column `groupId` on the `GradeLog` table. All the data in the column will be lost.
  - The primary key for the `Group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `ScheduleChanges` table. All the data in the column will be lost.
  - You are about to drop the column `groupId` on the `Student` table. All the data in the column will be lost.
  - Added the required column `groupCode` to the `GradeLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupCode` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupCode` to the `ScheduleChanges` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupCode` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GradeLog" DROP CONSTRAINT "GradeLog_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleChanges" DROP CONSTRAINT "ScheduleChanges_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_groupId_fkey";

-- AlterTable
ALTER TABLE "GradeLog" DROP COLUMN "groupId",
ADD COLUMN     "groupCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Group" DROP CONSTRAINT "Group_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Group_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "groupId",
ADD COLUMN     "groupCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ScheduleChanges" DROP COLUMN "groupId",
ADD COLUMN     "groupCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "groupId",
ADD COLUMN     "groupCode" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_groupCode_fkey" FOREIGN KEY ("groupCode") REFERENCES "Group"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeLog" ADD CONSTRAINT "GradeLog_groupCode_fkey" FOREIGN KEY ("groupCode") REFERENCES "Group"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_groupCode_fkey" FOREIGN KEY ("groupCode") REFERENCES "Group"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleChanges" ADD CONSTRAINT "ScheduleChanges_groupCode_fkey" FOREIGN KEY ("groupCode") REFERENCES "Group"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
