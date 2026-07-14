import { desc, ilike, or } from "drizzle-orm";

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

/**
 * Implementação Drizzle do CustomerRepository.
 *
 * Todo acesso passa por `withTenant`, que define a empresa ativa na sessão do
 * Postgres — o RLS então filtra/valida automaticamente por tenant. Ou seja: o
 * isolamento entre empresas é garantido pelo banco, não só pelo código.
 */
export const drizzleCustomerRepository: CustomerRepository = {
  async create(ctx: TenantContext, data: CreateCustomerInput): Promise<Customer> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .insert(customers)
        .values({
          companyId: ctx.tenantId,
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
        })
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
};
