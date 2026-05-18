ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'WaitingVerification';

ALTER TABLE "shipment"
ADD COLUMN "paymentInvoice" TEXT,
ADD COLUMN "paymentTotal" INTEGER,
ADD COLUMN "paymentExpiredAt" TIMESTAMP(3),
ADD COLUMN "transferBankCode" TEXT,
ADD COLUMN "transferBankName" TEXT,
ADD COLUMN "transferAccountNumber" TEXT,
ADD COLUMN "transferAccountHolder" TEXT,
ADD COLUMN "payerBank" TEXT,
ADD COLUMN "payerAccountName" TEXT,
ADD COLUMN "transferProofImage" BYTEA,
ADD COLUMN "transferProofType" TEXT,
ADD COLUMN "transferProofUploadedAt" TIMESTAMP(3),
ADD COLUMN "paymentVerifiedAt" TIMESTAMP(3);
