-- Papel de aplicação SEM privilégio de bypass de RLS.
--
-- O papel dono da conexão (neondb_owner) tem BYPASSRLS e ignora as políticas.
-- Por isso o acesso a dados de tenant é feito assumindo este papel restrito
-- (SET LOCAL ROLE app_tenant, dentro de withTenant): aí o RLS passa a valer.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_tenant') THEN
    CREATE ROLE app_tenant NOLOGIN NOBYPASSRLS;
  END IF;
  -- Permite que a conexão atual (dona) assuma o papel restrito.
  EXECUTE format('GRANT app_tenant TO %I', current_user);
END $$;--> statement-breakpoint

GRANT USAGE ON SCHEMA public TO app_tenant;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "customers" TO app_tenant;
