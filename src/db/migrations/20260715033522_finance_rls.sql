-- RLS da tabela finance_transactions (mesmo padrão de customers).
ALTER TABLE "finance_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "finance_transactions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "finance_transactions_tenant_isolation" ON "finance_transactions"
  USING ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
  WITH CHECK ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid);--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "finance_transactions" TO app_tenant;
