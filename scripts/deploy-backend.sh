#!/bin/bash
# Sobe o backend (db + api) via docker compose na raiz do projeto e valida a saúde da API.
# Uso: ./scripts/deploy-backend.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
DB_CONTAINER="blog-db"
API_CONTAINER="blog-api"
API_HEALTH_URL="http://localhost:8085/health"
TIMEOUT=60

erro() {
    echo "❌ $1" >&2
    exit 1
}

echo "🔎 Validando pré-requisitos..."

command -v docker >/dev/null 2>&1 || erro "docker não encontrado no PATH."
docker compose version >/dev/null 2>&1 || erro "'docker compose' (plugin v2) não disponível."
docker info >/dev/null 2>&1 || erro "Docker daemon não está rodando/acessível."
[ -f "$COMPOSE_FILE" ] || erro "docker-compose.yml não encontrado em $ROOT_DIR."
command -v curl >/dev/null 2>&1 || erro "curl não encontrado no PATH."

echo "🚀 Subindo db + api (docker compose)..."
if ! (cd "$ROOT_DIR" && docker compose up -d --build db api); then
    erro "Falha ao subir os containers 'db'/'api'. Veja o log acima."
fi

echo "⏳ Aguardando o banco ficar saudável..."
elapsed=0
while true; do
    health_status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$DB_CONTAINER" 2>/dev/null)"
    [ "$health_status" = "healthy" ] && break
    if [ "$health_status" = "none" ]; then
        erro "Container '$DB_CONTAINER' não tem healthcheck configurado no docker-compose.yml."
    fi
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
        docker logs --tail 30 "$DB_CONTAINER" 2>&1 || true
        erro "Timeout aguardando o banco '$DB_CONTAINER' ficar saudável (status: $health_status)."
    fi
    printf "."
    sleep 2
    elapsed=$((elapsed + 2))
done
echo -e "\n✅ Banco de dados saudável."

echo "⏳ Aguardando a API responder em $API_HEALTH_URL..."
elapsed=0
until curl -sf -o /dev/null "$API_HEALTH_URL"; do
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
        docker logs --tail 30 "$API_CONTAINER" 2>&1 || true
        erro "Timeout aguardando a API responder em $API_HEALTH_URL."
    fi
    printf "."
    sleep 2
    elapsed=$((elapsed + 2))
done

echo -e "\n✅ Backend no ar: $API_HEALTH_URL"
