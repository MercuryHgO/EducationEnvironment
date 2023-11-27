/*
  Warnings:

  - You are about to drop the `DestoyedTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DestoyedTokens";

-- CreateTable
CREATE TABLE "DestroyedTokens" (
    "Token" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DestroyedTokens_Token_key" ON "DestroyedTokens"("Token");
