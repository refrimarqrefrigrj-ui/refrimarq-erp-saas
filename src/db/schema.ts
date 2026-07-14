import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Schema do banco (fonte da verdade). O Drizzle Kit gera as migrations a
 * partir daqui. Ver docs/ARCHITECTURE.md → Multi-tenancy.
 *
 * Colunas de auditoria padrão (created_at/updated_at) em todas as tabelas.
 */

/**
 * Empresa cliente do SaaS = TENANT.
 * Espelha 1:1 uma "Organization" do Clerk — `clerk_org_id` é a ponte entre
 * a identidade (Clerk) e os dados de negócio (nosso banco).
 */
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ID da Organization no Clerk (fonte de verdade da identidade do tenant).
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Filial de uma empresa. Uma empresa tem 1..N filiais; a matriz é uma delas.
 * Dados operacionais futuros poderão ser associados a uma filial específica.
 */
export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  // tenant_id: a empresa dona desta filial.
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isHeadquarters: boolean("is_headquarters").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tipos inferidos para uso na aplicação (type-safe de ponta a ponta).
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
