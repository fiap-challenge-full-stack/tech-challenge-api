# Backend - Blog Educacional (FIAP Tech Challenge)

API REST para autenticacao e gestao de posts.

## Tecnologias

- Node.js 20 + TypeScript
- Express 5
- PostgreSQL 15
- Prisma ORM
- Zod (validacao)
- Jest + Supertest (testes)
- Docker + Docker Compose
- OpenTelemetry / Prometheus (observabilidade)

## Integracoes

- Banco de dados PostgreSQL via `DATABASE_URL`
- Frontend consome a API em `http://localhost:3001`
- Pipeline no GitHub Actions para lint, build, migracao e testes
- Publicacao de imagem Docker no GHCR em push para `main/master`

## Como rodar

### 1) Configurar ambiente

```bash
cp .env.example .env
```

### 2) Desenvolvimento com hot reload (Docker)

```bash
docker compose -f docker-compose.dev.yml up --build
```

- API: `http://localhost:3001`
- Banco: `localhost:5454`

### 3) Producao local (Docker)

```bash
docker compose up --build -d
```

## Como verificar

### Health check

```bash
curl http://localhost:3001/health
```

### Prisma

```bash
docker compose exec api npx prisma migrate dev
docker compose exec api npm run seed
```

## Testes e qualidade

```bash
npm run lint
npm run build
npm test
npm run test:cov
```

## CI/CD

Arquivo: `.github/workflows/ci.yml`

Pipeline automatiza:
- instalacao de dependencias (`npm ci`)
- geracao Prisma Client
- lint
- build
- migrations em banco de teste
- testes de integracao
- build e push da imagem Docker no GHCR (branch `main/master`)

## Endpoints principais

- `POST /auth/registrar`
- `POST /auth/login`
- `GET /health`
- `GET /posts`
- `GET /posts/:id`
- `GET /posts/search?q=...`
- `POST /posts` (JWT)
- `PUT /posts/:id` (JWT)
- `DELETE /posts/:id` (JWT)
