# Plano Ágil de Implementação - Tech Challenge Fase 02

Este plano foi revisado e estruturado para garantir a entrega de **100% dos requisitos funcionais, técnicos e de entrega** solicitados no Tech Challenge, dividindo o escopo em 12 Sprints curtas (ciclos de entrega iterativos e cadenciados).

---

## 🛠️ Fase 1: Setup e Infraestrutura Base 
Esta fase corresponde a preparar o terreno, banco de dados e containers.

### 🚀 Sprint 1: Estrutura Base do Projeto Node.js
**Objetivo:** Ter um servidor que sobe e responde requisições simples.
*   **Tarefa 1.1:** Inicializar projeto (`npm init`), instalar `express` e dependências básicas de roteamento.
*   **Tarefa 1.2:** Configurar linter/formatação (Eslint e Prettier) para padrão de código da equipe.
*   **Tarefa 1.3:** Criar rota de status (`GET /health`) para atestar se o servidor inicializou corretamente.

### 🚀 Sprint 2: Infraestrutura de Banco de Dados
**Objetivo:** Conexão com o banco configurada e estruturação da persistência.
*   **Tarefa 2.1:** Configuração do banco de dados **PostgreSQL** e ORM (ex: Prisma ou TypeORM).
*   **Tarefa 2.2:** Configurar variáveis de ambiente (`.env`) com a string de conexão do Postgres.
*   **Tarefa 2.3:** Estabelecer a conexão no server e criar modelagem (Schema) `Post` via migrações SQL.

### 🚀 Sprint 3: Containerização Local (Docker)
**Objetivo:** Garantir a consistência de ambiente para todos os devs da equipe.
*   **Tarefa 3.1:** Escrever o `Dockerfile` com a imagem adequada do Node.js.
*   **Tarefa 3.2:** Desenvolver o `docker-compose.yml` integrando o serviço do Backend Node e a imagem do Banco de Dados.
*   **Tarefa 3.3:** Testar o contêiner rodando o ambiente *do zero* de forma local garantindo funcionamento independente.

---

## ⚙️ Fase 2: Desenvolvimento da API (Core CRUD)
Esta fase implementa as regras de negócio para a criação do blog dinâmico.

### 🚀 Sprint 4: Criação e Leitura Base
**Objetivo:** Capacidade de gravar novos posts e listá-los.
*   **Tarefa 4.1:** Implementar endpoint `POST /posts` para docentes salvarem posts.
*   **Tarefa 4.2:** Implementar endpoint `GET /posts` para listar as postagens que foram criadas.
*   **Tarefa 4.3:** Implementar endpoint `GET /posts/:id` recuperando o detalhe em texto do post com base no ID.

### 🚀 Sprint 5: Atualização e Exclusão
**Objetivo:** Permitir manutenção do conteúdo no blog.
*   **Tarefa 5.1:** Implementar endpoint `PUT /posts/:id` que receberá o JSON para substituir/editar os dados do post correspondente.
*   **Tarefa 5.2:** Implementar endpoint `DELETE /posts/:id` excluindo permanentemente ou logicamente um post por ID.
*   **Tarefa 5.3:** Validar retorno de falhas com "Not Found" (`404`) quando o ID nos endpoints não existir no banco.

### 🚀 Sprint 6: Validações e Consistência Funcional
**Objetivo:** Garantir que o sistema só aceite conteúdos válidos na criação e edição.
*   **Tarefa 6.1:** Desenvolver middlewares (ou bibliotecas como Zod/Joi) bloqueando envios onde os campos `título`, `conteúdo` ou `autor` vêm nulos.
*   **Tarefa 6.2:** Tratar globalmente mensagens de erro padrão, para que a API responda HTTP `400 Bad Request` em falha de validação com informações claras do porquê o payload foi recusado.

---

## 🔍 Fase 3: Regra de Busca, Testes e Qualidade
Esta fase agrega recursos avançados de busca e levanta métricas de qualidade (Testes Unitários).

### 🚀 Sprint 7: Endpoint de Busca de Posts
**Objetivo:** Feature solicitada de busca textual de postagens.
*   **Tarefa 7.1:** Implementar endpoint `GET /posts/search?q=termo`.
*   **Tarefa 7.2:** Adaptar consulta no banco, permitindo filtrar utilizando lógica com "OR" sobre título OU conteúdo da postagem. 

### 🚀 Sprint 8: Infraestrutura de Testes Unitários
**Objetivo:** Configurar libs de mocks e testes de integração de rotas.
*   **Tarefa 8.1:** Instalação das bibliotecas nativas de testes (`Jest` e integrações como `Supertest`).
*   **Tarefa 8.2:** Escrever o primeiro teste para atestar rotas de *health_check* ou a integridade do app, validando setup inicial de mock/banco in-memory.
*   **Tarefa 8.3:** Gerar script central para coletar e exibir a cobertura do projeto no console.

### 🚀 Sprint 9: Cobertura Unitária Focada em Regras Críticas
**Objetivo:** Atingir a cobertura exigida de 20%+, focando no coração do projeto.
*   **Tarefa 9.1:** Desenvolver testes unitários passando por cenários de sucesso e falha da *criação* de um post.
*   **Tarefa 9.2:** Desenvolver testes unitários na *edição* e *exclusão* de posts. 
*   **Tarefa 9.3:** Rodar relatórios, validar que o code coverage atingiu **20%** e travar a obrigatoriedade da esteira com esse mínimo percentual nos scripts do package.json.

---

## 🚢 Fase 4: Automações (DevOps) e Entregáveis Finalizados
Fase em que a aplicação se torna madura e entregável para aprovação final.

### 🚀 Sprint 10: Pipeline de CI/CD (GitHub Actions)
**Objetivo:** Processo assíncrono checando estabilidade do código na nuvem a cada commit.
*   **Tarefa 10.1:** Criar um workflow base padrão no diretório `.github/workflows/ci.yml`.
*   **Tarefa 10.2:** Desenhar o script integrando linter automatizado (`npm run lint`), bloqueando subidas defeituosas.
*   **Tarefa 10.3:** Integrar os passos rodando dependências e disparando test coverage de modo contínuo em *Pushs* a master/main.

### 🚀 Sprint 11: Documentação e Arquitetura do Software
**Objetivo:** Redação técnica cobrindo todos os passos exigidos pela disciplina.
*   **Tarefa 11.1:** Documentar "Setup Inicial e Deploy Local" no repositório, informando em detalhes como puxar a imagem do Docker.
*   **Tarefa 11.2:** Especificar e documentar a tabela/entidade e Arquitetura técnica no `README`.
*   **Tarefa 11.3:** Escrever seção no sumário sobre "*Anotação das experiências da fase e desafios enfrentados*".

### 🚀 Sprint 12: Revisão, Consolidação e Apresentação
**Objetivo:** Fechar pacote do Challenge em grupo gravando a materialização final.
*   **Tarefa 12.1:** Revisar todos os *Endpoints / Postman / Insomnia* em conjunto como Check de qualidade das respostas.
*   **Tarefa 12.2:** Fazer a gravação do vídeo passando pelas seções cruciais do desafio e mostrando funcionamento dos scripts do Docker e testes rodando;
*   **Tarefa 12.3:** Subir material para YouTube/Drive, gerar zip / entregar repositório público com todas exigências na plataforma Fiap.

---

## ✅ Checklist de Validação Final

- [ ] Node.js + Express instalados e rodando.
- [ ] Banco de Dados (SQL/NoSQL) implementado.
- [ ] CRUD Completo de Postagens implementado (`GET`, `POST`, `PUT`, `DELETE`).
- [ ] Endpoint de Busca (`GET /posts/search`) implementado e funcional.
- [ ] Dockerfiles e `docker-compose` criados e testados.
- [ ] Pipeline CI/CD rodando no GitHub Actions com sucesso automátizado para testes.
- [ ] Mínimo de 20% de Cobertura de testes atestada por relatórios (foco em funções críticas).
- [ ] Documentação abrangente elaborada (Instruções, Arquitetura, APIs, Desafios da equipe).
- [ ] Vídeo da aplicação gravado.
