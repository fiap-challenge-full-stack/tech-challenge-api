-- AlterTable
ALTER TABLE "comentarios" ADD COLUMN     "apagado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "apagadoEm" TIMESTAMP(3);
