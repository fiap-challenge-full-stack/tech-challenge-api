-- CreateTable
CREATE TABLE "comentarios" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "postUuid" UUID NOT NULL,
    "autorUuid" UUID NOT NULL,
    "autorNome" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comentarios_uuid_key" ON "comentarios"("uuid");

-- CreateIndex
CREATE INDEX "comentarios_postUuid_idx" ON "comentarios"("postUuid");
