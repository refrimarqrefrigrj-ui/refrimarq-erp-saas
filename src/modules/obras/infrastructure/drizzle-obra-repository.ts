import { and, desc, eq, ilike } from "drizzle-orm";

import { customers, obras, type ObraRow } from "@/db/schema";
import { withTenant } from "@/db/tenant";
import type { TenantContext } from "@/shared/domain";
import type { ObraRepository } from "../application/obra-repository";
import type {
  NormalizedObra,
  Obra,
  ObraListItem,
  ObraStatus,
} from "../domain/obra";

function toDomain(row: ObraRow): Obra {
  return {
    id: row.id,
    customerId: row.customerId,
    title: row.title,
    description: row.description,
    status: row.status as ObraStatus,
    valueCents: row.valueCents,
    location: row.location,
    startDate: row.startDate,
    expectedEndDate: row.expectedEndDate,
    endedAt: row.endedAt,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

function toValues(data: NormalizedObra) {
  return {
    customerId: data.customerId,
    title: data.title,
    description: data.description,
    status: data.status,
    valueCents: data.valueCents,
    location: data.location,
    startDate: data.startDate,
    expectedEndDate: data.expectedEndDate,
    endedAt: data.endedAt,
    notes: data.notes,
  };
}

export const drizzleObraRepository: ObraRepository = {
  async create(ctx: TenantContext, data: NormalizedObra): Promise<Obra> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .insert(obras)
        .values({ companyId: ctx.tenantId, ...toValues(data) })
        .returning();
      return toDomain(row);
    });
  },

  async list(
    ctx: TenantContext,
    opts?: { search?: string; status?: string; customerId?: string },
  ): Promise<ObraListItem[]> {
    return withTenant(ctx.tenantId, async (tx) => {
      const conds = [];
      const search = opts?.search?.trim();
      if (search) conds.push(ilike(obras.title, `%${search}%`));
      if (opts?.status) conds.push(eq(obras.status, opts.status));
      if (opts?.customerId) conds.push(eq(obras.customerId, opts.customerId));

      const rows = await tx
        .select({
          id: obras.id,
          customerId: obras.customerId,
          customerName: customers.name,
          title: obras.title,
          status: obras.status,
          valueCents: obras.valueCents,
          startDate: obras.startDate,
          expectedEndDate: obras.expectedEndDate,
        })
        .from(obras)
        .innerJoin(customers, eq(customers.id, obras.customerId))
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(obras.createdAt))
        .limit(200);

      return rows.map((r) => ({ ...r, status: r.status as ObraStatus }));
    });
  },

  async getById(ctx: TenantContext, id: string): Promise<Obra | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .select()
        .from(obras)
        .where(eq(obras.id, id))
        .limit(1);
      return row ? toDomain(row) : null;
    });
  },

  async update(
    ctx: TenantContext,
    id: string,
    data: NormalizedObra,
  ): Promise<Obra | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .update(obras)
        .set({ ...toValues(data), updatedAt: new Date() })
        .where(eq(obras.id, id))
        .returning();
      return row ? toDomain(row) : null;
    });
  },

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await withTenant(ctx.tenantId, async (tx) => {
      await tx.delete(obras).where(eq(obras.id, id));
    });
  },
};
