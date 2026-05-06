# Guia de Observabilidade - Blog Educacional FIAP

## Visão Geral

Solução simplificada de observabilidade usando **OpenTelemetry + Prometheus + Grafana** para monitoramento de métricas por função/endpoint no backend e **Lighthouse CI** para auditoria de performance do frontend.

## Stack Tecnológica

### Backend (Node.js/Express)
- **OpenTelemetry** - Instrumentação automática para métricas
- **Prometheus** - Coleta e armazenamento de métricas
- **Spans customizados** - Métricas granulares por função

### Frontend (Next.js)
- **Lighthouse CLI** - Auditoria de performance
- **Lighthouse CI (LHCI)** - Histórico e comparações de performance
- **GitHub Actions** - Integração em CI/CD

### Visualização
- **Grafana** - Dashboard único com filtros por endpoint, método e status

## Arquitetura

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│                 │
│  Lighthouse CI  │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   Backend       │
│   (Express)     │
│                 │
│  OpenTelemetry  │
│  (Métricas por  │
│   função)       │
└────────┬────────┘
         │ Métricas
         ▼
┌─────────────────┐
│   Prometheus   │
│   (Coleta)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Grafana       │
│   (Dashboard    │
│   com filtros)  │
└─────────────────┘
```

## Setup Inicial

### 1. Iniciar Stack de Observabilidade

```bash
cd challenge-fase-02
docker-compose -f docker-compose.observability.yml up -d
```

Serviços iniciados:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

### 2. Iniciar Backend

```bash
cd challenge-fase-02
npm run dev
```

O backend automaticamente:
- Inicia instrumentação OpenTelemetry
- Exporta métricas para Prometheus (http://localhost:9464/metrics)
- Coleta métricas por função/endpoint automaticamente

### 3. Iniciar Frontend

```bash
cd frontend
npm run dev
```

## Monitoramento Backend

### Métricas Prometheus

Acesse as métricas em:
- **Endpoint**: http://localhost:9464/metrics
- **Prometheus UI**: http://localhost:9090

Métricas disponíveis:
- `http_server_duration_seconds` - Latência das requisições HTTP
- `http_server_duration_seconds_count` - Contagem de requisições
- `http_server_duration_seconds_sum` - Soma da latência

Labels disponíveis para filtros:
- `http_method` - Método HTTP (GET, POST, PUT, DELETE)
- `http_route` - Endpoint (ex: /posts, /posts/:id)
- `status_code` - Status HTTP (200, 201, 204, 400, 404, 500)

### Spans Customizados por Função

Cada função do controller é instrumentada com spans customizados:

```typescript
// src/posts/postController.ts
async create(req: Request, res: Response): Promise<Response> {
  return createSpan('post.create', async () => {
    // lógica da função
  }) as Promise<Response>;
}
```

Spans disponíveis:
- `post.create` - Criação de post
- `post.list` - Listagem de posts
- `post.getById` - Busca por ID
- `post.search` - Busca por termo
- `post.update` - Atualização
- `post.delete` - Exclusão

### Dashboard Grafana com Filtros

Acesse o Grafana em http://localhost:3001 (admin/admin)

Dashboard: **"Blog Backend - Métricas por Função"**

**Filtros disponíveis:**
- **Método HTTP** - Filtre por GET, POST, PUT, DELETE
- **Endpoint (Route)** - Filtre por rota específica
- **Status Code** - Filtre por status HTTP

**Painéis:**
1. **Latência P95 por Endpoint (ms)** - Mediana do tempo de resposta por rota
2. **Throughput por Endpoint (req/s)** - Requisições por segundo por rota
3. **Latência por Percentual (P50, P95, P99)** - Distribuição de latência
4. **Taxa de Erro por Endpoint (%)** - Porcentagem de erros HTTP 5xx
5. **Requisições por Status Code** - Contagem por status HTTP

## Monitoramento Frontend

### Lighthouse CI Local

Executar auditoria de performance localmente:

```bash
cd frontend
npm run build
npm run lhci:collect
```

Relatórios gerados em `.lighthouseci/`

### Budgets de Performance

Configurados em `lighthouserc.json`:

| Métrica | Mínimo | Status |
|---------|--------|--------|
| Performance | 90% | error |
| Accessibility | 90% | warn |
| Best Practices | 90% | warn |
| SEO | 90% | warn |
| PWA | - | off |

Budgets de bundle (webpack):
- `maxEntrypointSize`: 244KB
- `maxAssetSize`: 244KB

### CI/CD com GitHub Actions

O workflow `.github/workflows/lighthouse-ci.yml` executa automaticamente:
1. Em cada push para master/main
2. Em cada Pull Request para master/main

Para ativar:
1. Instale o [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci)
2. Configure o secret `LHCI_GITHUB_APP_TOKEN` no repositório

## Melhores Práticas

### Backend - Adicionar Métricas em Novas Funções

Use a função `createSpan` para instrumentar novas funções:

```typescript
import { createSpan } from '../observability/tracing';

async minhaFuncao(req: Request, res: Response): Promise<Response> {
  return createSpan('modulo.funcao', async () => {
    // sua lógica aqui
    return res.status(200).json({ data });
  }) as Promise<Response>;
}
```

### Frontend - Auditoria Frequente

Rode Lighthouse localmente antes de commits:

```bash
npm run lhci:collect
```

## Troubleshooting

### Backend não envia métricas

1. Verifique se o Prometheus está rodando:
```bash
docker-compose -f docker-compose.observability.yml ps
```

2. Verifique se o endpoint de métricas está acessível:
```bash
curl http://localhost:9464/metrics
```

3. Verifique logs do backend para erros do OpenTelemetry

### Dashboard não mostra dados

1. Verifique se o datasource Prometheus está configurado no Grafana
2. Aguarde alguns segundos para o Prometheus coletar dados
3. Verifique se os filtros estão selecionando dados corretos

### Lighthouse CI falha no CI

1. Verifique se o secret `LHCI_GITHUB_APP_TOKEN` está configurado
2. Confirme que o Lighthouse CI GitHub App está instalado
3. Verifique logs do workflow no GitHub Actions

## Recursos

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
