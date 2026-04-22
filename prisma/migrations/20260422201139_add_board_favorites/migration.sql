CREATE TABLE "BoardFavorite" (
    "boardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardFavorite_pkey" PRIMARY KEY ("boardId","userId")
);

CREATE INDEX "BoardFavorite_userId_createdAt_idx" ON "BoardFavorite"("userId", "createdAt");

ALTER TABLE "BoardFavorite" ADD CONSTRAINT "BoardFavorite_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardFavorite" ADD CONSTRAINT "BoardFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
