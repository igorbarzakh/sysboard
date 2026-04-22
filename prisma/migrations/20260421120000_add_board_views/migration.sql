CREATE TABLE "BoardView" (
  "boardId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BoardView_pkey" PRIMARY KEY ("boardId", "userId")
);

CREATE INDEX "BoardView_userId_lastViewedAt_idx" ON "BoardView"("userId", "lastViewedAt");

ALTER TABLE "BoardView"
  ADD CONSTRAINT "BoardView_boardId_fkey"
  FOREIGN KEY ("boardId") REFERENCES "Board"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BoardView"
  ADD CONSTRAINT "BoardView_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
