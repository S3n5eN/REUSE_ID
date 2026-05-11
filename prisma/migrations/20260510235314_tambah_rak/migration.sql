-- AlterTable
ALTER TABLE `item` ADD COLUMN `rakId` INTEGER NULL;

-- CreateTable
CREATE TABLE `rak` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomor` VARCHAR(191) NOT NULL,
    `kapasitasMax` INTEGER NOT NULL,
    `kapasitasSekarang` INTEGER NOT NULL DEFAULT 0,
    `placeId` INTEGER NOT NULL,

    INDEX `rak_placeId_fkey`(`placeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `newsRead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `newsId` INTEGER NOT NULL,
    `readAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `newsRead_userId_idx`(`userId`),
    INDEX `newsRead_newsId_idx`(`newsId`),
    UNIQUE INDEX `newsRead_userId_newsId_key`(`userId`, `newsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Item_rakId_fkey` ON `item`(`rakId`);

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `Item_rakId_fkey` FOREIGN KEY (`rakId`) REFERENCES `rak`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rak` ADD CONSTRAINT `rak_placeId_fkey` FOREIGN KEY (`placeId`) REFERENCES `place`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `newsRead` ADD CONSTRAINT `newsRead_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `newsRead` ADD CONSTRAINT `newsRead_newsId_fkey` FOREIGN KEY (`newsId`) REFERENCES `news`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
