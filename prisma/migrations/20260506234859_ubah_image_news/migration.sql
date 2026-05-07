/*
  Warnings:

  - You are about to drop the column `image` on the `news` table. All the data in the column will be lost.
  - Added the required column `imageData` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageType` to the `news` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `news` DROP COLUMN `image`,
    ADD COLUMN `imageData` LONGBLOB NOT NULL,
    ADD COLUMN `imageType` VARCHAR(191) NOT NULL;
