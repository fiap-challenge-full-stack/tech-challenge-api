# 🎓 FIAP Tech Challenge - Fase 02: Blog Educacional Profissional

[![Node.js CI](https://github.com/vsilva/fiap-tech-challenge-fase-02/actions/workflows/ci.yml/badge.svg)](https://github.com/vsilva/fiap-tech-challenge-fase-02/actions/workflows/ci.yml)
![Node Version](https://img.shields.io/badge/node-v20%2B-green)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat&logo=Prisma&logoColor=white)

## 📌 Visão Geral

Este projeto foi desenvolvido como parte do **Tech Challenge - Fase 02** da pós-graduação em Software Architecture da FIAP. A solução foca em criar uma plataforma de blog robusta, escalável e de fácil manutenção para que professores da rede pública possam compartilhar conhecimento de forma prática e centralizada.

### 🎯 O Problema
Professores da rede pública enfrentam dificuldades para centralizar e transmitir conhecimento digitalmente devido à falta de plataformas acessíveis e integradas.

### 💡 A Solução
Uma API REST de alta performance, desenvolvida com **Node.js** e **TypeScript**, utilizando padrões de arquitetura modernos para garantir flexibilidade e confiabilidade, com persistência em **PostgreSQL**.

---

## 🛠️ Stack Tecnológica

*   **Runtime**: [Node.js v20+](https://nodejs.org/)
*   **Linguagem**: [TypeScript 5.x](https://www.typescriptlang.org/)
*   **Framework**: [Express 5](https://expressjs.com/)
*   **Banco de Dados**: [PostgreSQL 15](https://www.postgresql.org/)
*   **ORM**: [Prisma 5](https://www.prisma.io/)
*   **Validação**: [Zod](https://zod.dev/)
*   **Testes**: [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladjs/supertest)
*   **Containerização**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
*   **Segurança**: [Helmet](https://helmetjs.github.io/) & [CORS](https://github.com/expressjs/cors)

---

## 🏗️ Arquitetura e Padrões

O projeto adota princípios de **Clean Architecture** e **DDD**, garantindo o desacoplamento entre a regra de negócio e a infraestrutura.

### Destaques Arquiteturais:
*   **Repository Pattern**: Interface comum (`IPostRepository`) para múltiplas implementações:
    *   `PrismaPostRepository`: Utilizando ORM Prisma para agilidade.
    *   `NativeSqlPostRepository`: Utilizando SQL puro (`pg`) para máxima performance.
    *   `MemoryPostRepository`: Utilizado em testes unitários.
*   **Domain-Driven Design (DDD)**: Entidades ricas e serviços de domínio que encapsulam a lógica de negócio.
*   **Data Mapper**: Separação clara entre as entidades de domínio e os modelos de persistência.
*   **Injeção de Dependência**: Facilita a testabilidade e a troca de implementações de repositório.

### Estrutura de Pastas:
```text
src/
├── posts/            # Domínio de Posts (Controller, Service, Repository, Entity)
├── lib/              # Configurações de infraestrutura (DB, Prisma)
├── app.ts            # Configuração central do Express
└── server.ts         # Ponto de entrada (Bootstrapping)
prisma/               # Schema e Migrations do banco de dados
docs/                 # Documentação BDD e Planejamento Ágil
http/                 # Exemplos de requisições para testes manuais
```

---

## 🚀 Como Rodar o Projeto

### 📋 Pré-requisitos
*   [Docker](https://www.docker.com/) instalado.
*   [Node.js](https://nodejs.org/) (opcional, para execução local).
*   Variáveis de ambiente configuradas (veja `.env.example`).

### ⚡ Instalação Rápida (via Docker)

1.  **Clonar e entrar no diretório**:
    ```bash
    git clone https://github.com/vsilva/fiap-tech-challenge-fase-02.git
    cd fiap-tech-challenge-fase-02
    ```

2.  **Configurar variáveis de ambiente**:
    ```bash
    cp .env.example .env
    # Edite o .env com suas configurações (DATABASE_URL, JWT_SECRET, etc.)
    ```

3.  **Subir containers (Banco e API)**:
    ```bash
    docker compose up -d
    ```
    A API estará disponível em `http://localhost:3001`.

4.  **Executar migrations e seed**:
    ```bash
    docker compose exec api npx prisma migrate dev
    docker compose exec api npm run seed
    ```

### 🛠️ Execução em Modo Desenvolvimento

Se preferir rodar a API fora do Docker:
1.  Suba apenas o banco: `docker compose up -d postgres`
2.  Instale dependências: `npm install`
3.  Execute migrations: `npx prisma migrate dev`
4.  Inicie: `npm run dev`

---

## 🔗 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `POST` | `/auth/registrar` | Registrar novo usuário docente |
| `POST` | `/auth/login` | Login e obter token JWT |

### Posts
| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/health` | Verifica saúde do sistema |
| `GET` | `/posts` | Lista todas as postagens (Recentes primeiro) |
| `GET` | `/posts/:id` | Busca detalhes de um post específico (UUID) |
| `GET` | `/posts/search?q=...` | Busca posts por palavra-chave no título/conteúdo |
| `POST` | `/posts` | Cria uma nova postagem (Requer autenticação) |
| `PUT` | `/posts/:id` | Atualiza uma postagem existente (Requer autenticação) |
| `DELETE` | `/posts/:id` | Remove uma postagem permanentemente (Requer autenticação) |

> 🔐 **Autenticação**: As rotas de escrita (POST, PUT, DELETE) requerem autenticação via JWT. Inclua o header `Authorization: Bearer <token>` nas requisições.

> 📖 **Documentação OpenAPI**: Para especificações completas da API, veja [docs/openapi.yaml](./docs/openapi.yaml).

> 📖 **Documentação BDD**: Para detalhes sobre as regras de negócio de cada endpoint, veja os [Cenários de Sucesso](./docs/bdd/cenarios-sucesso.md) e [Cenários de Falha](./docs/bdd/cenarios-falha.md).

---

## 🧪 Qualidade e Testes

O projeto foca em alta cobertura e confiabilidade, utilizando testes de integração para validar o fluxo completo.

*   **Executar todos os testes**: `npm test`
*   **Verificar cobertura**: `npm run test:cov`
*   **Linting e Estilo**: `npm run lint`

---

## 🚢 CI/CD (GitHub Actions)

O pipeline automatizado garante que:
1.  O código esteja formatado e sem erros de linting.
2.  A build seja gerada com sucesso.
3.  Todos os testes de integração passem em um ambiente isolado (PostgreSQL via Docker).
4.  A imagem Docker seja publicada automaticamente no GitHub Container Registry (GHCR).

---

## 👥 Autores e Colaboradores
*   **Vinicius Franco Silva** - Aluno FIAP

---

## 📜 Licença
Este projeto está sob a licença ISC. Veja o arquivo [package.json](./package.json) para mais detalhes.
