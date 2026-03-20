# Documentação Técnica: Tech Challenge - Fase 02

Este documento apresenta a fundamentação técnica, a arquitetura de software e o relato de desenvolvimento da API de Blog Educacional, requisito integrante da Fase 02 do Tech Challenge (FIAP).

---

## 1. Visão Geral do Projeto

O objetivo deste sistema é fornecer uma infraestrutura de backend robusta para o gerenciamento de postagens educacionais. A solução visa atender professores da rede pública, permitindo a centralização e distribuição de conhecimento de forma escalável e segura.

---

## 2. Arquitetura do Sistema

A aplicação foi desenhada seguindo princípios de Clean Architecture e Domain-Driven Design (DDD) simplificado, priorizando o desacoplamento entre regras de negócio e detalhes de infraestrutura.

### 2.1. Divisão de Camadas

1.  **Camada de Domínio (Domain)**:
    *   Localizada em `src/posts/post.ts`.
    *   Contém a lógica central e entidades de negócio.
    *   A entidade `Post` é auto-validável e independente de frameworks ou bibliotecas externas.

2.  **Camada de Aplicação (Application)**:
    *   Localizada em `src/posts/postService.ts`.
    *   Implementa os casos de uso do sistema.
    *   Utiliza Inversão de Dependência ao comunicar-se com abstrações (`IPostRepository`) em vez de implementações concretas.

3.  **Camada de Infraestrutura (Infrastructure)**:
    *   Contém as implementações de persistência e configurações de servidor.
    *   **Abstração de Repositório**: Foram desenvolvidas múltiplas implementações para demonstrar a flexibilidade do padrão:
        *   `PrismaPostRepository`: Implementação utilizando ORM para produtividade e segurança de tipos.
        *   `NativeSqlPostRepository`: Implementação utilizando SQL nativo (PostgreSQL) para otimização de performance.

4.  **Camada de Interface (Interface Adapters)**:
    *   Controllers e Rotas (Express) que gerenciam a entrada de dados via HTTP, validam o input via Zod e formatam a saída.

### 2.2. Modelo de Dados

O banco de dados relacional PostgreSQL armazena as seguintes propriedades da entidade Post:
*   **Identificação**: ID serial (interno) e UUID v4 (exposição externa).
*   **Conteúdo**: Título, conteúdo textual e autor.
*   **Auditoria**: Timestamps de criação e última atualização.

---

## 3. Instruções de Uso

### 3.1. Pré-requisitos
*   Docker e Docker Compose.
*   Node.js v20 ou superior (para execução fora do container).

### 3.2. Configuração e Execução via Docker
O ambiente completo, incluindo banco de dados e aplicação, pode ser instanciado com os seguintes comandos:

```bash
# Configuração do ambiente
cp .env.example .env

# Inicialização dos serviços
docker compose up -d
```

### 3.3. Execução em Ambiente de Desenvolvimento
Para desenvolvedores que necessitam depurar o código localmente:

1.  Instalar dependências: `npm install`
2.  Executar Migrations: `npx prisma migrate dev`
3.  Iniciar em modo watch: `npm run dev`

---

## 4. Endpoints da API

| Método | Caminho | Função |
| :--- | :--- | :--- |
| GET | /health | Verificação de disponibilidade do sistema. |
| GET | /posts | Listagem de postagens ordenadas por data. |
| GET | /posts/:id | Recuperação de postagem por UUID. |
| GET | /posts/search | Busca textual no título ou conteúdo (parâmetro ?q=). |
| POST | /posts | Criação de nova postagem. |
| PUT | /posts/:id | Atualização integral de uma postagem existente. |
| DELETE | /posts/:id | Remoção permanente de uma postagem. |

---

## 5. Relato de Desenvolvimento e Desafios

### 5.1. Decisões Técnicas
A escolha do TypeScript em conjunto com o PostgreSQL permitiu a criação de um contrato de dados sólido entre o banco e a aplicação. A implementação do Repository Pattern foi fundamental para garantir que a troca entre um ORM e SQL nativo pudesse ser feita com alteração mínima no código de serviço.

### 5.2. Desafios Enfrentados

1.  **Persistência Poliglota e Mapeamento**:
    *   O desafio residiu em manter a integridade dos tipos ao utilizar diferentes formas de acesso ao banco. A solução foi a implementação de um `PostMapper` que padroniza os objetos retornados da infraestrutura para o domínio.

2.  **Automação de Testes de Integração em CI**:
    *   A configuração de um pipeline que exigia um banco de dados real para testes de integração foi complexa. Foi necessário configurar containers de serviço no GitHub Actions para garantir que as migrations fossem aplicadas corretamente antes da execução da suíte de testes.

3.  **Validação de Dados Complexos**:
    *   Garantir a consistência dos dados de entrada sem poluir os controllers. A utilização da biblioteca Zod permitiu a criação de schemas de validação reutilizáveis e tipos derivados automaticamente.

### 5.3. Conclusão
O desenvolvimento da Fase 02 consolidou a importância de uma arquitetura bem definida. O sistema não apenas cumpre os requisitos funcionais, mas também oferece uma base escalável para futuras expansões, como autenticação e categorização de postagens.

---
**Autor:** Vinicius Franco Silva  
**Instituição:** FIAP  
**Data:** 20 de Março de 2026
