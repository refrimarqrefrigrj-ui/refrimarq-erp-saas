# Banco de dados

- **Postgres** (Neon, serverless) acessado via **Drizzle ORM**.
- `schema.ts` — definição das tabelas (fonte da verdade do schema).
- `migrations/` — migrations versionadas geradas pelo Drizzle Kit.
- `index.ts` — client do Drizzle (a ser criado ao conectar o Neon).

Toda tabela de dados de tenant carrega `tenant_id` e é protegida por
Row Level Security. Ver `docs/ARCHITECTURE.md` → seção Multi-tenancy.
