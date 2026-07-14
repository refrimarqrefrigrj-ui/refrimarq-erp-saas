@AGENTS.md

# ERP HVAC — guia do projeto

SaaS multi-tenant (ERP para empresas de Ar-Condicionado no Brasil).
Antes de codar, leia `docs/ARCHITECTURE.md` — ele manda nas decisões estruturais.

## Regras inegociáveis

- **Clean Architecture:** a regra de dependência aponta para dentro
  (`app → application → domain`; `infrastructure` implementa interfaces).
  Nunca coloque regra de negócio em `app/` ou em componentes React.
- **Multi-tenancy:** todo caso de uso que toca dados recebe `TenantContext`
  (`src/shared/domain`). Toda tabela de tenant tem `tenant_id` + RLS.
- **Erros:** falha de negócio → `AppError` + `Result<T>` (sem exceção vazando);
  bug inesperado → exceção, tratada na borda.
- **Next.js 16:** tem breaking changes. Consulte `node_modules/next/dist/docs/`
  antes de usar APIs de framework (route handlers, proxy/middleware, etc.).

## Convenções

- Alias de import: `@/*` → `src/*`.
- Um módulo por pasta em `src/modules/<modulo>/{domain,application,infrastructure}`.
- Português nos comentários e na UI; inglês nos nomes de código.

## Estado atual

Módulo 0 (Fundação) em andamento. Ver `docs/ARCHITECTURE.md` para o roadmap.
