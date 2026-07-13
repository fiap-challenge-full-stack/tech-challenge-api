# BDD: Autenticação (`/auth/registrar`, `/auth/login`)

Todos os cenários abaixo foram executados de fato contra a API local
(`http://localhost:8085`), com Postgres via `docker-compose.dev.yml` e seed
padrão aplicado. Script: [`scripts/auth.sh`](./scripts/auth.sh).

Tokens JWT completos foram substituídos por `<jwt-token>`.

---

## Cenário 1 (feliz): Registrar novo usuário com dados válidos

**Dado** que não existe usuário cadastrado com um determinado e-mail
**Quando** envio `POST /auth/registrar` com e-mail, senha forte e nome válidos
**Então** a API deve criar o usuário com papel `docente` (padrão) e retornar um token JWT

Comando:
```bash
curl -s -X POST http://localhost:8085/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"email":"docente.bdd.<ts>@fiap.com.br","senha":"Senha123@","nome":"Docente BDD"}'
```

Resposta real:
```json
{"usuario":{"uuid":"2849a57f-673f-42e0-8da2-32aeaa29e715","email":"docente.bdd.1783986986@fiap.com.br","nome":"Docente BDD","papel":"docente","createdAt":"2026-07-13T23:56:26.200Z","updatedAt":"2026-07-13T23:56:26.200Z"},"token":"<jwt-token>"}
STATUS: 201
```

**Esperado:** 201, `papel: docente`, token presente. **Obtido:** igual ao esperado. ✅

---

## Cenário 2 (feliz): Login com credenciais corretas

**Dado** um usuário previamente registrado
**Quando** envio `POST /auth/login` com e-mail e senha corretos
**Então** a API deve retornar 200 com os dados do usuário e um token JWT

Resposta real:
```json
{"usuario":{"uuid":"2849a57f-673f-42e0-8da2-32aeaa29e715","email":"docente.bdd.1783986986@fiap.com.br","nome":"Docente BDD","papel":"docente","createdAt":"2026-07-13T23:56:26.200Z","updatedAt":"2026-07-13T23:56:26.200Z"},"token":"<jwt-token>"}
STATUS: 200
```

**Esperado:** 200 com token. **Obtido:** igual ao esperado. ✅

---

## Cenário 3 (falha - autenticação): Login com senha incorreta

**Dado** um usuário previamente registrado
**Quando** envio `POST /auth/login` com a senha errada
**Então** a API deve retornar 401 sem revelar qual campo está incorreto

Resposta real:
```json
{"codigo":"AUTH_001","message":"Credenciais inválidas"}
STATUS: 401
```

**Esperado:** 401, mensagem genérica. **Obtido:** igual ao esperado. ✅

---

## Cenário 4 (falha - autenticação): Login com e-mail inexistente

**Quando** envio `POST /auth/login` com um e-mail que não existe na base
**Então** a API deve retornar 401 com a mesma mensagem genérica do cenário anterior (evita enumeração de usuários)

Resposta real:
```json
{"codigo":"AUTH_001","message":"Credenciais inválidas"}
STATUS: 401
```

**Esperado:** 401. **Obtido:** igual ao esperado. ✅

---

## Cenário 5 (falha - conflito): Registro com e-mail já em uso

**Dado** um usuário já registrado com um e-mail
**Quando** tento registrar novamente com o mesmo e-mail
**Então** a API deve retornar 409

Resposta real:
```json
{"codigo":"AUTH_005","message":"Usuário já existe"}
STATUS: 409
```

**Esperado:** 409. **Obtido:** igual ao esperado. ✅

---

## Cenário 6 (falha - autorização/escalação): Registro público tentando definir `papel: admin`

**Dado** que o registro público nunca deve aceitar `papel` vindo do cliente (proteção contra autopromoção)
**Quando** envio `POST /auth/registrar` incluindo `"papel":"admin"` no corpo
**Então** a API deve ignorar silenciosamente o campo `papel` e criar o usuário como `docente`

Resposta real:
```json
{"usuario":{"uuid":"ac827e49-9029-4488-9f11-cdee5d2e0475","email":"escalada.1783986986@fiap.com.br","nome":"Tentativa Escalada","papel":"docente","createdAt":"2026-07-13T23:56:26.522Z","updatedAt":"2026-07-13T23:56:26.522Z"},"token":"<jwt-token>"}
STATUS: 201
```

**Esperado:** 201 com `papel: docente` (campo `papel` do corpo ignorado). **Obtido:** igual ao esperado — a proteção contra autoescalação de papel continua bloqueada. ✅

---

## Cenário 7 (validação): Registro com e-mail inválido

**Quando** envio `POST /auth/registrar` com `email: "email-invalido"`
**Então** a API deve retornar 400 com detalhamento do campo inválido

Resposta real:
```json
{"codigo":"VAL_001","message":"Falha na validação dos campos","errors":[{"field":"email","message":"Email inválido"}]}
STATUS: 400
```

**Esperado:** 400. **Obtido:** igual ao esperado. ✅

---

## Cenário 8 (validação): Registro com senha fraca

**Quando** envio `POST /auth/registrar` com senha sem maiúscula, número ou caractere especial
**Então** a API deve retornar 400 listando todas as regras de senha violadas

Resposta real:
```json
{"codigo":"VAL_001","message":"Falha na validação dos campos","errors":[{"field":"senha","message":"A senha deve conter ao menos uma letra maiúscula"},{"field":"senha","message":"A senha deve conter ao menos um número"},{"field":"senha","message":"A senha deve conter ao menos um caractere especial"}]}
STATUS: 400
```

**Esperado:** 400 com múltiplos erros de senha. **Obtido:** igual ao esperado. ✅

---

## Cenário 9 (validação): Registro com campo `nome` faltando

**Quando** envio `POST /auth/registrar` sem o campo `nome`
**Então** a API deve retornar 400

Resposta real:
```json
{"codigo":"VAL_001","message":"Falha na validação dos campos","errors":[{"field":"nome","message":"Invalid input: expected string, received undefined"}]}
STATUS: 400
```

**Esperado:** 400. **Obtido:** igual ao esperado. ✅

---

## Cenário 10 (validação): Login com payload malformado (senha faltando)

**Quando** envio `POST /auth/login` sem o campo `senha`
**Então** a API deve retornar 400

Resposta real:
```json
{"codigo":"VAL_001","message":"Falha na validação dos campos","errors":[{"field":"senha","message":"Invalid input: expected string, received undefined"}]}
STATUS: 400
```

**Esperado:** 400. **Obtido:** igual ao esperado. ✅

---

## Resumo do domínio

| Cenário | Tipo | Status esperado | Status obtido | Resultado |
|---|---|---|---|---|
| Registrar com dados válidos | Feliz | 201 | 201 | ✅ |
| Login com credenciais corretas | Feliz | 200 | 200 | ✅ |
| Login com senha incorreta | Falha (auth) | 401 | 401 | ✅ |
| Login com e-mail inexistente | Falha (auth) | 401 | 401 | ✅ |
| Registro com e-mail duplicado | Falha (conflito) | 409 | 409 | ✅ |
| Registro tentando definir `papel: admin` | Falha (escalação bloqueada) | 201 (papel ignorado) | 201, papel `docente` | ✅ |
| Registro com e-mail inválido | Validação | 400 | 400 | ✅ |
| Registro com senha fraca | Validação | 400 | 400 | ✅ |
| Registro sem `nome` | Validação | 400 | 400 | ✅ |
| Login sem `senha` | Validação | 400 | 400 | ✅ |

Nenhum comportamento inesperado foi encontrado neste domínio.
