#!/usr/bin/env bash
# Cenários BDD para o domínio de Autenticação (/auth/registrar, /auth/login).
# Requer a API local rodando (ver api/bdd/README.md).
set -uo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${DIR}/common.sh"

SUFIXO="$(date +%s)"
EMAIL_NOVO="docente.bdd.${SUFIXO}@fiap.com.br"
SENHA_FORTE="Senha123@"

echo "==================================================================="
echo "DOMÍNIO: AUTENTICAÇÃO"
echo "==================================================================="

### ---------- CAMINHO FELIZ ----------

run_curl "Registrar novo usuário com dados válidos (201)" \
  -X POST "${BASE_URL}/auth/registrar" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_NOVO}\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Docente BDD\"}"

run_curl "Login com credenciais corretas do usuário recém-criado (200)" \
  -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_NOVO}\",\"senha\":\"${SENHA_FORTE}\"}"

### ---------- FALHA (autenticação/conflito) ----------

run_curl "Login com senha incorreta (401)" \
  -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_NOVO}\",\"senha\":\"SenhaErrada123@\"}"

run_curl "Login com email inexistente (401)" \
  -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"nao.existe.${SUFIXO}@fiap.com.br\",\"senha\":\"${SENHA_FORTE}\"}"

run_curl "Registro com email já em uso (409 - conflito)" \
  -X POST "${BASE_URL}/auth/registrar" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_NOVO}\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Docente Duplicado\"}"

run_curl "Registro tentando se autopromover a admin via papel enviado no corpo (papel deve ser ignorado, 201 com papel docente)" \
  -X POST "${BASE_URL}/auth/registrar" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"escalada.${SUFIXO}@fiap.com.br\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Tentativa Escalada\",\"papel\":\"admin\"}"

### ---------- VALIDAÇÃO ----------

run_curl "Registro com email inválido (400)" \
  -X POST "${BASE_URL}/auth/registrar" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"email-invalido\",\"senha\":\"${SENHA_FORTE}\",\"nome\":\"Nome Valido\"}"

run_curl "Registro com senha fraca - sem maiúscula/número/caractere especial (400)" \
  -X POST "${BASE_URL}/auth/registrar" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"senhafraca.${SUFIXO}@fiap.com.br\",\"senha\":\"senhafraca\",\"nome\":\"Nome Valido\"}"

run_curl "Registro com campo nome faltando (400)" \
  -X POST "${BASE_URL}/auth/registrar" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"semnome.${SUFIXO}@fiap.com.br\",\"senha\":\"${SENHA_FORTE}\"}"

run_curl "Login com payload malformado - senha faltando (400)" \
  -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL_NOVO}\"}"

echo "Concluído: cenários de autenticação executados."
