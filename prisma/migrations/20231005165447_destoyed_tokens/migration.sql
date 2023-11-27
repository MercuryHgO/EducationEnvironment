-- CreateTable
CREATE TABLE "DestoyedTokens" (
    "Token" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DestoyedTokens_Token_key" ON "DestoyedTokens"("Token");
