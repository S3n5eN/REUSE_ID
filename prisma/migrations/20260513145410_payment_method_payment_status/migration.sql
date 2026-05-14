-- AlterTable
ALTER TABLE `shipment` ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` ENUM('Unpaid', 'Paid', 'Failed') NOT NULL DEFAULT 'Unpaid';
