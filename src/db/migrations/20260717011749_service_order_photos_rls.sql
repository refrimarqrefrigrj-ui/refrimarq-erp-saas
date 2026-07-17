-- RLS da tabela service_order_photos (mesmo padrão de customers).
ALTER TABLE "service_order_photos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "service_order_photos" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "service_order_photos_tenant_isolation" ON "service_order_photos"
  USING ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
  WITH CHECK ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid);--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "service_order_photos" TO app_tenant;
