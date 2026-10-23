-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- Seed categories before assigning the existing products.
INSERT INTO "Category" ("id", "name", "slug", "createdAt", "updatedAt")
VALUES
  ('category_clothing', 'Clothing', 'clothing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('category_accessories', 'Accessories', 'accessories', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('category_stationery', 'Stationery', 'stationery', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add the relation as nullable while existing products are backfilled.
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

UPDATE "Product"
SET "categoryId" = CASE "slug"
  WHEN 'harbor-knit' THEN 'category_clothing'
  WHEN 'everyday-tote' THEN 'category_accessories'
  WHEN 'field-notes-set' THEN 'category_stationery'
  ELSE 'category_clothing'
END;

-- Existing products outside the seed catalogue remain available and receive a
-- safe default before the relation becomes required.
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
