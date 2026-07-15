-- RLS da tabela equipment (mesmo padrão de customers).
ALTER TABLE "equipment" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "equipment" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "equipment_tenant_isolation" ON "equipment"
  USING ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
  WITH CHECK ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid);--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "equipment" TO app_tenant;
