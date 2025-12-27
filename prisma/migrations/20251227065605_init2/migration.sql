/*
  Warnings:

  - You are about to drop the column `filled_quantity` on the `Order` table. All the data in the column will be lost.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `side` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MARKET', 'LIMIT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'PARTIAL', 'FILLED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "filled_quantity",
ADD COLUMN     "filledQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "side" "OrderSide" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "OrderType" NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'OPEN';

-- DropEnum
DROP TYPE "ORDERSTATUS";

-- DropEnum
DROP TYPE "ORDERTYPE";
