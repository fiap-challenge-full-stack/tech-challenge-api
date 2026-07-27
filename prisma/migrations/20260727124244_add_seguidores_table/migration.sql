-- CreateTable
CREATE TABLE "seguidores" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seguidorUuid" UUID NOT NULL,
    "seguidoUuid" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguidores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seguidores_uuid_key" ON "seguidores"("uuid");

-- CreateIndex
CREATE INDEX "seguidores_seguidorUuid_idx" ON "seguidores"("seguidorUuid");

-- CreateIndex
CREATE INDEX "seguidores_seguidoUuid_idx" ON "seguidores"("seguidoUuid");

-- CreateIndex
CREATE UNIQUE INDEX "seguidores_seguidorUuid_seguidoUuid_key" ON "seguidores"("seguidorUuid", "seguidoUuid");

-- AddForeignKey
ALTER TABLE "seguidores" ADD CONSTRAINT "seguidores_seguidorUuid_fkey" FOREIGN KEY ("seguidorUuid") REFERENCES "usuarios"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguidores" ADD CONSTRAINT "seguidores_seguidoUuid_fkey" FOREIGN KEY ("seguidoUuid") REFERENCES "usuarios"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
