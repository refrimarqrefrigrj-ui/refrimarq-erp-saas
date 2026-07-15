import { and, desc, eq, ilike, or } from "drizzle-orm";

import { customers, equipment, type EquipmentRow } from "@/db/schema";
import { withTenant } from "@/db/tenant";
import type { TenantContext } from "@/shared/domain";
import type { EquipmentRepository } from "../application/equipment-repository";
import type {
  Equipment,
  EquipmentListItem,
  NormalizedEquipment,
} from "../domain/equipment";

function toDomain(row: EquipmentRow): Equipment {
  return {
    id: row.id,
    customerId: row.customerId,
    brand: row.brand,
    model: row.model,
    kind: row.kind,
    btus: row.btus,
    serialNumber: row.serialNumber,
    location: row.location,
    installedAt: row.installedAt,
    warrantyUntil: row.warrantyUntil,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

function toValues(data: NormalizedEquipment) {
  return {
    customerId: data.customerId,
    brand: data.brand,
    model: data.model,
    kind: data.kind,
    btus: data.btus,
    serialNumber: data.serialNumber,
    location: data.location,
    installedAt: data.installedAt,
    warrantyUntil: data.warrantyUntil,
    notes: data.notes,
  };
}

export const drizzleEquipmentRepository: EquipmentRepository = {
  async create(
    ctx: TenantContext,
    data: NormalizedEquipment,
  ): Promise<Equipment> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .insert(equipment)
        .values({ companyId: ctx.tenantId, ...toValues(data) })
        .returning();
      return toDomain(row);
    });
  },

  async list(
    ctx: TenantContext,
    opts?: { search?: string; customerId?: string },
  ): Promise<EquipmentListItem[]> {
    return withTenant(ctx.tenantId, async (tx) => {
      const search = opts?.search?.trim();
      const conds = [];
      if (search) {
        conds.push(
          or(
            ilike(equipment.brand, `%${search}%`),
            ilike(equipment.model, `%${search}%`),
            ilike(equipment.serialNumber, `%${search}%`),
          ),
        );
      }
      if (opts?.customerId) {
        conds.push(eq(equipment.customerId, opts.customerId));
      }

      const rows = await tx
        .select({
          id: equipment.id,
          customerId: equipment.customerId,
          customerName: customers.name,
          brand: equipment.brand,
          model: equipment.model,
          kind: equipment.kind,
          btus: equipment.btus,
          location: equipment.location,
        })
        .from(equipment)
        .innerJoin(customers, eq(customers.id, equipment.customerId))
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(equipment.createdAt))
        .limit(200);

      return rows;
    });
  },

  async getById(ctx: TenantContext, id: string): Promise<Equipment | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .select()
        .from(equipment)
        .where(eq(equipment.id, id))
        .limit(1);
      return row ? toDomain(row) : null;
    });
  },

  async update(
    ctx: TenantContext,
    id: string,
    data: NormalizedEquipment,
  ): Promise<Equipment | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .update(equipment)
        .set({ ...toValues(data), updatedAt: new Date() })
        .where(eq(equipment.id, id))
        .returning();
      return row ? toDomain(row) : null;
    });
  },

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await withTenant(ctx.tenantId, async (tx) => {
      await tx.delete(equipment).where(eq(equipment.id, id));
    });
  },
};
