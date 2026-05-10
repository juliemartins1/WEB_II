-- Adiciona controle para ativar/desativar produtos do vendedor
ALTER TABLE "Product" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
