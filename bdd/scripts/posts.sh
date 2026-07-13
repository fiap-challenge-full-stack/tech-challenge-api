#!/usr/bin/env bash
# Cenários BDD para o domínio de Posts (/posts).
# Requer a API local rodando. Usa um usuário docente registrado on-the-fly
# (papel docente/admin é obrigatório para escrever posts).
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${DIR}/common.sh"

SUFIXO="$(date +%s)"
SENHA_FORTE="Senha123@"
DOCENTE_EMAIL="docente.posts.${SUFIXO}@fiap.com.br"
ALUNO_EMAIL="aluno.posts.${SUFIXO}@fiap.com.br"

echo "==================================================================="
echo "DOMÍNIO: POSTS"
echo "==================================================================="

# --- Registro/login de um docente (pode escrever posts) ---
curl -s -X POST "${BASE_URL}/auth/registrar" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${DOCENTE_EMAIL}\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Docente Posts BDD\"}" > /dev/null
DOCENTE_LOGIN_BODY=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${DOCENTE_EMAIL}\",\"senha\":\"${SENHA_FORTE}\"}")
DOCENTE_TOKEN=$(json_field "$DOCENTE_LOGIN_BODY" token)

# --- Login como admin do seed para criar um usuário 'aluno' (sem permissão de escrita) ---
ADMIN_LOGIN_BODY=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@fiap.com.br\",\"senha\":\"senha123\"}")
ADMIN_TOKEN=$(json_field "$ADMIN_LOGIN_BODY" token)
curl -s -X POST "${BASE_URL}/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"email\":\"${ALUNO_EMAIL}\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Aluno Posts BDD\",\"papel\":\"aluno\"}" > /dev/null
ALUNO_LOGIN_BODY=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ALUNO_EMAIL}\",\"senha\":\"${SENHA_FORTE}\"}")
ALUNO_TOKEN=$(json_field "$ALUNO_LOGIN_BODY" token)

### ---------- CAMINHO FELIZ ----------

CRIACAO_BODY=$(curl -s -X POST "${BASE_URL}/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}" \
  -d "{\"titulo\":\"Post de Teste BDD ${SUFIXO}\",\"conteudo\":\"Conteúdo de teste do cenário BDD com mais de dez caracteres.\"}")
run_curl "Docente autenticado cria post (201)" \
  -X POST "${BASE_URL}/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}" \
  -d "{\"titulo\":\"Post de Teste BDD ${SUFIXO} v2\",\"conteudo\":\"Conteúdo de teste do cenário BDD com mais de dez caracteres.\"}"
POST_UUID=$(node -e "console.log(JSON.parse(process.argv[1]).dados.uuid)" "$CRIACAO_BODY")

run_curl "Listar todos os posts (200, público)" \
  -X GET "${BASE_URL}/posts"

run_curl "Buscar post por ID existente (200, público)" \
  -X GET "${BASE_URL}/posts/${POST_UUID}"

run_curl "Buscar posts por palavra-chave (200, público)" \
  -X GET "${BASE_URL}/posts/search?q=BDD"

run_curl "Docente atualiza (PATCH) o próprio post (200)" \
  -X PATCH "${BASE_URL}/posts/${POST_UUID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}" \
  -d "{\"titulo\":\"Post de Teste BDD Atualizado ${SUFIXO}\"}"

run_curl "Docente exclui o post criado (204)" \
  -X DELETE "${BASE_URL}/posts/${POST_UUID}" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}"

### ---------- FALHA (autenticação/autorização/não encontrado) ----------

run_curl "Criar post sem token (401)" \
  -X POST "${BASE_URL}/posts" \
  -H "Content-Type: application/json" \
  -d "{\"titulo\":\"Post Sem Auth\",\"conteudo\":\"Conteúdo qualquer com mais de dez caracteres.\"}"

run_curl "Criar post com token inválido (401)" \
  -X POST "${BASE_URL}/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token-invalido-xyz" \
  -d "{\"titulo\":\"Post Token Invalido\",\"conteudo\":\"Conteúdo qualquer com mais de dez caracteres.\"}"

run_curl "Usuário com papel 'aluno' tenta criar post (403 - sem permissão)" \
  -X POST "${BASE_URL}/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ALUNO_TOKEN}" \
  -d "{\"titulo\":\"Post Por Aluno\",\"conteudo\":\"Conteúdo qualquer com mais de dez caracteres.\"}"

run_curl "Buscar post por ID inexistente (404)" \
  -X GET "${BASE_URL}/posts/00000000-0000-0000-0000-000000000000"

run_curl "Atualizar post inexistente (404)" \
  -X PATCH "${BASE_URL}/posts/00000000-0000-0000-0000-000000000000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}" \
  -d "{\"titulo\":\"Titulo Atualizado\"}"

run_curl "Excluir post inexistente (404)" \
  -X DELETE "${BASE_URL}/posts/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}"

run_curl "Excluir post já excluído anteriormente (404 - idempotência)" \
  -X DELETE "${BASE_URL}/posts/${POST_UUID}" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}"

### ---------- VALIDAÇÃO ----------

run_curl "Criar post com título muito curto (400)" \
  -X POST "${BASE_URL}/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}" \
  -d "{\"titulo\":\"Oi\",\"conteudo\":\"Conteúdo qualquer com mais de dez caracteres.\"}"

run_curl "Criar post com conteúdo faltando (400)" \
  -X POST "${BASE_URL}/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}" \
  -d "{\"titulo\":\"Título Válido Aqui\"}"

run_curl "Atualizar post com corpo vazio (400 - nenhum campo fornecido)" \
  -X PATCH "${BASE_URL}/posts/00000000-0000-0000-0000-000000000000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${DOCENTE_TOKEN}" \
  -d "{}"

echo "Concluído: cenários de posts executados."
