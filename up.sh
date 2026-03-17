#!/bin/bash

echo "🛑 Parando qualquer container remanescente..."
docker compose down

echo "🚀 Iniciando os containers com Docker Compose..."
docker compose up -d

echo "⏳ Aguardando o banco de dados ficar pronto..."
until [ "$(docker inspect -f '{{.State.Health.Status}}' challenge-db)" == "healthy" ]; do
    printf "."
    sleep 2
done

echo -e "\n✅ Banco de dados está pronto!"

echo "🔄 Aplicando migrações do Prisma DENTRO do container da API..."
# Executa a migração dentro do container
docker exec challenge-api npx prisma migrate deploy

echo "🔍 Verificando logs da API..."
echo "💡 Dica: Pressione Ctrl+C para sair dos logs, a API continuará rodando."
echo "🌍 A API estará disponível em: http://localhost:3001"
docker logs -f challenge-api
