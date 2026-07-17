import { and, desc, eq, ilike, sql } from "drizzle-orm";

import {
  collaborators,
  customers,
  serviceOrders,
  type ServiceOrderRow,
} from "@/db/schema";
import { withTenant } from "@/db/tenant";
import type { TenantContext } from "@/shared/domain";
import type { ServiceOrderRepository } from "../application/service-order-repository";
import type {
  NormalizedServiceOrder,
  ServiceOrder,
  ServiceOrderListItem,
  ServiceOrderStatus,
  ServiceOrderType,
} from "../domain/service-order";

function toDomain(row: ServiceOrderRow): ServiceOrder {
  return {
    id: row.id,
    number: row.number,
    customerId: row.customerId,
    equipmentId: row.equipmentId,
    collaboratorId: row.collaboratorId,
    type: row.type as ServiceOrderType,
    status: row.status as ServiceOrderStatus,
    scheduledFor: row.scheduledFor,
    description: row.description,
    solution: row.solution,
    valueCents: row.valueCents,
    createdAt: row.createdAt,
  };
}

function toValues(data: NormalizedServiceOrder) {
  return {
    customerId: data.customerId,
    equipmentId: data.equipmentId,
    collaboratorId: data.collaboratorId,
    type: data.type,
    status: data.status,
    scheduledFor: data.scheduledFor,
    description: data.description,
    solution: data.solution,
    valueCents: data.valueCents,
    // Marca a data de conclusão quando a OS é concluída.
    closedAt: data.status === "concluida" ? new Date() : null,
  };
}

export const drizzleServiceOrderRepository: ServiceOrderRepository = {
  async create(
    ctx: TenantContext,
    data: NormalizedServiceOrder,
  ): Promise<ServiceOrder> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [{ maxNum }] = await tx
        .select({
          maxNum: sql<string>`coalesce(max(${serviceOrders.number}), 0)`,
        })
        .from(serviceOrders);
      const number = Number(maxNum) + 1;

      const [row] = await tx
        .insert(serviceOrders)
        .values({ companyId: ctx.tenantId, number, ...toValues(data) })
        .returning();
      return toDomain(row);
    });
  },

  async list(
    ctx: TenantContext,
    opts?: { status?: string; type?: string; search?: string },
  ): Promise<ServiceOrderListItem[]> {
    return withTenant(ctx.tenantId, async (tx) => {
      const conds = [];
      if (opts?.status) conds.push(eq(serviceOrders.status, opts.status));
      if (opts?.type) conds.push(eq(serviceOrders.type, opts.type));
      const search = opts?.search?.trim();
      if (search) conds.push(ilike(customers.name, `%${search}%`));

      const rows = await tx
        .select({
          id: serviceOrders.id,
          number: serviceOrders.number,
          customerName: customers.name,
          collaboratorName: collaborators.name,
          type: serviceOrders.type,
          status: serviceOrders.status,
          scheduledFor: serviceOrders.scheduledFor,
          valueCents: serviceOrders.valueCents,
          createdAt: serviceOrders.createdAt,
        })
        .from(serviceOrders)
        .innerJoin(customers, eq(customers.id, serviceOrders.customerId))
        .leftJoin(
          collaborators,
          eq(collaborators.id, serviceOrders.collaboratorId),
        )
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(serviceOrders.number))
        .limit(300);

      return rows.map((r) => ({
        ...r,
        type: r.type as ServiceOrderType,
        status: r.status as ServiceOrderStatus,
      }));
    });
  },

  async getById(ctx: TenantContext, id: string): Promise<ServiceOrder | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .select()
        .from(serviceOrders)
        .where(eq(serviceOrders.id, id))
        .limit(1);
      return row ? toDomain(row) : null;
    });
  },

  async update(
    ctx: TenantContext,
    id: string,
    data: NormalizedServiceOrder,
  ): Promise<ServiceOrder | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .update(serviceOrders)
        .set({ ...toValues(data), updatedAt: new Date() })
        .where(eq(serviceOrders.id, id))
        .returning();
      return row ? toDomain(row) : null;
    });
  },

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await withTenant(ctx.tenantId, async (tx) => {
      await tx.delete(serviceOrders).where(eq(serviceOrders.id, id));
    });
  },
};
