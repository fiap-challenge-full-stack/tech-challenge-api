# Tech Challenge - Fase 02

## Informações Gerais
**Aluno:** Vinicius Franco Silva  
**Projeto:** Tech Challenge - FASE 02

## O Problema
Atualmente, a maioria de professores e professoras da rede pública de educação não têm plataformas onde postar suas aulas e transmitir conhecimento para alunos e alunas de forma prática, centralizada e tecnológica.

Para solucionar esse problema, nossa aplicação escalará para um panorama nacional. Refatoraremos o Back-end utilizando **Node.js** e persistiremos os dados em um banco de dados relacional **PostgreSQL**.

---

## Requisitos Funcionais
Os seguintes endpoints REST serão implementados para a aplicação de blogging:

- **GET `/posts` - Lista de Posts:** Permite aos alunos visualizarem uma lista de todos os posts disponíveis na página principal.
- **GET `/posts/:id` - Leitura de Posts:** Ao acessar este endpoint com um ID específico, os alunos poderão ler o conteúdo completo do post.
- **POST `/posts` - Criação de Postagens:** Permite que docentes criem novas postagens (título, conteúdo e autor).
- **PUT `/posts/:id` - Edição de Postagens:** Usado para editar uma postagem existente via ID e novos dados no corpo da requisição.
- **DELETE `/posts/:id` - Exclusão de Postagens:** Permite que docentes excluam uma postagem específica usando o ID.
- **GET `/posts/search` - Busca de Posts:** Permite a busca de posts por palavras-chave via query string (busca no título ou conteúdo).

---

## Requisitos Técnicos
- **Back-end em Node.js:** Implementação do servidor usando Node.js e frameworks como **Express** para roteamento e middleware.
- **Persistência de Dados:** Utilização de um sistema de banco de dados (ex: MongoDB, PostgreSQL) com modelos de dados adequados.
- **Containerização com Docker:** Uso de contêineres Docker para garantir consistência entre ambientes de desenvolvimento e produção.
- **Automação com GitHub Actions:** Configuração de workflows de CI/CD para automação de testes e deploy.
- **Documentação:** Documentação técnica detalhada incluindo setup inicial, arquitetura e guia de APIs.
- **Cobertura de Testes:** Pelo menos **20% de cobertura** por testes unitários, especialmente em funções críticas.

---

## Entrega
- **Código-Fonte:** Repositório GitHub com o código, Dockerfiles e scripts de CI/CD.
- **Apresentação Gravada:** Demonstração em vídeo do funcionamento e detalhes técnicos.
- **Documentação:** Documento descrevendo a arquitetura, uso da aplicação e relato de experiências/desafios (pode ser no README.md).
