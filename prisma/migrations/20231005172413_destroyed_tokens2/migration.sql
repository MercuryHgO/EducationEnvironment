/*
  Warnings:

  - Added the required column `ClearAt` to the `DestroyedTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DestroyedTokens" ADD COLUMN     "ClearAt" TIMESTAMP(3) NOT NULL;
