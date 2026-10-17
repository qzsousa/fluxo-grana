-- Um único marcador de "quitado" para os dois caminhos de pagamento.
-- Antes havia `invoicePaidAt`, que só fazia sentido para cartão.
ALTER TABLE "Transaction" RENAME COLUMN "invoicePaidAt" TO "paidAt";
ALTER TABLE "Transaction" RENAME COLUMN "invoicePaymentId" TO "paymentId";

-- Índice para o filtro "somente pendentes" da lista de transações.
CREATE INDEX "Transaction_userId_status_idx" ON "Transaction"("userId", "status");