# Consulta de Métricas via Terminal

Este documento descreve como consultar, buscar e filtrar métricas do backend através de rotas da API, usando curl ou qualquer cliente HTTP.

## Rotas Disponíveis

Base URL: `http://localhost:3001/metrics`

### 1. Buscar Todas as Métricas

Retorna todas as métricas em formato Prometheus (texto plano).

```bash
curl http://localhost:3001/metrics
```

### 2. Resumo das Métricas

Retorna um resumo estruturado das métricas, agrupado por endpoint, método, status code e funções.

```bash
curl http://localhost:3001/metrics/summary
```

**Resposta JSON:**
```json
{
  "totalMetrics": 150,
  "byEndpoint": {
    "/posts": 45,
    "/posts/:id": 30,
    "/auth/login": 25
  },
  "byMethod": {
    "GET": 60,
    "POST": 50,
    "PUT": 25,
    "DELETE": 15
  },
  "byStatusCode": {
    "200": 80,
    "201": 30,
    "204": 20,
    "400": 10,
    "404": 5,
    "500": 5
  },
  "functions": [
    "post.create",
    "post.list",
    "post.getById",
    "post.search",
    "post.update",
    "post.delete"
  ]
}
```

### 3. Métricas por Endpoint

Filtra métricas de um endpoint específico.

```bash
curl http://localhost:3001/metrics/endpoint/posts
curl http://localhost:3001/metrics/endpoint/posts/:id
```

**Resposta JSON:**
```json
{
  "endpoint": "/posts",
  "metrics": [
    "http_server_duration_seconds_bucket{http_method=\"GET\",http_route=\"/posts\",...}",
    "http_server_duration_seconds_count{http_method=\"GET\",http_route=\"/posts\",...}"
  ],
  "total": 15
}
```

### 4. Métricas por Método HTTP

Filtra métricas de um método HTTP específico (GET, POST, PUT, DELETE).

```bash
curl http://localhost:3001/metrics/method/GET
curl http://localhost:3001/metrics/method/POST
curl http://localhost:3001/metrics/method/PUT
curl http://localhost:3001/metrics/method/DELETE
```

**Resposta JSON:**
```json
{
  "method": "GET",
  "metrics": [
    "http_server_duration_seconds_bucket{http_method=\"GET\",http_route=\"/posts\",...}",
    "http_server_duration_seconds_count{http_method=\"GET\",http_route=\"/posts\",...}"
  ],
  "total": 25
}
```

### 5. Métricas por Status Code

Filtra métricas de um status HTTP específico.

```bash
curl http://localhost:3001/metrics/status/200
curl http://localhost:3001/metrics/status/201
curl http://localhost:3001/metrics/status/404
curl http://localhost:3001/metrics/status/500
```

**Resposta JSON:**
```json
{
  "statusCode": "200",
  "metrics": [
    "http_server_duration_seconds_count{status_code=\"200\",...}"
  ],
  "total": 10
}
```

### 6. Busca com Filtros Combinados

Permite combinar múltiplos filtros em uma única requisição.

**Sintaxe:**
```bash
curl "http://localhost:3001/metrics/search?endpoint=/posts&method=GET&statusCode=200&function=post.list"
```

**Parâmetros Query:**
- `endpoint` - Filtra por rota específica
- `method` - Filtra por método HTTP (GET, POST, PUT, DELETE)
- `statusCode` - Filtra por status HTTP
- `function` - Filtra por nome da função (span)

**Exemplos:**

Filtrar por endpoint e método:
```bash
curl "http://localhost:3001/metrics/search?endpoint=/posts&method=GET"
```

Filtrar por método e status code:
```bash
curl "http://localhost:3001/metrics/search?method=POST&statusCode=201"
```

Filtrar por função específica:
```bash
curl "http://localhost:3001/metrics/search?function=post.create"
```

Filtrar por todos os parâmetros:
```bash
curl "http://localhost:3001/metrics/search?endpoint=/posts&method=GET&statusCode=200&function=post.list"
```

**Resposta JSON:**
```json
{
  "filters": {
    "endpoint": "/posts",
    "method": "GET",
    "statusCode": "200",
    "function": "post.list"
  },
  "metrics": [
    "http_server_duration_seconds_bucket{http_method=\"GET\",http_route=\"/posts\",status_code=\"200\",span.name=\"post.list\",...}"
  ],
  "total": 5
}
```

## Exemplos Práticos

### Monitorar Latência de um Endpoint Específico

```bash
# Buscar métricas de latência do endpoint /posts
curl "http://localhost:3001/metrics/endpoint/posts" | grep "http_server_duration_seconds"
```

### Verificar Erros de um Método HTTP

```bash
# Buscar erros 5xx em requisições POST
curl "http://localhost:3001/metrics/search?method=POST&statusCode=500"
```

### Analisar Performance de uma Função Específica

```bash
# Buscar métricas da função post.create
curl "http://localhost:3001/metrics/search?function=post.create"
```

### Comparar Métricas Antes e Depois de uma Mudança

```bash
# Salvar métricas antes da mudança
curl "http://localhost:3001/metrics/summary" > antes.json

# Após a mudança
curl "http://localhost:3001/metrics/summary" > depois.json

# Comparar (exemplo com jq)
diff <(jq '.byMethod' antes.json) <(jq '.byMethod' depois.json)
```

### Monitorar em Tempo Real

```bash
# Atualizar resumo a cada 5 segundos
watch -n 5 'curl -s http://localhost:3001/metrics/summary | jq .'
```

## Integração com Scripts

### Bash Script para Monitoramento

```bash
#!/bin/bash

# monitorar-metricas.sh

echo "=== Resumo de Métricas ==="
curl -s http://localhost:3001/metrics/summary | jq .

echo -e "\n=== Métricas do Endpoint /posts ==="
curl -s http://localhost:3001/metrics/endpoint/posts | jq .

echo -e "\n=== Erros HTTP 5xx ==="
curl -s "http://localhost:3001/metrics/search?statusCode=500" | jq .
```

### Python Script para Análise

```python
import requests
import json

BASE_URL = "http://localhost:3001/metrics"

# Buscar resumo
response = requests.get(f"{BASE_URL}/summary")
summary = response.json()

print(f"Total de métricas: {summary['totalMetrics']}")
print(f"Endpoints: {summary['byEndpoint']}")
print(f"Métodos: {summary['byMethod']}")
print(f"Status Codes: {summary['byStatusCode']}")
print(f"Funções: {summary['functions']}")
```

## Troubleshooting

### Erro: "Erro ao buscar métricas"

Verifique se o backend está rodando e o endpoint de métricas está disponível:
```bash
# Verificar se o backend está rodando
curl http://localhost:3001/health

# Verificar se o endpoint de métricas do Prometheus está acessível
curl http://localhost:9464/metrics
```

### Métricas Vazias

Se as métricas estiverem vazias, verifique se:
1. O backend está recebendo requisições
2. O OpenTelemetry está inicializado corretamente
3. O Prometheus está coletando métricas

### Filtros Não Funcionam

Verifique se os valores dos filtros estão corretos:
- Métodos HTTP devem estar em maiúsculas (GET, POST, etc.)
- Endpoints devem corresponder exatamente às rotas definidas
- Status codes devem ser números (200, 404, 500, etc.)
