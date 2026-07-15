-- RLS da tabela obras (mesmo padrão de customers).
ALTER TABLE "obras" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "obras" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "obras_tenant_isolation" ON "obras"
  USING ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
  WITH CHECK ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid);--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "obras" TO app_tenant;
