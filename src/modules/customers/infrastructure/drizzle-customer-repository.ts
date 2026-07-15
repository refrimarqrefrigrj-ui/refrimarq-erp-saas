import { and, asc, desc, eq, ilike, or } from "drizzle-orm";

import {
  customers,
  customerAddresses,
  customerContacts,
  type CustomerRow,
  type CustomerAddressRow,
  type CustomerContactRow,
} from "@/db/schema";
import { withTenant, type TenantDb } from "@/db/tenant";
import type { TenantContext } from "@/shared/domain";
import type { CustomerRepository } from "../application/customer-repository";
import type {
  Customer,
  CustomerAddress,
  CustomerContact,
  CustomerListItem,
  CustomerType,
  NormalizedCustomer,
} from "../domain/customer";

function addrToDomain(r: CustomerAddressRow): CustomerAddress {
  return {
    id: r.id,
    label: r.label,
    zipCode: r.zipCode,
    street: r.street,
    number: r.number,
    complement: r.complement,
    neighborhood: r.neighborhood,
    city: r.city,
    state: r.state,
    isPrimary: r.isPrimary,
  };
}

function contactToDomain(r: CustomerContactRow): CustomerContact {
  return { id: r.id, name: r.name, role: r.role, email: r.email, phone: r.phone };
}

function customerToDomain(
  row: CustomerRow,
  addresses: CustomerAddress[],
  contacts: CustomerContact[],
): Customer {
  return {
    id: row.id,
    type: row.type as CustomerType,
    name: row.name,
    document: row.document,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    addresses,
    contacts,
    createdAt: row.createdAt,
  };
}

/** Carrega um cliente completo (com endereços e contatos). */
async function loadCustomer(tx: TenantDb, id: string): Promise<Customer | null> {
  const [row] = await tx
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  if (!row) return null;

  const addrs = await tx
    .select()
    .from(customerAddresses)
    .where(eq(customerAddresses.customerId, id))
    .orderBy(desc(customerAddresses.isPrimary), asc(customerAddresses.createdAt));

  const cts = await tx
    .select()
    .from(customerContacts)
    .where(eq(customerContacts.customerId, id))
    .orderBy(asc(customerContacts.createdAt));

  return customerToDomain(row, addrs.map(addrToDomain), cts.map(contactToDomain));
}

/** Insere endereços e contatos de um cliente. */
async function writeChildren(
  tx: TenantDb,
  companyId: string,
  customerId: string,
  data: NormalizedCustomer,
) {
  if (data.addresses.length > 0) {
    await tx.insert(customerAddresses).values(
      data.addresses.map((a) => ({
        companyId,
        customerId,
        label: a.label,
        zipCode: a.zipCode,
        street: a.street,
        number: a.number,
        complement: a.complement,
        neighborhood: a.neighborhood,
        city: a.city,
        state: a.state,
        isPrimary: a.isPrimary,
      })),
    );
  }
  if (data.contacts.length > 0) {
    await tx.insert(customerContacts).values(
      data.contacts.map((c) => ({
        companyId,
        customerId,
        name: c.name,
        role: c.role,
        email: c.email,
        phone: c.phone,
      })),
    );
  }
}

export const drizzleCustomerRepository: CustomerRepository = {
  async create(ctx: TenantContext, data: NormalizedCustomer): Promise<Customer> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .insert(customers)
        .values({
          companyId: ctx.tenantId,
          type: data.type,
          name: data.name,
          document: data.document,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
        })
        .returning();
      await writeChildren(tx, ctx.tenantId, row.id, data);
      return (await loadCustomer(tx, row.id))!;
    });
  },

  async list(
    ctx: TenantContext,
    opts?: { search?: string },
  ): Promise<CustomerListItem[]> {
    return withTenant(ctx.tenantId, async (tx) => {
      const search = opts?.search?.trim();
      const rows = await tx
        .select({
          id: customers.id,
          type: customers.type,
          name: customers.name,
          document: customers.document,
          email: customers.email,
          phone: customers.phone,
          primaryCity: customerAddresses.city,
          primaryState: customerAddresses.state,
        })
        .from(customers)
        .leftJoin(
          customerAddresses,
          and(
            eq(customerAddresses.customerId, customers.id),
            eq(customerAddresses.isPrimary, true),
          ),
        )
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

      return rows.map((r) => ({
        id: r.id,
        type: r.type as CustomerType,
        name: r.name,
        document: r.document,
        email: r.email,
        phone: r.phone,
        primaryCity: r.primaryCity,
        primaryState: r.primaryState,
      }));
    });
  },

  async getById(ctx: TenantContext, id: string): Promise<Customer | null> {
    return withTenant(ctx.tenantId, async (tx) => loadCustomer(tx, id));
  },

  async update(
    ctx: TenantContext,
    id: string,
    data: NormalizedCustomer,
  ): Promise<Customer | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .update(customers)
        .set({
          type: data.type,
          name: data.name,
          document: data.document,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, id))
        .returning();
      if (!row) return null;

      // Substitui o conjunto de endereços e contatos.
      await tx.delete(customerAddresses).where(eq(customerAddresses.customerId, id));
      await tx.delete(customerContacts).where(eq(customerContacts.customerId, id));
      await writeChildren(tx, ctx.tenantId, id, data);

      return loadCustomer(tx, id);
    });
  },

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await withTenant(ctx.tenantId, async (tx) => {
      // Endereços/contatos somem por ON DELETE CASCADE.
      await tx.delete(customers).where(eq(customers.id, id));
    });
  },
};
