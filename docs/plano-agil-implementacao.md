# Plano Ágil de Implementação - Tech Challenge Fase 02

Este plano foi revisado e estruturado para garantir a entrega de **100% dos requisitos funcionais, técnicos e de entrega** solicitados no Tech Challenge, dividindo o escopo em 12 Sprints curtas (ciclos de entrega iterativos e cadenciados).

---

## 🛠️ Fase 1: Setup e Infraestrutura Base 
Esta fase corresponde a preparar o terreno, banco de dados e containers.

| Sprint | Status | Descrição | Tarefas Realizadas |
| :--- | :---: | :--- | :--- |
| **Sprint 1: Estrutura Base** | ✅ | Servidor Express + Infra Base | Inicialização, Eslint/Prettier, Route \`/health\` |
| **Sprint 2: Banco de Dados** | ✅ | Persistência com PostgreSQL | Configuração Prisma ORM, Schema \`Post\`, Migrations |
| **Sprint 3: Containerização** | ✅ | Docker & Docker Compose | \`Dockerfile\`, \`docker-compose.yml\`, Healthcheck DB |

---

## ⚙️ Fase 2: Desenvolvimento da API (Core CRUD)
Esta fase implementa as regras de negócio para a criação do blog dinâmico.

| Sprint | Status | Descrição | Tarefas Realizadas |
| :--- | :---: | :--- | :--- |
| **Sprint 4: Criação e Leitura** | ✅ | Endpoints base de posts | \`POST /posts\`, \`GET /posts\`, \`GET /posts/:id\` |
| **Sprint 5: Atualização e Exclusão** | ✅ | Manutenção de conteúdo | \`PUT /posts/:id\`, \`DELETE /posts/:id\`, Tratamento 404 |
| **Sprint 6: Validações** | ✅ | Consistência e Middlewares | Zod Validation, Bloqueio de campos nulos, Respostas \`400 Bad Request\` |

---

## 🔍 Fase 3: Regra de Busca, Testes e Qualidade
Esta fase agrega recursos avançados de busca e levanta métricas de qualidade.

| Sprint | Status | Descrição | Tarefas Realizadas |
| :--- | :---: | :--- | :--- |
| **Sprint 7: Busca Avançada** | ✅ | Endpoint de busca textual | \`GET /posts/search?q=termo\` (Implementado no Repository) |
| **Sprint 8: Infra de Testes** | ✅ | Setup de Jest e Supertest | Configuração de ambiente de testes e mocks |
| **Sprint 9: Cobertura Unitária** | ✅ | Testes Integ. BDD (Rollback) | Testes de integração em arquivos \`.int.spec.ts\` |

---

## 🚢 Fase 4: Automações (DevOps) e Entregáveis Finalizados
Fase em que a aplicação se torna madura e entregável.

| Sprint | Status | Descrição | Tarefas Realizadas |
| :--- | :---: | :--- | :--- |
| **Sprint 10: CI/CD Pipeline** | ⏳ | Automação na nuvem | \`.github/workflows/ci.yml\` (Linter + Testes) |
| **Sprint 11: Documentação** | ⏳ | Redação Técnica | Setup, Arquitetura, Experiências do Desafio |
| **Sprint 12: Consolidação** | ⏳ | Apresentação Final | Revisão final, Gravação de Vídeo, Entrega Zip |

---

## ✅ Checklist de Validação Final

- [x] Node.js + Express instalados e rodando.
- [x] Banco de Dados (SQL/NoSQL) implementado.
- [x] CRUD Completo de Postagens implementado (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`).
- [x] Endpoint de Busca (\`GET /posts/search\`) implementado e funcional.
- [x] Dockerfiles e \`docker-compose\` criados e testados.
- [ ] Pipeline CI/CD rodando no GitHub Actions com sucesso automátizado para testes.
- [x] Mínimo de 20% de Cobertura de testes atestada por relatórios (foco em funções críticas).
- [ ] Documentação abrangente elaborada (Instruções, Arquitetura, APIs, Desafios da equipe).
- [ ] Vídeo da aplicação gravado.
