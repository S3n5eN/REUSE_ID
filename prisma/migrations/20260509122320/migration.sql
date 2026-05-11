/*
  Warnings:

  - The values [Rejected] on the enum `shipment_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `news` ADD COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `shipment` MODIFY `status` ENUM('Pending', 'Approved', 'Delivered') NOT NULL DEFAULT 'Pending';
