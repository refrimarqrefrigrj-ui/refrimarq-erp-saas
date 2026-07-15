import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  bigint,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Schema do banco (fonte da verdade). O Drizzle Kit gera as migrations a
 * partir daqui. Ver docs/ARCHITECTURE.md → Multi-tenancy.
 */

/** Empresa cliente do SaaS = TENANT. */
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

/** Usuário do sistema. Pertence a uma empresa (tenant). */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Filial de uma empresa. */
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

/**
 * Cliente da empresa (pessoa física ou jurídica). Dados de tenant (RLS).
 * Endereços e contatos ficam em tabelas próprias (1..N).
 */
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "pf" | "pj"
  name: text("name").notNull(),
  document: text("document"),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Endereço de um cliente (um cliente pode ter vários). */
export const customerAddresses = pgTable("customer_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  label: text("label"), // ex.: "Residencial", "Comercial", "Obra"
  zipCode: text("zip_code"),
  street: text("street"),
  number: text("number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Contato de um cliente (um cliente pode ter vários). */
export const customerContacts = pgTable("customer_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"), // ex.: "Gerente", "Financeiro", "Zelador"
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Equipamento de ar-condicionado, vinculado a um cliente. Dados de tenant (RLS).
 */
export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  brand: text("brand"), // marca
  model: text("model"), // modelo
  kind: text("kind"), // tipo: split, janela, cassete, piso-teto, multi-split
  btus: integer("btus"), // capacidade
  serialNumber: text("serial_number"), // número de série
  location: text("location"), // ambiente onde está instalado
  installedAt: date("installed_at", { mode: "string" }), // data de instalação
  warrantyUntil: date("warranty_until", { mode: "string" }), // garantia até
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Obra corporativa: projeto (ex.: instalação) para um cliente, com valor de
 * contrato e acompanhamento de status. Dados de tenant (RLS).
 * Valor guardado em CENTAVOS (inteiro) para não usar ponto flutuante em dinheiro.
 */
export const obras = pgTable("obras", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  // proposta | em_andamento | concluida | cancelada
  status: text("status").notNull().default("proposta"),
  valueCents: bigint("value_cents", { mode: "number" }).notNull().default(0),
  location: text("location"),
  startDate: date("start_date", { mode: "string" }),
  expectedEndDate: date("expected_end_date", { mode: "string" }),
  endedAt: date("ended_at", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Lançamento financeiro (conta a receber ou a pagar). Dados de tenant (RLS).
 * Valor em CENTAVOS (inteiro). Vínculos opcionais com cliente e obra.
 */
export const financeTransactions = pgTable("finance_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  // "receivable" (a receber) | "payable" (a pagar)
  direction: text("direction").notNull(),
  description: text("description").notNull(),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull().default(0),
  // "pending" | "paid"
  status: text("status").notNull().default("pending"),
  dueDate: date("due_date", { mode: "string" }), // vencimento
  paidDate: date("paid_date", { mode: "string" }),
  category: text("category"), // categoria / centro de custo
  // Vínculos opcionais (mantêm o lançamento se o vínculo for removido).
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  obraId: uuid("obra_id").references(() => obras.id, { onDelete: "set null" }),
  notes: text("notes"),
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
export type CustomerRow = typeof customers.$inferSelect;
export type NewCustomerRow = typeof customers.$inferInsert;
export type CustomerAddressRow = typeof customerAddresses.$inferSelect;
export type NewCustomerAddressRow = typeof customerAddresses.$inferInsert;
export type CustomerContactRow = typeof customerContacts.$inferSelect;
export type NewCustomerContactRow = typeof customerContacts.$inferInsert;
export type EquipmentRow = typeof equipment.$inferSelect;
export type NewEquipmentRow = typeof equipment.$inferInsert;
export type ObraRow = typeof obras.$inferSelect;
export type NewObraRow = typeof obras.$inferInsert;
export type FinanceTransactionRow = typeof financeTransactions.$inferSelect;
export type NewFinanceTransactionRow = typeof financeTransactions.$inferInsert;
