-- AlterTable
ALTER TABLE `item` ADD COLUMN `weight` DOUBLE NULL;

-- AlterTable
ALTER TABLE `place` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;

-- AlterTable
ALTER TABLE `shipment` ADD COLUMN `distance` DOUBLE NULL,
    ADD COLUMN `shipmentCost` INTEGER NULL;

-- AlterTable
ALTER TABLE `userprofile` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL;
