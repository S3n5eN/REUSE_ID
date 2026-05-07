/*
  Warnings:

  - You are about to drop the column `imageURL` on the `item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `item` DROP COLUMN `imageURL`,
    ADD COLUMN `imageData` LONGBLOB NULL,
    ADD COLUMN `imageType` VARCHAR(191) NULL;
