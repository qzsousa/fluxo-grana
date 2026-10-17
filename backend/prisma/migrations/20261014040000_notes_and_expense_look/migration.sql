-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "color" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Note_userId_createdAt_idx" ON "Note"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: identidade visual da despesa + marcação de compra quitada
ALTER TABLE "Transaction"
    ADD COLUMN "icon" TEXT,
    ADD COLUMN "color" TEXT,
    ADD COLUMN "invoicePaidAt" TIMESTAMP(3),
    ADD COLUMN "invoicePaymentId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_userId_invoicePaidAt_idx" ON "Transaction"("userId", "invoicePaidAt");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_invoicePaymentId_fkey" FOREIGN KEY ("invoicePaymentId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;