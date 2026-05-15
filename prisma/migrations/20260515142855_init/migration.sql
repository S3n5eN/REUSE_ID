-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PendingApproval', 'Tersedia', 'Diambil', 'Ditolak');

-- CreateEnum
CREATE TYPE "ItemQuality" AS ENUM ('SangatBaik', 'Baik', 'CukupBaik', 'Layak', 'CukupLayak');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('Pending', 'Approved', 'Delivered');

-- CreateEnum
CREATE TYPE "userProfile_gender" AS ENUM ('Pria', 'Wanita');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Unpaid', 'Paid', 'Failed');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "poin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "managerName" TEXT NOT NULL,
    "managerPhone" TEXT NOT NULL,
    "operationalJam" TEXT NOT NULL,
    "keyLocation" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "placeId" INTEGER NOT NULL,
    "imageData" BYTEA,
    "imageType" TEXT,
    "rakId" INTEGER,
    "status" "ItemStatus" NOT NULL DEFAULT 'PendingApproval',
    "quality" "ItemQuality",
    "weight" DOUBLE PRECISION,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rak" (
    "id" SERIAL NOT NULL,
    "nomor" TEXT NOT NULL,
    "kapasitasMax" INTEGER NOT NULL,
    "kapasitasSekarang" INTEGER NOT NULL DEFAULT 0,
    "placeId" INTEGER NOT NULL,

    CONSTRAINT "rak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "adminId" INTEGER,
    "userProfileId" INTEGER,
    "type" TEXT NOT NULL,
    "claimType" TEXT,
    "receivedAt" TIMESTAMP(3),
    "receiverAddress" TEXT,
    "isAutoApproved" BOOLEAN NOT NULL DEFAULT false,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredDate" TIMESTAMP(3),
    "shipmentCost" INTEGER,
    "distance" DOUBLE PRECISION,
    "deliveryLat" DOUBLE PRECISION,
    "deliveryLng" DOUBLE PRECISION,
    "paymentMethod" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'Unpaid',

    CONSTRAINT "shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate" (
    "id" SERIAL NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "caption" TEXT,
    "imageData" BYTEA NOT NULL,
    "imageType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsRead" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "newsId" INTEGER NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pekerjaan" TEXT,
    "address" TEXT NOT NULL,
    "usia" INTEGER NOT NULL,
    "gender" "userProfile_gender" NOT NULL,
    "identityId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "profileImage" BYTEA,
    "profileImageType" TEXT,

    CONSTRAINT "userProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passwordReset" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "passwordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_adminToplace" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_adminToplace_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE INDEX "Item_userId_fkey" ON "item"("userId");

-- CreateIndex
CREATE INDEX "Item_placeId_fkey" ON "item"("placeId");

-- CreateIndex
CREATE INDEX "Item_rakId_fkey" ON "item"("rakId");

-- CreateIndex
CREATE INDEX "rak_placeId_idx" ON "rak"("placeId");

-- CreateIndex
CREATE INDEX "Shipment_userId_fkey_new" ON "shipment"("userId");

-- CreateIndex
CREATE INDEX "Shipment_adminId_fkey_new" ON "shipment"("adminId");

-- CreateIndex
CREATE INDEX "Shipment_userProfileId_fkey_new" ON "shipment"("userProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_itemId_type_key" ON "shipment"("itemId", "type");

-- CreateIndex
CREATE INDEX "Certificate_userId_fkey" ON "certificate"("userId");

-- CreateIndex
CREATE INDEX "News_adminId_fkey" ON "news"("adminId");

-- CreateIndex
CREATE INDEX "newsRead_userId_idx" ON "newsRead"("userId");

-- CreateIndex
CREATE INDEX "newsRead_newsId_idx" ON "newsRead"("newsId");

-- CreateIndex
CREATE UNIQUE INDEX "newsRead_userId_newsId_key" ON "newsRead"("userId", "newsId");

-- CreateIndex
CREATE UNIQUE INDEX "userProfile_userId_key" ON "userProfile"("userId");

-- CreateIndex
CREATE INDEX "UserProfile_userId_fkey" ON "userProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "passwordReset_token_key" ON "passwordReset"("token");

-- CreateIndex
CREATE INDEX "_adminToplace_B_index" ON "_adminToplace"("B");

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_rakId_fkey" FOREIGN KEY ("rakId") REFERENCES "rak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rak" ADD CONSTRAINT "rak_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "Shipment_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "Shipment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "Shipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "Shipment_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "userProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsRead" ADD CONSTRAINT "newsRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsRead" ADD CONSTRAINT "newsRead_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userProfile" ADD CONSTRAINT "userProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_adminToplace" ADD CONSTRAINT "_adminToplace_A_fkey" FOREIGN KEY ("A") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_adminToplace" ADD CONSTRAINT "_adminToplace_B_fkey" FOREIGN KEY ("B") REFERENCES "place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
