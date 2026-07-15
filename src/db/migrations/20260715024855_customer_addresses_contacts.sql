CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"label" text,
	"zip_code" text,
	"street" text,
	"number" text,
	"complement" text,
	"neighborhood" text,
	"city" text,
	"state" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"email" text,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Migra o endereço inline existente de cada cliente para a nova tabela (como principal).
INSERT INTO "customer_addresses" ("company_id", "customer_id", "label", "zip_code", "street", "number", "complement", "neighborhood", "city", "state", "is_primary")
SELECT "company_id", "id", 'Principal', "zip_code", "street", "number", "complement", "neighborhood", "city", "state", true
FROM "customers"
WHERE coalesce("street", '') <> '' OR coalesce("city", '') <> '' OR coalesce("zip_code", '') <> '';--> statement-breakpoint

ALTER TABLE "customers" DROP COLUMN "zip_code";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "street";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "number";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "complement";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "neighborhood";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "state";--> statement-breakpoint

-- RLS das novas tabelas de tenant (mesmo padrão de customers).
ALTER TABLE "customer_addresses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customer_addresses" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "customer_addresses_tenant_isolation" ON "customer_addresses"
  USING ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
  WITH CHECK ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid);--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "customer_addresses" TO app_tenant;--> statement-breakpoint

ALTER TABLE "customer_contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customer_contacts" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "customer_contacts_tenant_isolation" ON "customer_contacts"
  USING ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
  WITH CHECK ("company_id" = NULLIF(current_setting('app.current_company_id', true), '')::uuid);--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "customer_contacts" TO app_tenant;
