-- Endurece a política de RLS: se a empresa da sessão não estiver definida
-- (string vazia), NULLIF a transforma em NULL e a comparação não casa nenhuma
-- linha — fail-closed limpo (0 linhas), sem erro de cast de uuid.
DROP POLICY IF EXISTS "customers_tenant_isolation" ON "customers";--> statement-breakpoint
CREATE POLICY "customers_tenant_isolation" ON "customers"
  USING ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
  WITH CHECK ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid);
