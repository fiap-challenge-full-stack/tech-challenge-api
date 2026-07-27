-- Índice de apoio à paginação de comentários (mais recentes primeiro por post)
CREATE INDEX "comentarios_postUuid_createdAt_id_idx" ON "comentarios"("postUuid", "createdAt" DESC, "id" DESC);
