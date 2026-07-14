# BDD: Posts (`/posts`)

Cenários executados de fato contra a API local (`http://localhost:8085`).
Escrita de posts exige papel `docente` ou `admin`; leitura é pública. A
autoria (`autor`) é sempre derivada da sessão autenticada, nunca do corpo da
requisição. Script: [`scripts/posts.sh`](./scripts/posts.sh).

Tokens JWT completos foram substituídos por `<jwt-token>`.

> Nota de contrato: a atualização de post usa `PATCH /posts/{uuid}` (não
> `PUT`), com campos de entrada `titulo`/`conteudo`, confirmado em
> `src/posts/postRoutes.ts` e `src/posts/postSchemas.ts`.

---

## Cenário 1 (feliz): Docente autenticado cria post

**Dado** um usuário autenticado com papel `docente`
**Quando** envio `POST /posts` com `titulo` e `conteudo` válidos
**Então** a API deve criar o post com `autor` derivado da sessão (nunca do corpo) e retornar 201

Resposta real:
```json
{"sucesso":true,"dados":{"uuid":"aad899dd-9fa5-48b2-b3ec-4771be08b2cd","titulo":"Post de Teste BDD <ts> v2","conteudo":"Conteúdo de teste do cenário BDD com mais de dez caracteres.","autor":"Docente Posts BDD","criadoEm":"2026-07-13T23:56:14.227Z","atualizadoEm":"2026-07-13T23:56:14.227Z"}}
STATUS: 201
```

**Esperado:** 201, `autor` igual ao nome do usuário autenticado. **Obtido:** igual ao esperado. ✅

---

## Cenário 2 (feliz): Listar todos os posts

**Quando** envio `GET /posts` (rota pública, sem token)
**Então** a API deve retornar 200 com a lista de posts, mais recentes primeiro

Resposta real (truncada):
```json
{"sucesso":true,"dados":[{"uuid":"aad899dd-...","titulo":"Post de Teste BDD <ts> v2","...":"..."}, "..."]}
STATUS: 200
```
✅

---

## Cenário 3 (feliz): Buscar post por ID existente

Resposta real:
```json
{"sucesso":true,"dados":{"uuid":"c7cc64a7-c1b5-4d49-a268-1a41816f51fe","titulo":"Post de Teste BDD <ts>","conteudo":"Conteúdo de teste do cenário BDD com mais de dez caracteres.","autor":"Docente Posts BDD","criadoEm":"...","atualizadoEm":"..."}}
STATUS: 200
```
✅

---

## Cenário 4 (feliz): Buscar posts por palavra-chave

**Quando** envio `GET /posts/search?q=BDD`
**Então** a API deve retornar 200 com os posts que contêm o termo no título ou conteúdo

Resposta real: lista com os posts criados no cenário 1, `STATUS: 200`. ✅

---

## Cenário 5 (feliz): Docente atualiza (PATCH) o próprio post

Resposta real:
```json
{"sucesso":true,"dados":{"uuid":"c7cc64a7-...","titulo":"Post de Teste BDD Atualizado <ts>","conteudo":"...","autor":"Docente Posts BDD","atualizadoEm":"..."}}
STATUS: 200
```
✅

---

## Cenário 6 (feliz): Docente exclui o post criado

Resposta real:
```
(corpo vazio)
STATUS: 204
```
✅

---

## Cenário 7 (falha - autenticação): Criar post sem token

Resposta real:
```json
{"message":"Token não fornecido"}
STATUS: 401
```
✅

---

## Cenário 8 (falha - autenticação): Criar post com token inválido

Resposta real:
```json
{"message":"Token inválido ou expirado"}
STATUS: 401
```
✅

---

## Cenário 9 (falha - autorização): Usuário com papel `aluno` tenta criar post

**Dado** um usuário autenticado com papel `aluno`
**Quando** ele tenta `POST /posts`
**Então** a API deve retornar 403 (apenas `docente`/`admin` podem escrever)

Resposta real:
```json
{"message":"Permissão insuficiente"}
STATUS: 403
```
✅

---

## Cenário 10 (falha - não encontrado): Buscar post por ID inexistente

Resposta real:
```json
{"codigo":"POST_001","message":"Post não encontrado"}
STATUS: 404
```
✅

---

## Cenário 11 (falha - não encontrado): Atualizar post inexistente

Resposta real:
```json
{"codigo":"POST_001","message":"Post não encontrado"}
STATUS: 404
```
✅

---

## Cenário 12 (falha - não encontrado): Excluir post inexistente

Resposta real:
```json
{"codigo":"POST_001","message":"Post não encontrado"}
STATUS: 404
```
✅

---

## Cenário 13 (falha - não encontrado): Excluir post já excluído anteriormente

**Dado** um post que já foi excluído no cenário 6
**Quando** tento excluí-lo novamente
**Então** a API deve retornar 404 (idempotência de exclusão: não há "sucesso duplo")

Resposta real:
```json
{"codigo":"POST_001","message":"Post não encontrado"}
STATUS: 404
```
✅

---

## Cenário 14 (validação): Criar post com título muito curto

Resposta real:
```json
{"codigo":"VAL_001","message":"Falha na validação dos campos","errors":[{"field":"titulo","message":"O título deve ter pelo menos 3 caracteres"}]}
STATUS: 400
```
✅

---

## Cenário 15 (validação): Criar post com conteúdo faltando

Resposta real:
```json
{"codigo":"VAL_001","message":"Falha na validação dos campos","errors":[{"field":"conteudo","message":"Invalid input: expected string, received undefined"}]}
STATUS: 400
```
✅

---

## Cenário 16 (validação): Atualizar post com corpo vazio

Resposta real:
```json
{"codigo":"VAL_001","message":"Falha na validação dos campos","errors":[{"field":"","message":"Pelo menos um campo deve ser fornecido para atualização"}]}
STATUS: 400
```
✅

---

## Resumo do domínio

| Cenário | Tipo | Status esperado | Status obtido | Resultado |
|---|---|---|---|---|
| Criar post autenticado | Feliz | 201 | 201 | ✅ |
| Listar posts | Feliz | 200 | 200 | ✅ |
| Buscar post por ID | Feliz | 200 | 200 | ✅ |
| Buscar por palavra-chave | Feliz | 200 | 200 | ✅ |
| Atualizar (PATCH) próprio post | Feliz | 200 | 200 | ✅ |
| Excluir post | Feliz | 204 | 204 | ✅ |
| Criar sem token | Falha (autenticação) | 401 | 401 | ✅ |
| Criar com token inválido | Falha (autenticação) | 401 | 401 | ✅ |
| Papel `aluno` cria post | Falha (autorização) | 403 | 403 | ✅ |
| Buscar ID inexistente | Falha (não encontrado) | 404 | 404 | ✅ |
| Atualizar post inexistente | Falha (não encontrado) | 404 | 404 | ✅ |
| Excluir post inexistente | Falha (não encontrado) | 404 | 404 | ✅ |
| Excluir post já excluído | Falha (não encontrado) | 404 | 404 | ✅ |
| Criar com título curto | Validação | 400 | 400 | ✅ |
| Criar sem conteúdo | Validação | 400 | 400 | ✅ |
| Atualizar com corpo vazio | Validação | 400 | 400 | ✅ |

Nenhum comportamento inesperado foi encontrado neste domínio. A atualização
de post usa `PATCH /posts/{uuid}` com os campos `titulo`/`conteudo`.
