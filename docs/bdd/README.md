# BDDs Organizados por Domínios

Esta pasta contém os cenários BDD organizados por domínios de negócio, seguindo uma estrutura escalável e de fácil manutenção.

## Estrutura de Diretórios

```
bdd/
├── auth/                          # Domínio de Autenticação
│   ├── registro/                  # Funcionalidade de Registro
│   │   ├── sucesso.md            # Cenários de sucesso
│   │   ├── falha.md              # Cenários de falha
│   │   └── validacao.md          # Cenários de validação
│   ├── login/                     # Funcionalidade de Login
│   │   ├── sucesso.md
│   │   ├── falha.md
│   │   └── validacao.md
│   └── autorizacao/               # Funcionalidade de Autorização
│       ├── sucesso.md
│       ├── falha.md
│       └── validacao.md
├── posts/                         # Domínio de Posts
│   ├── criacao/                   # Funcionalidade de Criação
│   │   ├── sucesso.md
│   │   ├── falha.md
│   │   └── validacao.md
│   ├── leitura/                   # Funcionalidade de Leitura
│   │   ├── sucesso.md
│   │   ├── falha.md
│   │   └── validacao.md
│   ├── atualizacao/               # Funcionalidade de Atualização
│   │   ├── sucesso.md
│   │   ├── falha.md
│   │   └── validacao.md
│   ├── exclusao/                  # Funcionalidade de Exclusão
│   │   ├── sucesso.md
│   │   ├── falha.md
│   │   └── validacao.md
│   └── busca/                     # Funcionalidade de Busca
│       ├── sucesso.md
│       ├── falha.md
│       └── validacao.md
└── monitoramento/                 # Domínio de Monitoramento
    ├── health/                    # Funcionalidade de Health Check
    │   ├── sucesso.md
    │   ├── falha.md
    │   └── validacao.md
    └── metrics/                   # Funcionalidade de Métricas
        ├── sucesso.md
        ├── falha.md
        └── validacao.md
```

## Padrão de Organização

Cada domínio é dividido em funcionalidades, e cada funcionalidade contém três tipos de cenários:

1. **sucesso.md**: Cenários de happy path (fluxo ideal)
2. **falha.md**: Cenários de falha de negócio (erros esperados)
3. **validacao.md**: Cenários de validação de entrada (dados inválidos)

## Benefícios desta Estrutura

- **Escalabilidade**: Fácil adicionar novos domínios e funcionalidades
- **Manutenibilidade**: Cenários relacionados ficam próximos
- **Clareza**: Separação clara entre tipos de cenários
- **Mapeamento**: Correspondência direta com estrutura de testes

## Migração da Estrutura Antiga

Os arquivos BDD originais foram movidos para a pasta `legacy/`:
- `cenarios-autenticacao.md` → `legacy/cenarios-autenticacao.md`
- `cenarios-sucesso.md` → `legacy/cenarios-sucesso.md`
- `cenarios-falha.md` → `legacy/cenarios-falha.md`

## Como Usar

Ao adicionar novos cenários BDD:

1. Identifique o domínio (auth, posts, monitoramento, etc.)
2. Identifique a funcionalidade (registro, login, criacao, etc.)
3. Escolha o tipo de cenário (sucesso, falha, validacao)
4. Adicione o cenário no arquivo correspondente

Exemplo: Para adicionar um cenário de validação de email no registro:
→ Editar `bdd/auth/registro/validacao.md`
