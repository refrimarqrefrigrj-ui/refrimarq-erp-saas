import { desc, eq, ilike, or } from "drizzle-orm";

import { customers, type CustomerRow } from "@/db/schema";
import { withTenant } from "@/db/tenant";
import type { TenantContext } from "@/shared/domain";
import type { CustomerRepository } from "../application/customer-repository";
import type { Customer, CreateCustomerInput } from "../domain/customer";

/** Converte a linha do banco para o modelo de domínio. */
function toDomain(row: CustomerRow): Customer {
  return {
    id: row.id,
    type: row.type as Customer["type"],
    name: row.name,
    document: row.document,
    email: row.email,
    phone: row.phone,
    zipCode: row.zipCode,
    street: row.street,
    number: row.number,
    complement: row.complement,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

/** Campos gravados a partir da entrada validada (create/update). */
function toValues(data: CreateCustomerInput) {
  return {
    type: data.type,
    name: data.name,
    document: data.document ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    zipCode: data.zipCode ?? null,
    street: data.street ?? null,
    number: data.number ?? null,
    complement: data.complement ?? null,
    neighborhood: data.neighborhood ?? null,
    city: data.city ?? null,
    state: data.state ?? null,
    notes: data.notes ?? null,
  };
}

/**
 * Implementação Drizzle do CustomerRepository.
 *
 * Todo acesso passa por `withTenant`, que assume o papel restrito e define a
 * empresa ativa — o RLS então garante o isolamento por tenant no banco. As
 * operações por id (buscar/editar/excluir) também ficam automaticamente
 * restritas à empresa da sessão.
 */
export const drizzleCustomerRepository: CustomerRepository = {
  async create(ctx: TenantContext, data: CreateCustomerInput): Promise<Customer> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .insert(customers)
        .values({ companyId: ctx.tenantId, ...toValues(data) })
        .returning();
      return toDomain(row);
    });
  },

  async list(
    ctx: TenantContext,
    opts?: { search?: string },
  ): Promise<Customer[]> {
    return withTenant(ctx.tenantId, async (tx) => {
      const search = opts?.search?.trim();
      const rows = await tx
        .select()
        .from(customers)
        .where(
          search
            ? or(
                ilike(customers.name, `%${search}%`),
                ilike(customers.document, `%${search}%`),
              )
            : undefined,
        )
        .orderBy(desc(customers.createdAt))
        .limit(200);
      return rows.map(toDomain);
    });
  },

  async getById(ctx: TenantContext, id: string): Promise<Customer | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .select()
        .from(customers)
        .where(eq(customers.id, id))
        .limit(1);
      return row ? toDomain(row) : null;
    });
  },

  async update(
    ctx: TenantContext,
    id: string,
    data: CreateCustomerInput,
  ): Promise<Customer | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .update(customers)
        .set({ ...toValues(data), updatedAt: new Date() })
        .where(eq(customers.id, id))
        .returning();
      return row ? toDomain(row) : null;
    });
  },

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await withTenant(ctx.tenantId, async (tx) => {
      await tx.delete(customers).where(eq(customers.id, id));
    });
  },
};
