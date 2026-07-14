# Arquitetura — ERP HVAC

Documento vivo. Descreve **como** o sistema é construído. Toda decisão nova
deve respeitar (ou atualizar conscientemente) o que está aqui.

## Visão geral

- **Tipo:** SaaS multi-tenant (multiempresa) — um único deploy atende milhares de empresas.
- **Forma:** Monólito Modular com **Clean Architecture** por dentro.
  - Começamos como monólito (KISS): mais simples de construir, deployar e depurar.
  - As fronteiras internas são limpas, então se um módulo precisar escalar
    isolado no futuro, ele é extraído sem reescrita (a camada de domínio é
    framework-agnostic de propósito).
- **Deploy:** Vercel (serverless). Por isso o backend vive dentro do Next.js
  (route handlers + server actions), não em um servidor separado sempre ligado.

## Stack

| Camada            | Tecnologia                                  |
| ----------------- | ------------------------------------------- |
| App (front+back)  | Next.js 16 (App Router) + TypeScript        |
| UI                | Tailwind CSS 4 + shadcn/ui                  |
| Banco             | PostgreSQL (Neon, serverless)               |
| ORM               | Drizzle ORM                                 |
| Multi-tenancy     | `tenant_id` + Row Level Security (Postgres) |
| Auth + RBAC       | Clerk (Organizations = empresas)            |
| Jobs agendados    | Inngest (serverless-native)                 |

## Estrutura de pastas

```
src/
├── app/                      # Camada de ENTRADA: rotas, páginas, route handlers, server actions.
│                             # Fina de propósito — só orquestra, não contém regra de negócio.
├── modules/                  # Domínios de negócio, cada um em uma "fatia vertical" isolada.
│   └── <modulo>/
│       ├── domain/           # Entidades, value objects, regras puras. ZERO dependência externa.
│       ├── application/      # Casos de uso (o que o sistema faz). Orquestra o domínio.
│       │                     # Depende de INTERFACES de repositório, nunca de implementações.
│       └── infrastructure/   # Implementações concretas: repositórios Drizzle, integrações.
├── shared/                   # Código transversal usado por vários módulos.
│   ├── domain/               # Primitivas base: Entity, Result, AppError, TenantContext.
│   ├── infrastructure/       # Clientes de infra (db, auth) escondidos atrás de interfaces.
│   └── ui/                   # Componentes de UI reusáveis (shadcn) e layout.
└── db/                       # Schema Drizzle, migrations e client do banco.
```

## Regra de dependência (o coração da Clean Architecture)

As dependências apontam **sempre para dentro**:

```
app  ──▶  application  ──▶  domain
 │             │
 └──▶ infrastructure ──▶ (implementa interfaces do domain/application)
```

- `domain` não importa nada de fora (nem Next, nem Drizzle, nem Clerk).
- `application` depende só de `domain` e de **interfaces** (ex.: `CustomerRepository`).
- `infrastructure` implementa essas interfaces (ex.: `DrizzleCustomerRepository`).
- `app` (Next) monta tudo e chama os casos de uso.

**Por quê:** trocar banco, auth ou framework não deve exigir reescrever regra de
negócio. Testar um caso de uso não deve exigir subir um banco real.

## Multi-tenancy (crítico)

Hierarquia: **Empresa (tenant) → Filial (branch) → Dados operacionais**.

- Todo caso de uso que toca dados recebe um `TenantContext` (ver `shared/domain`).
- Toda tabela de dados de tenant tem coluna `tenant_id`.
- Além do filtro na aplicação, o **Postgres RLS** recusa vazar dados entre
  empresas mesmo que um bug esqueça o `WHERE tenant_id = ...` (defesa em profundidade).

## Tratamento de erros

- Falhas de negócio esperadas → `AppError` + `Result<T>` (sem exceção vazando).
- Bugs inesperados → exceção comum, capturada na borda (route handler) e logada.

## Convenções

- Import alias: `@/*` → `src/*` (ex.: `import { Result } from "@/shared/domain"`).
- Um módulo = uma pasta em `src/modules/`. Abrir a pasta = entender o domínio inteiro.
- Nada de regra de negócio dentro de `app/` ou de componentes React.
