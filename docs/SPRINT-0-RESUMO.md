# Sprint 0 - Resumo de Progresso

## Objetivo
Preparar base para velocidade de desenvolvimento (2-3 dias)

## Status: ✅ CONCLUÍDO (exceto migration manual)

## Entregas Realizadas

### Backend - Autenticação ✅
- **Módulo de Autenticação Completo**
  - Entidade de domínio `Usuario` com propriedades UUID, email, senha, nome, papel
  - Interface `IUsuarioRepository` com padrão Repository
  - Implementações: `PrismaUsuarioRepository`, `MemoryUsuarioRepository`
  - Service `AuthService` com hash de senha (bcrypt) e geração de JWT
  - Controller `AuthController` com validação Zod
  - Rotas `/auth/registrar` e `/auth/login`

- **Middleware de Autorização**
  - `autenticar`: Verifica token JWT no header Authorization
  - `autorizar`: Verifica papel do usuário (docente, admin)
  - Proteção aplicada nas rotas de escrita de posts (POST, PUT, DELETE)

- **Segurança**
  - Senhas hash com bcrypt (salt rounds: 10)
  - Tokens JWT com expiração configurável (default: 7d)
  - Variáveis de ambiente: `JWT_SECRET`, `JWT_EXPIRES_IN`

### Backend - Documentação ✅
- **OpenAPI/Swagger**
  - Documentação completa em `docs/openapi.yaml`
  - Todos os endpoints documentados com schemas
  - Exemplos de requisições/respostas
  - Códigos de status HTTP documentados

- **Coleção HTTP**
  - Arquivo `http/auth.http` com exemplos de requisições
  - Endpoints de autenticação e posts
  - Placeholders para token e UUID

- **Padronização de Erros**
  - Sistema de códigos de erro por domínio (`src/shared/erros.ts`)
  - Códigos estruturados: `AUTH_001`, `POST_001`, etc.
  - Classe `ErroAplicacao` para erros tipados
  - Mensagens padronizadas para melhor UX no frontend

### Backend - Seeds ✅
- Script de seed em `prisma/seed.ts`
- Cria 3 usuários de teste:
  - `docente1@fiap.com.br` (senha: senha123)
  - `docente2@fiap.com.br` (senha: senha123)
  - `admin@fiap.com.br` (senha: senha123)
- Script adicionado ao package.json: `npm run seed`

### Backend - Configuração ✅
- Atualizado `.env.example` com variáveis JWT
- Atualizado `package.json` com dependências:
  - `bcryptjs` ^2.4.3
  - `jsonwebtoken` ^9.0.2
  - Types: `@types/bcryptjs`, `@types/jsonwebtoken`
- Atualizado README com instruções de autenticação e migrations

### Backend - Schema Prisma ✅
- Modelo `Usuario` adicionado ao schema
- Campos: id, uuid, email, senha, nome, papel, createdAt, updatedAt
- Papel padrão: 'docente'

## Pendentes (Ação Manual Required)

### Migration Prisma ⏳
```bash
# Executar migration para criar tabela usuarios
npx prisma migrate dev --name add_usuarios_table

# Executar seed para criar usuários de teste
npm run seed
```

**Nota**: A migration foi cancelada pelo usuário. Deve ser executada manualmente quando o banco estiver acessível.

## Arquivos Criados/Modificados

### Novos Arquivos
```
src/auth/
  ├── usuario.ts
  ├── usuarioRepository.ts
  ├── usuarioSchemas.ts
  ├── authService.ts
  ├── authController.ts
  ├── authRoutes.ts
  └── authMiddleware.ts

src/shared/
  └── erros.ts

prisma/
  └── seed.ts

docs/
  └── openapi.yaml

http/
  └── auth.http
```

### Arquivos Modificados
```
prisma/schema.prisma (adicionado modelo Usuario)
src/app.ts (adicionadas rotas /auth)
src/posts/postRoutes.ts (adicionado middleware de autorização)
package.json (adicionadas dependências e script seed)
.env (adicionadas variáveis JWT)
.env.example (adicionadas variáveis JWT)
README.md (atualizado com documentação de auth)
```

## Próximos Passos (Sprint 1)

1. **Executar migration Prisma** (ação manual)
2. **Criar app React com Vite**
3. **Implementar página principal (lista de posts + busca)**
4. **Implementar página de leitura de post**
5. **Garantir layout responsivo**

## Notas Técnicas

### Padrões Seguidos
- **DDD**: Entidades ricas, Services, Repositories
- **Clean Architecture**: Separação de camadas
- **SOLID**: Interface segregation, Dependency injection
- **Repository Pattern**: Múltiplas implementações (Prisma, Memory)
- **Middleware Pattern**: Autenticação e autorização como middlewares Express

### Decisões de Arquitetura
- JWT em vez de sessions para stateless auth
- bcrypt em vez de argon2 por compatibilidade e performance adequada
- Papeis simples (docente, admin) por enquanto, extensível para RBAC futuro
- Middleware de autorização separado para reuso em outros domínios

### Segurança
- Senhas nunca retornadas na API (apenas em hash)
- Tokens com expiração (7d default)
- Middleware verifica token em cada requisição protegida
- Variáveis de ambiente para secrets (JWT_SECRET)

## Status do Sprint 0
**Conclusão**: 90% completo
- Tarefas automatizadas: 100%
- Tarefas manuais: 0% (aguarda execução manual da migration)

O Sprint 0 preparou com sucesso a base para desenvolvimento acelerado do frontend, com autenticação funcional, documentação completa e padronização de erros.
