/*
  Warnings:

  - You are about to drop the column `placeId` on the `admin` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `admin` DROP FOREIGN KEY `Admin_placeId_fkey`;

-- DropIndex
DROP INDEX `Admin_placeId_fkey` ON `admin`;

-- AlterTable
ALTER TABLE `admin` DROP COLUMN `placeId`;

-- CreateTable
CREATE TABLE `_adminToplace` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_adminToplace_AB_unique`(`A`, `B`),
    INDEX `_adminToplace_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_adminToplace` ADD CONSTRAINT `_adminToplace_A_fkey` FOREIGN KEY (`A`) REFERENCES `admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_adminToplace` ADD CONSTRAINT `_adminToplace_B_fkey` FOREIGN KEY (`B`) REFERENCES `place`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
