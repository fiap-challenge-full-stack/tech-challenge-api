#!/usr/bin/env bash
# Funções e variáveis compartilhadas pelos scripts BDD.
# Uso: source ./common.sh no início de cada script de domínio.

BASE_URL="${BASE_URL:-http://localhost:8085}"

# Executa um curl e imprime separador + status HTTP + corpo formatado.
# Uso: run_curl "<título do cenário>" <argumentos curl...>
run_curl() {
  local titulo="$1"
  shift
  echo "----------------------------------------------------------------"
  echo "CENÁRIO: ${titulo}"
  echo "----------------------------------------------------------------"
  curl -s -w "\nSTATUS: %{http_code}\n" "$@"
  echo
}

# Extrai um campo de um JSON usando node (evita dependência de jq).
json_field() {
  local json="$1"
  local field="$2"
  node -e "try{const d=JSON.parse(process.argv[1]); const v=d[process.argv[2]]; if(v!==undefined) console.log(v);}catch(e){}" "$json" "$field"
}
