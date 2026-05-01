-- CreateEnum
CREATE TYPE "BudgetKind" AS ENUM ('MASTER', 'MONTHLY');

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "BudgetKind" NOT NULL,
    "periodKey" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "sourceBudgetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "Category" ADD COLUMN "budgetId" TEXT;

-- Backfill each family's existing categories into a generated master budget snapshot.
INSERT INTO "Budget" ("id", "name", "kind", "periodKey", "familyId", "createdAt", "updatedAt")
SELECT
    'master_' || "id",
    'Master Budget',
    'MASTER'::"BudgetKind",
    'MASTER',
    "id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Family";

UPDATE "Category"
SET "budgetId" = 'master_' || "familyId"
WHERE "budgetId" IS NULL;

-- AlterColumn
ALTER TABLE "Category" ALTER COLUMN "budgetId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Budget_familyId_periodKey_key" ON "Budget"("familyId", "periodKey");

-- CreateIndex
CREATE INDEX "Budget_familyId_kind_idx" ON "Budget"("familyId", "kind");

-- CreateIndex
CREATE INDEX "Category_budgetId_idx" ON "Category"("budgetId");

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_sourceBudgetId_fkey" FOREIGN KEY ("sourceBudgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
