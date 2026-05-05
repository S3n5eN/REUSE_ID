/*
  Warnings:

  - You are about to drop the column `description` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `eventDate` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `isPopup` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `organizer` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `news` table. All the data in the column will be lost.
  - Added the required column `adminId` to the `news` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `Admin_placeId_fkey`;

-- DropForeignKey
ALTER TABLE `news` DROP FOREIGN KEY `News_userId_fkey`;

-- DropIndex
DROP INDEX `News_userId_fkey` ON `news`;

-- AlterTable
ALTER TABLE `admin` MODIFY `placeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `news` DROP COLUMN `description`,
    DROP COLUMN `eventDate`,
    DROP COLUMN `isActive`,
    DROP COLUMN `isPopup`,
    DROP COLUMN `location`,
    DROP COLUMN `organizer`,
    DROP COLUMN `userId`,
    ADD COLUMN `adminId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `News_adminId_fkey` ON `news`(`adminId`);

-- AddForeignKey
ALTER TABLE `admin` ADD CONSTRAINT `Admin_placeId_fkey` FOREIGN KEY (`placeId`) REFERENCES `place`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news` ADD CONSTRAINT `News_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
