UPDATE "Board"
SET "dataVersion" = "dataVersion" + 1
WHERE "data" IS NOT NULL;
