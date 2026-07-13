# BDD via curl - API Blog Educacional

Esta pasta contém scripts bash reais (usando `curl`) e a documentação, em
estilo BDD (Dado/Quando/Então), dos cenários exercitados contra a API local
rodando de fato (não são exemplos simulados — todas as respostas
documentadas foram capturadas em execuções reais).

## Índice de cenários

- [`auth.md`](./auth.md) — Autenticação (`/auth/registrar`, `/auth/login`): 10 cenários.
- [`usuarios.md`](./usuarios.md) — Usuários (`/usuarios`, CRUD administrativo): 19 cenários.
- [`posts.md`](./posts.md) — Posts (`/posts`, CRUD com autoria pela sessão): 16 cenários.

Cada domínio cobre três tipos de cenário:
- **Caminho feliz**: fluxo principal bem-sucedido.
- **Falha**: autenticação/autorização ausente ou inválida, conflito (409),
  recurso não encontrado (404), tentativa de escalação de papel.
- **Validação**: payload malformado, campos faltando, senha fraca, e-mail
  inválido (400).

## Scripts

- [`scripts/common.sh`](./scripts/common.sh) — funções compartilhadas (`run_curl`, `json_field`).
- [`scripts/auth.sh`](./scripts/auth.sh)
- [`scripts/usuarios.sh`](./scripts/usuarios.sh)
- [`scripts/posts.sh`](./scripts/posts.sh)

Cada script imprime, para cada cenário, um separador com o título do
cenário, o corpo da resposta e a linha `STATUS: <código HTTP>`.

## Como rodar localmente

Pré-requisitos:
- Docker e Docker Compose instalados.
- Arquivo `api/.env` configurado (baseado em `api/.env.example`), com
  `DATABASE_URL` apontando para a porta `5454` (padrão do
  `docker-compose.dev.yml`) e `PORT=8085`.
- Node.js 20+ e dependências instaladas (`npm install` em `api/`).

Passos:

```bash
# 1. Subir apenas o banco de dados local
cd api
docker compose -f docker-compose.dev.yml up -d db

# 2. Aplicar migrations e (opcional, recomendado) seed de usuários
npx prisma migrate deploy
npm run seed   # cria admin@fiap.com.br / senha123 e dois docentes

# 3. Iniciar a API localmente (porta definida em api/.env, ex.: 8085)
npm run dev

# 4. Em outro terminal, rodar os scripts BDD
cd api/bdd/scripts
./auth.sh
./usuarios.sh
./posts.sh

# Opcional: apontar para outra URL/porta
BASE_URL=http://localhost:3001 ./posts.sh
```

Os scripts de `usuarios.sh` e `posts.sh` dependem do usuário admin do seed
(`admin@fiap.com.br` / `senha123`) para os cenários que exigem papel
`admin`. Se o seed não tiver sido executado, os scripts falham com uma
mensagem explícita.

### Importante sobre o cenário de "último admin"

O cenário de bloqueio de remoção/rebaixamento do último administrador
(`usuarios.sh`) só é determinístico se existir exatamente um usuário com
papel `admin` no banco no momento da execução. Bancos locais que acumulem
usuários de testes anteriores (por exemplo, execuções da suíte Jest que não
limparam o estado) podem ter múltiplos admins residuais, o que faz a
remoção ser permitida (204) em vez de bloqueada (409) — não é um defeito da
API, é uma característica do estado do banco. Recomenda-se rodar
`npx prisma migrate reset` (ambiente local, nunca em produção) antes de
executar os scripts se quiser reproduzir exatamente os resultados
documentados em `usuarios.md`.

## Resumo do que foi coberto

- **Autenticação**: registro, login, proteção contra autopromoção de papel
  no registro público, conflito de e-mail duplicado, credenciais inválidas,
  validação de força de senha e formato de e-mail.
- **Usuários**: listagem paginada e filtrada (somente admin), criação com
  papel arbitrário (somente admin), consulta/atualização/remoção com
  controle de acesso (admin vê tudo; usuário comum só vê a si mesmo),
  bloqueio de remoção/rebaixamento do último admin, conflito de e-mail,
  validações de payload.
- **Posts**: leitura pública (listagem, busca por palavra-chave, busca por
  ID), escrita restrita a papéis `docente`/`admin` com autoria sempre
  derivada da sessão autenticada (nunca aceita do corpo da requisição),
  404 para recursos inexistentes, validações de tamanho mínimo de
  título/conteúdo.

Todos os cenários documentados neste diretório passaram conforme o
resultado esperado. Nenhuma alteração de código de produção foi necessária
para viabilizar os testes; os únicos ajustes realizados foram na preparação
do ambiente local (aplicação de migrations, seed e limpeza de dados
residuais de testes anteriores via API), descritos em `usuarios.md`.

A única divergência encontrada não é um bug de comportamento, mas uma
desatualização de documentação: `docs/openapi.yaml` descreve
`PUT /posts/{id}` com campos `title`/`content`, enquanto a implementação
real usa `PATCH /posts/{uuid}` com campos `titulo`/`conteudo` (ver detalhes
em `posts.md`).
