# BDD: Usuários (`/usuarios`)

Cenários executados de fato contra a API local (`http://localhost:8085`),
autenticando como o admin do seed (`admin@fiap.com.br`) e como um usuário
comum registrado publicamente (papel `docente`). Script:
[`scripts/usuarios.sh`](./scripts/usuarios.sh).

Tokens JWT completos foram substituídos por `<jwt-token>`. UUIDs e e-mails
gerados dinamicamente (sufixo de timestamp) foram mantidos como aparecem na
execução real, mas variam a cada nova rodada dos scripts.

> **Observação sobre o ambiente:** o banco local de desenvolvimento continha
> registros residuais de execuções anteriores da suíte Jest (`test-*@test.com`,
> incluindo múltiplos usuários com papel `admin`). Antes de documentar os
> cenários abaixo, esses registros residuais foram removidos via API (login
> como admin + `DELETE /usuarios/{uuid}`) para deixar o cenário de "último
> admin" determinístico. Nenhuma escrita direta no banco foi feita.

---

## Cenário 1 (feliz): Admin lista usuários paginados

**Dado** um usuário autenticado com papel `admin`
**Quando** envio `GET /usuarios?page=1&pageSize=10`
**Então** a API deve retornar 200 com lista paginada de usuários

Resposta real (truncada):
```json
{"sucesso":true,"dados":[{"uuid":"08677a3e-...","email":"usuario.comum...@fiap.com.br","papel":"docente", "...":"..."}],"paginacao":{"page":1,"pageSize":10,"total":9,"totalPaginas":1}}
STATUS: 200
```

**Esperado:** 200 com `dados` e `paginacao`. **Obtido:** igual ao esperado. ✅

---

## Cenário 2 (feliz): Admin cria usuário com papel arbitrário `aluno`

**Quando** envio `POST /usuarios` autenticado como admin, definindo `"papel":"aluno"`
**Então** a API deve criar o usuário com o papel solicitado (somente admin pode fazer isso)

Resposta real:
```json
{"sucesso":true,"dados":{"uuid":"0b5a4fc8-2279-4174-9298-62ee96f12338","email":"outro.<ts>@fiap.com.br","nome":"Outro Aluno","papel":"aluno","createdAt":"...","updatedAt":"..."}}
STATUS: 201
```

**Esperado:** 201, `papel: aluno`. **Obtido:** igual ao esperado. ✅

---

## Cenário 3 (feliz): Admin consulta usuário por UUID

**Quando** o admin consulta `GET /usuarios/{uuid}` de outro usuário
**Então** a API deve retornar 200 com os dados completos

Resposta real:
```json
{"sucesso":true,"dados":{"uuid":"9b701a4c-f41a-4780-8ba7-5aca8ae7f5f8","email":"criado.pelo.admin.<ts>@fiap.com.br","nome":"Aluno Criado Por Admin","papel":"aluno","createdAt":"...","updatedAt":"..."}}
STATUS: 200
```

**Esperado:** 200. **Obtido:** igual ao esperado. ✅

---

## Cenário 4 (feliz): Usuário comum consulta a si próprio

**Dado** um usuário sem papel admin
**Quando** ele consulta `GET /usuarios/{seu-próprio-uuid}`
**Então** a API deve permitir e retornar 200

Resposta real:
```json
{"sucesso":true,"dados":{"uuid":"08677a3e-dca0-43d8-bd73-8e46196a19cc","email":"usuario.comum.<ts>@fiap.com.br","nome":"Usuario Comum","papel":"docente","createdAt":"...","updatedAt":"..."}}
STATUS: 200
```

**Esperado:** 200. **Obtido:** igual ao esperado. ✅

---

## Cenário 5 (feliz): Admin atualiza (PATCH) nome do usuário criado

Resposta real:
```json
{"sucesso":true,"dados":{"uuid":"9b701a4c-...","nome":"Aluno Renomeado","papel":"aluno","updatedAt":"..."}}
STATUS: 200
```

**Esperado:** 200 com nome atualizado. **Obtido:** igual ao esperado. ✅

---

## Cenário 6 (feliz): Admin atualiza (PUT) usuário criado

Resposta real:
```json
{"sucesso":true,"dados":{"uuid":"9b701a4c-...","nome":"Aluno Substituido","papel":"aluno","updatedAt":"..."}}
STATUS: 200
```

**Esperado:** 200. **Obtido:** igual ao esperado. ✅

---

## Cenário 7 (feliz): Admin remove usuário criado

Resposta real:
```
(corpo vazio)
STATUS: 204
```

**Esperado:** 204. **Obtido:** igual ao esperado. ✅

---

## Cenário 8 (falha - autenticação): Listar usuários sem token

**Quando** envio `GET /usuarios` sem cabeçalho `Authorization`
**Então** a API deve retornar 401

Resposta real:
```json
{"message":"Token não fornecido"}
STATUS: 401
```
✅

---

## Cenário 9 (falha - autenticação): Listar usuários com token inválido

Resposta real:
```json
{"message":"Token inválido ou expirado"}
STATUS: 401
```
✅

---

## Cenário 10 (falha - autorização): Usuário não-admin tenta listar usuários

**Dado** um usuário com papel `docente` (não-admin)
**Quando** ele tenta `GET /usuarios`
**Então** a API deve retornar 403

Resposta real:
```json
{"message":"Permissão insuficiente"}
STATUS: 403
```
✅

---

## Cenário 11 (falha - autorização): Usuário não-admin tenta criar usuário

Resposta real:
```json
{"message":"Permissão insuficiente"}
STATUS: 403
```
✅

---

## Cenário 12 (falha - conflito): Admin tenta criar usuário com e-mail já em uso

Resposta real:
```json
{"codigo":"USR_002","message":"Email já está em uso por outro usuário"}
STATUS: 409
```
✅

---

## Cenário 13 (falha - não encontrado): Admin consulta usuário inexistente

**Quando** consulto `GET /usuarios/00000000-0000-0000-0000-000000000000`
**Então** a API deve retornar 404

Resposta real:
```json
{"codigo":"USR_001","message":"Usuário não encontrado"}
STATUS: 404
```
✅

---

## Cenário 14 (falha - autorização): Usuário comum tenta consultar outro usuário

**Dado** um usuário comum autenticado
**Quando** ele tenta `GET /usuarios/{uuid-de-outro-usuário}`
**Então** a API deve retornar 403 (só pode consultar a si mesmo)

Resposta real:
```json
{"codigo":"USR_004","message":"Você só pode consultar seus próprios dados"}
STATUS: 403
```
✅

---

## Cenário 15 (falha - conflito): Admin tenta remover a si mesmo sendo o último admin

**Dado** que existe apenas um usuário com papel `admin` no sistema
**Quando** esse admin tenta `DELETE /usuarios/{seu-próprio-uuid}`
**Então** a API deve bloquear com 409

Resposta real:
```json
{"codigo":"USR_003","message":"Não é possível remover o último administrador do sistema"}
STATUS: 409
```

**Esperado:** 409, exclusão bloqueada. **Obtido:** igual ao esperado. ✅

> Nota: na primeira execução dos scripts, o banco de desenvolvimento tinha
> múltiplos usuários residuais com papel `admin` (de execuções anteriores da
> suíte Jest), então esse cenário retornou 204 (exclusão permitida
> corretamente, pois não era o último admin). Após a limpeza do ambiente
> (ver observação no topo do arquivo), o cenário passou a validar
> corretamente a regra do "último admin".

---

## Cenário 16 (falha - conflito): Admin tenta rebaixar a si mesmo (último admin) para `docente`

Resposta real:
```json
{"codigo":"USR_003","message":"Não é possível remover o último administrador do sistema"}
STATUS: 409
```

**Esperado:** 409, rebaixamento bloqueado. **Obtido:** igual ao esperado. ✅

---

## Cenário 17 (validação): Admin tenta criar usuário com senha fraca

Resposta real:
```json
{"codigo":"VAL_001","message":"Falha na validação dos campos","errors":[{"field":"senha","message":"A senha deve ter pelo menos 8 caracteres"},{"field":"senha","message":"A senha deve conter ao menos uma letra minúscula"},{"field":"senha","message":"A senha deve conter ao menos uma letra maiúscula"},{"field":"senha","message":"A senha deve conter ao menos um caractere especial"}]}
STATUS: 400
```
✅

---

## Cenário 18 (validação): Admin tenta criar usuário com e-mail inválido

Resposta real:
```json
{"codigo":"VAL_001","message":"Falha na validação dos campos","errors":[{"field":"email","message":"Email inválido"}]}
STATUS: 400
```
✅

---

## Cenário 19 (validação): Usuário comum tenta atualizar o próprio perfil com corpo vazio

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
| Listar usuários (admin) | Feliz | 200 | 200 | ✅ |
| Criar usuário com papel arbitrário (admin) | Feliz | 201 | 201 | ✅ |
| Consultar usuário por UUID (admin) | Feliz | 200 | 200 | ✅ |
| Consultar a si próprio (não-admin) | Feliz | 200 | 200 | ✅ |
| Atualizar (PATCH) usuário | Feliz | 200 | 200 | ✅ |
| Atualizar (PUT) usuário | Feliz | 200 | 200 | ✅ |
| Remover usuário (admin) | Feliz | 204 | 204 | ✅ |
| Listar sem token | Falha (autenticação) | 401 | 401 | ✅ |
| Listar com token inválido | Falha (autenticação) | 401 | 401 | ✅ |
| Não-admin lista usuários | Falha (autorização) | 403 | 403 | ✅ |
| Não-admin cria usuário | Falha (autorização) | 403 | 403 | ✅ |
| Criar com e-mail duplicado | Falha (conflito) | 409 | 409 | ✅ |
| Consultar usuário inexistente | Falha (não encontrado) | 404 | 404 | ✅ |
| Não-admin consulta outro usuário | Falha (autorização) | 403 | 403 | ✅ |
| Remover último admin | Falha (conflito) | 409 | 409 | ✅ |
| Rebaixar último admin | Falha (conflito) | 409 | 409 | ✅ |
| Criar com senha fraca | Validação | 400 | 400 | ✅ |
| Criar com e-mail inválido | Validação | 400 | 400 | ✅ |
| Atualizar com corpo vazio | Validação | 400 | 400 | ✅ |

Nenhum comportamento inesperado na implementação foi encontrado. O único
ponto de atenção foi de ambiente (dados residuais de testes anteriores no
banco local de desenvolvimento), documentado acima, não um defeito de
código.
