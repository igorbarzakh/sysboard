-- Add nullable column first so existing boards can be backfilled safely.
ALTER TABLE "Board" ADD COLUMN "createdById" TEXT;

-- Prefer the earliest board member as creator for existing boards.
UPDATE "Board" AS b
SET "createdById" = bm."userId"
FROM (
    SELECT DISTINCT ON ("boardId") "boardId", "userId"
    FROM "BoardMember"
    ORDER BY "boardId", "joinedAt" ASC
) AS bm
WHERE b."id" = bm."boardId";

-- Fall back to workspace owner if a board has no board members.
UPDATE "Board" AS b
SET "createdById" = w."ownerId"
FROM "Workspace" AS w
WHERE b."workspaceId" = w."id"
  AND b."createdById" IS NULL;

ALTER TABLE "Board" ALTER COLUMN "createdById" SET NOT NULL;

CREATE INDEX "Board_createdById_idx" ON "Board"("createdById");

ALTER TABLE "Board" ADD CONSTRAINT "Board_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
