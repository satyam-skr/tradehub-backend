/*
  Warnings:

  - You are about to drop the column `updadedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updadedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updadedAt` on the `Wallet` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "updadedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updadedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "updadedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
