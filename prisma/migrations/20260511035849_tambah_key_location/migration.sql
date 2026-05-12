/*
  Warnings:

  - Added the required column `keyLocation` to the `place` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `place` ADD COLUMN `keyLocation` VARCHAR(191) NOT NULL;
