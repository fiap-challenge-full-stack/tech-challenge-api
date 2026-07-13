# 🚀 Blog Educacional - Backend API

[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

API REST robusta e escalável para autenticação e gestão de posts, construída com **Node.js 20**, **TypeScript**, **Express 5** e **PostgreSQL 15**. Implementa arquitetura em camadas, segurança avançada e observabilidade com OpenTelemetry.

## ✨ Destaques Técnicos

- **🏗️ Arquitetura em Camadas**: Controller → Service → Repository com SOLID e DDD
- **🔐 Segurança Avançada**: JWT com cookies HTTP-Only, CORS, Rate Limiting, CSP, Helmet
- **📊 Observabilidade**: OpenTelemetry + Prometheus para tracing e métricas
- **🧪 Testes Completos**: Jest + Supertest com cobertura automatizada
- **🐳 Docker-Ready**: Multi-stage build otimizado para produção
- **🔄 CI/CD**: GitHub Actions com deploy automatizado para GHCR

## 🛠️ Stack Tecnológico

### Core
- **Node.js 20** - Runtime JavaScript/TypeScript
- **TypeScript 5** - Type-safety em todo o projeto
- **Express 5** - Framework web minimalista
- **PostgreSQL 15** - Banco de dados relacional

### ORM & Database
- **Prisma ORM** - Type-safe database client
- **Migrations** - Versionamento de schema
- **Seeds** - Dados iniciais automatizados

### Segurança
- **JWT** - Autenticação stateless com tokens
- **bcryptjs** - Hash de senhas seguro
- **Helmet** - Headers de segurança HTTP
- **CORS** - Controle de origens específicas
- **Rate Limiting** - Proteção contra DDoS
- **CSP** - Content Security Policy

### Validação
- **Zod** - Schema validation type-safe

### Testes & Qualidade
- **Jest** - Testes de integração
- **Supertest** - HTTP assertions
- **ESLint** - Linting de código
- **Prettier** - Formatação consistente

### Observabilidade
- **OpenTelemetry** - Tracing distribuído
- **Prometheus** - Exportação de métricas
- **Morgan** - Logging de requisições

### DevOps
- **Docker** - Containerização multi-stage
- **Docker Compose** - Orquestração local
- **GitHub Actions** - CI/CD automatizado
- **GHCR** - GitHub Container Registry

## 🏗️ Arquitetura

### Camadas
- **Controller** - Manipulação de requisições HTTP e validação
- **Service** - Lógica de negócio e regras de domínio
- **Repository** - Acesso a dados via Prisma ORM
- **Middleware** - Interceptação de requisições (rate limiting, CSP)

### Padrões
- **SOLID** - Princípios de design orientado a objetos
- **DDD** - Domain-Driven Design com domínios separados
- **Clean Architecture** - Dependências apontam para dentro

### Segurança
- **JWT** - Tokens com expiração configurável
- **bcryptjs** - Hash de senhas com salt
- **Helmet** - Headers de segurança HTTP
- **CORS** - Origens específicas (sem wildcard)
- **Rate Limiting** - Limites por IP e endpoint
- **CSP** - Content Security Policy headers

## 🚀 Como Rodar

### Desenvolvimento Local (Docker)

```bash
# 1. Configurar ambiente
cp .env.example .env

# 2. Subir com hot reload
docker compose -f docker-compose.dev.yml up --build
```

Acesse: **http://localhost:8085**

**Variáveis de Ambiente:**
- `DATABASE_URL` - String de conexão PostgreSQL
- `JWT_SECRET` - Segredo para assinar JWT
- `PORT` - Porta do servidor (default: 8085)
- `NODE_ENV` - Ambiente (development/production)

### Produção Local (Docker)

```bash
docker compose up --build -d
```

### Health Check

```bash
curl http://localhost:8085/health
```

### Database Migrations

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# Seed database
npm run seed
```

## 🧪 Testes & Qualidade

```bash
# Linting
npm run lint

# Build TypeScript
npm run build

# Testes de integração
npm test

# Testes com cobertura
npm run test:cov
```

## 🔄 CI/CD

**GitHub Actions** - `.github/workflows/ci.yml`

Pipeline automatizado:
- ✅ Install dependencies (`npm ci`)
- ✅ Generate Prisma Client
- ✅ Lint (`npm run lint`)
- ✅ Build (`npm run build`)
- ✅ Database migrations (test environment)
- ✅ Integration tests (`npm test`)
- 🚀 Build & push Docker image to GHCR (branch `main/master`)

## 📊 Endpoints Principais

### Autenticação
- `POST /auth/registrar` - Registro de usuário
- `POST /auth/login` - Login com JWT

### Health
- `GET /health` - Health check da API

### Posts
- `GET /posts` - Listar todos os posts
- `GET /posts/:id` - Buscar post por ID
- `GET /posts/search?q=...` - Buscar posts por palavra-chave
- `POST /posts` - Criar novo post (JWT required)
- `PUT /posts/:id` - Atualizar post (JWT required)
- `DELETE /posts/:id` - Deletar post (JWT required)

## 🔗 Links

- **Repositório:** https://github.com/fase-02-blog/tech-challenge-api.git
- **Frontend:** https://github.com/fiap-challenge-full-stack/blog-web
- **Documentação:** [Arquitetura do Sistema](../docs/ARQUITETURA-SISTEMA.md)

## 👤 Autor

**Vinicius Franco Silva**
- FIAP - Tech Challenge Full Stack
- Fase 3

---

**Desenvolvido com ❤️ usando Node.js 20, TypeScript e Express 5**
