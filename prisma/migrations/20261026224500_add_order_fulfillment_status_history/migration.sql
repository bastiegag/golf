-- Replace the checkout-only status vocabulary with fulfillment statuses.
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";

CREATE TYPE "OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);

ALTER TABLE "Order"
    ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Order"
    ALTER COLUMN "status" TYPE "OrderStatus"
    USING (
        CASE
            WHEN "status"::text = 'CONFIRMED' THEN 'PENDING'
            ELSE "status"::text
        END
    )::"OrderStatus";

DROP TYPE "OrderStatus_old";

ALTER TABLE "Order"
    ALTER COLUMN "status" SET DEFAULT 'PENDING';

CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "previousStatus" "OrderStatus" NOT NULL,
    "newStatus" "OrderStatus" NOT NULL,
    "administratorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx"
    ON "OrderStatusHistory"("orderId", "createdAt");
CREATE INDEX "OrderStatusHistory_administratorId_idx"
    ON "OrderStatusHistory"("administratorId");

ALTER TABLE "OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderStatusHistory"
    ADD CONSTRAINT "OrderStatusHistory_administratorId_fkey"
    FOREIGN KEY ("administratorId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
