-- AddColumn
ALTER TABLE "Income" ADD COLUMN "periodKey" TEXT;

-- Backfill existing rows into the master income period.
UPDATE "Income"
SET "periodKey" = 'MASTER'
WHERE "periodKey" IS NULL;

-- AlterColumn
ALTER TABLE "Income" ALTER COLUMN "periodKey" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Income_familyId_periodKey_idx" ON "Income"("familyId", "periodKey");
