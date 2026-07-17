-- RLS da tabela service_orders (mesmo padrão de customers).
ALTER TABLE "service_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_orders" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "service_orders_tenant_isolation" ON "service_orders"
  USING ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
  WITH CHECK ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid);--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "service_orders" TO app_tenant;
