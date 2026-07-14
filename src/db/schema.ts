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
 */

/**
 * Empresa cliente do SaaS = TENANT.
 * Criada no cadastro; o usuário que a cria é o dono (role "admin").
 */
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Usuário do sistema. Pertence a uma empresa (tenant). A senha é guardada
 * apenas como hash (bcrypt) — nunca em texto puro.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // tenant_id: a empresa a que o usuário pertence.
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // Papel para o RBAC: admin (dono), staff (equipe), technician (técnico).
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Filial de uma empresa. Uma empresa tem 1..N filiais; a matriz é uma delas.
 */
export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
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
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
