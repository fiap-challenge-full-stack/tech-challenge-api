# Estrutura de Testes

Este diretório contém todos os testes da API, organizados por tipo e domínio.

## Estrutura de Diretórios

```
tests/
├── unit/                          # Testes Unitários
│   ├── auth/                      # Testes unitários de autenticação
│   └── posts/                     # Testes unitários de posts
│       ├── postController.spec.ts # Testes do controller
│       ├── postService.spec.ts    # Testes do service
│       ├── postSchemas.spec.ts    # Testes de validação
│       └── post.spec.ts           # Testes do domínio
├── integration/                   # Testes de Integração
│   ├── auth/                      # Testes de integração de autenticação
│   │   ├── authIntegration.spec.ts    # Testes de registro/login
│   │   └── authAuthorization.spec.ts  # Testes de autorização por papel
│   └── posts/                     # Testes de integração de posts
│       ├── postIntegration.spec.ts        # Testes básicos de integração
│       ├── postAuthPatchDelete.int.spec.ts # Testes de autenticação em posts
│       ├── postUpdateComplete.int.spec.ts  # Testes completos de atualização/exclusão
│       ├── postIntegrationSuccess.spec.ts  # Cenários de sucesso
│       ├── postIntegrationFailure.spec.ts  # Cenários de falha
│       ├── postResilience.int.spec.ts      # Testes de resiliência
│       └── postRepositoryComparison.int.spec.ts # Comparação de repositórios
├── e2e/                           # Testes End-to-End
│   ├── auth.spec.ts               # Testes E2E de autenticação
│   └── posts.spec.ts              # Testes E2E de posts
└── fixtures/                      # Fixtures e dados de teste
    └── auth.ts                   # Fixtures de autenticação
```

## Tipos de Testes

### Testes Unitários
- **Objetivo**: Testar unidades isoladas de código (funções, classes, métodos)
- **Características**:
  - Não dependem de infraestrutura externa (banco, APIs)
  - Usam mocks e stubs
  - Execução rápida
  - Testam lógica de negócio isolada

### Testes de Integração
- **Objetivo**: Testar a integração entre componentes
- **Características**:
  - Usam banco de dados real (ambiente de teste)
  - Testam fluxos completos através de múltiplas camadas
  - Testam integração com dependências externas
  - Mais lentos que unitários, mas mais realistas

### Testes E2E (End-to-End)
- **Objetivo**: Testar o sistema como um todo, perspective do usuário
- **Características**:
  - Testam fluxos completos de usuário
  - Usam a aplicação em execução
  - Simulam interações reais
  - Mais lentos, mas detectam problemas de integração globais

## Como Executar

### Executar todos os testes
```bash
npm test
```

### Executar apenas testes unitários
```bash
npm test -- tests/unit
```

### Executar apenas testes de integração
```bash
npm test -- tests/integration
```

### Executar testes de um domínio específico
```bash
npm test -- tests/integration/auth
npm test -- tests/unit/posts
```

### Executar um arquivo de teste específico
```bash
npm test -- tests/integration/auth/authIntegration.spec.ts
```

### Executar com coverage
```bash
npm run test:cov
```

## Convenções de Nomenclatura

- **Arquivos unitários**: `{dominio}{entidade}.spec.ts`
- **Arquivos de integração**: `{dominio}{funcionalidade}.int.spec.ts`
- **Arquivos E2E**: `{dominio}.spec.ts`

## Setup de Testes

Os testes usam o arquivo `.env.test` para configuração do ambiente de teste, incluindo:
- Banco de dados de teste separado
- JWT secret específico para testes
- Configurações de timeout

## Limpeza de Dados

Os testes de integração devem sempre limpar os dados criados durante os testes:
- Usar `afterEach` ou `afterAll` para limpar dados
- Usar transações quando possível
- Usar dados com timestamps únicos para evitar conflitos

## Uso de SQL Direto vs API Routes

### Padrão Recomendado
Testes de integração devem preferencialmente usar **rotas da API** para setup e cleanup, pois:
- Testam o sistema de forma mais realista
- Validam que as rotas funcionam corretamente
- Mantêm os testes independentes da implementação do banco

### Exceções Justificadas
Alguns testes mantêm SQL direto por razões específicas:

#### 1. `postRepositoryComparison.int.spec.ts`
**Justificativa**: Este teste tem o propósito explícito de comparar o comportamento do `NativeSqlPostRepository` com queries SQL diretas. O SQL direto é usado como **baseline** para validar que o repositório retorna resultados idênticos ao SQL nativo.

- Linhas com SQL: 16, 26, 40, 60, 77
- Propósito: Validação de camada de repositório

#### 2. `postResilience.int.spec.ts`
**Justificativa**: Este teste simula falhas de infraestrutura (banco indisponível) e precisa manipular diretamente o objeto `db.query` para mockar erros de conexão.

- Linhas com SQL: 21, 22, 23, 32
- Propósito: Teste de resiliência e tratamento de erros de infraestrutura

#### 3. `postAuthPatchDelete.int.spec.ts` (apenas cleanup de usuários)
**Justificativa**: O cleanup de usuários usa SQL direto pois **não existe endpoint de DELETE de usuários** na API. O cleanup de posts usa API routes normalmente.

- Linha com SQL: 47
- Propósito: Cleanup de dados de teste (usuários) sem endpoint correspondente na API

### Resumo da Refatoração
A refatoração recente substituiu SQL direto por API routes nos seguintes arquivos:
- ✅ `postIntegration.spec.ts` - Setup e cleanup via API
- ✅ `postUpdateComplete.int.spec.ts` - Setup e cleanup via API
- ✅ `postIntegrationSuccess.spec.ts` - Setup e cleanup via API
- ✅ `post.int.spec.ts` - Setup e cleanup via API
- ✅ `authAuthorization.spec.ts` - Cleanup via API

## Boas Práticas

1. **Testes unitários**: Mantenha isolados e rápidos
2. **Testes de integração**: Teste fluxos realistas, mas evite dependências externas quando possível
3. **Nomenclatura descritiva**: Use nomes que descrevam o que está sendo testado
4. **AAA Pattern**: Arrange, Act, Assert para estruturação dos testes
5. **Testes independentes**: Cada teste deve poder rodar isoladamente
6. **Limpeza garantida**: Sempre limpe recursos criados durante o teste
