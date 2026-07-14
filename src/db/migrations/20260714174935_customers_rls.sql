-- Row Level Security (RLS) para a tabela de clientes.
--
-- Isolamento multi-tenant no nível do BANCO: mesmo que um bug esqueça o
-- filtro por empresa, o Postgres recusa devolver/gravar linhas de outra
-- empresa. O tenant ativo vem da variável de sessão `app.current_company_id`,
-- definida a cada operação pelo helper `withTenant` (src/db/tenant.ts).

-- Habilita o RLS. FORCE faz valer inclusive para o dono da tabela (que é o
-- papel usado pela nossa conexão) — sem isso, o dono ignoraria as políticas.
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customers" FORCE ROW LEVEL SECURITY;--> statement-breakpoint

-- Política única de isolamento por tenant (leitura e escrita).
-- current_setting(..., true) retorna NULL se a variável não estiver setada,
-- e a comparação com NULL não casa nenhuma linha (fail-closed).
CREATE POLICY "customers_tenant_isolation" ON "customers"
  USING ("company_id" = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK ("company_id" = current_setting('app.current_company_id', true)::uuid);