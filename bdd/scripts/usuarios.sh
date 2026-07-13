#!/usr/bin/env bash
# Cenários BDD para o domínio de Usuários (/usuarios), CRUD com controle de papéis.
# Requer a API local rodando e o seed padrão aplicado (npm run seed) - usa o
# usuário admin@fiap.com.br / senha123 criado pelo seed.
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${DIR}/common.sh"

SUFIXO="$(date +%s)"
ADMIN_EMAIL="admin@fiap.com.br"
ADMIN_SENHA="senha123"
SENHA_FORTE="Senha123@"

echo "==================================================================="
echo "DOMÍNIO: USUÁRIOS"
echo "==================================================================="

# --- Login como admin (seed) para obter token ---
ADMIN_LOGIN_BODY=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"senha\":\"${ADMIN_SENHA}\"}")
ADMIN_TOKEN=$(json_field "$ADMIN_LOGIN_BODY" token)

if [ -z "${ADMIN_TOKEN}" ]; then
  echo "ERRO: não foi possível autenticar como admin do seed. Rode 'npm run seed' antes."
  exit 1
fi

# --- Registrar usuário comum (não-admin) para cenários de acesso negado ---
COMUM_EMAIL="usuario.comum.${SUFIXO}@fiap.com.br"
curl -s -X POST "${BASE_URL}/auth/registrar" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${COMUM_EMAIL}\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Usuario Comum\"}" > /dev/null
COMUM_LOGIN_BODY=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${COMUM_EMAIL}\",\"senha\":\"${SENHA_FORTE}\"}")
COMUM_TOKEN=$(json_field "$COMUM_LOGIN_BODY" token)
# usuario é um objeto aninhado; extrai uuid diretamente do body completo
COMUM_UUID=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.usuario.uuid);" "$COMUM_LOGIN_BODY")

### ---------- CAMINHO FELIZ ----------

run_curl "Admin lista usuários paginados (200)" \
  -X GET "${BASE_URL}/usuarios?page=1&pageSize=10" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

NOVO_EMAIL="criado.pelo.admin.${SUFIXO}@fiap.com.br"
CRIACAO_BODY=$(curl -s -X POST "${BASE_URL}/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"email\":\"${NOVO_EMAIL}\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Aluno Criado Por Admin\",\"papel\":\"aluno\"}")
run_curl "Admin cria usuário com papel arbitrário 'aluno' (201)" \
  -X POST "${BASE_URL}/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"email\":\"outro.${SUFIXO}@fiap.com.br\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Outro Aluno\",\"papel\":\"aluno\"}"
NOVO_UUID=$(node -e "console.log(JSON.parse(process.argv[1]).dados.uuid)" "$CRIACAO_BODY")

run_curl "Admin consulta usuário criado por UUID (200)" \
  -X GET "${BASE_URL}/usuarios/${NOVO_UUID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

run_curl "Usuário comum consulta a si próprio (200)" \
  -X GET "${BASE_URL}/usuarios/${COMUM_UUID}" \
  -H "Authorization: Bearer ${COMUM_TOKEN}"

run_curl "Admin atualiza (PATCH) nome do usuário criado (200)" \
  -X PATCH "${BASE_URL}/usuarios/${NOVO_UUID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"nome\":\"Aluno Renomeado\"}"

run_curl "Admin atualiza (PUT) usuário criado (200)" \
  -X PUT "${BASE_URL}/usuarios/${NOVO_UUID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"nome\":\"Aluno Substituido\",\"email\":\"${NOVO_EMAIL}\"}"

run_curl "Admin remove usuário criado (204)" \
  -X DELETE "${BASE_URL}/usuarios/${NOVO_UUID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

### ---------- FALHA (autenticação/autorização/conflito/não encontrado) ----------

run_curl "Listar usuários sem token (401)" \
  -X GET "${BASE_URL}/usuarios"

run_curl "Listar usuários com token inválido (401)" \
  -X GET "${BASE_URL}/usuarios" \
  -H "Authorization: Bearer token-invalido-xyz"

run_curl "Usuário não-admin tenta listar usuários (403)" \
  -X GET "${BASE_URL}/usuarios" \
  -H "Authorization: Bearer ${COMUM_TOKEN}"

run_curl "Usuário não-admin tenta criar usuário (403)" \
  -X POST "${BASE_URL}/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${COMUM_TOKEN}" \
  -d "{\"email\":\"nao.deveria.${SUFIXO}@fiap.com.br\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Nao Deveria\"}"

run_curl "Admin tenta criar usuário com email já em uso (409)" \
  -X POST "${BASE_URL}/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Duplicado\"}"

run_curl "Admin consulta usuário inexistente (404)" \
  -X GET "${BASE_URL}/usuarios/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

run_curl "Usuário comum tenta consultar outro usuário (403)" \
  -X GET "${BASE_URL}/usuarios/00000000-0000-0000-0000-000000000001" \
  -H "Authorization: Bearer ${COMUM_TOKEN}"

ADMIN_UUID=$(node -e "console.log(JSON.parse(process.argv[1]).usuario.uuid)" "$ADMIN_LOGIN_BODY")
run_curl "Admin tenta remover a si mesmo sendo o último admin (409 - bloqueado)" \
  -X DELETE "${BASE_URL}/usuarios/${ADMIN_UUID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"

run_curl "Admin tenta rebaixar a si mesmo (último admin) para docente via PATCH (409 - bloqueado)" \
  -X PATCH "${BASE_URL}/usuarios/${ADMIN_UUID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"papel\":\"docente\"}"

### ---------- VALIDAÇÃO ----------

run_curl "Admin tenta criar usuário com senha fraca (400)" \
  -X POST "${BASE_URL}/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"email\":\"senhafraca.usuarios.${SUFIXO}@fiap.com.br\",\"senha\":\"123\",\"nome\":\"Nome Valido\"}"

run_curl "Admin tenta criar usuário com email inválido (400)" \
  -X POST "${BASE_URL}/usuarios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"email\":\"nao-eh-email\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Nome Valido\"}"

run_curl "Usuário comum tenta atualizar o próprio perfil com corpo vazio (400)" \
  -X PATCH "${BASE_URL}/usuarios/${COMUM_UUID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${COMUM_TOKEN}" \
  -d "{}"

echo "Concluído: cenários de usuários executados."
