-- Add category visibility without changing existing relationships.
ALTER TABLE "Category" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
