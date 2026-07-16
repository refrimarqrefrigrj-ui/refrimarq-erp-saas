-- RLS da tabela collaborators (mesmo padrão de customers).
ALTER TABLE "collaborators" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "collaborators" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "collaborators_tenant_isolation" ON "collaborators"
  USING ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
  WITH CHECK ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid);--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "collaborators" TO app_tenant;
