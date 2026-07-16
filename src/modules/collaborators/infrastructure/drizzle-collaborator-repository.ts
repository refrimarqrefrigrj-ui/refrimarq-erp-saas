import { asc, eq, ilike } from "drizzle-orm";

import { collaborators, type CollaboratorRow } from "@/db/schema";
import { withTenant } from "@/db/tenant";
import type { TenantContext } from "@/shared/domain";
import type { CollaboratorRepository } from "../application/collaborator-repository";
import type {
  Collaborator,
  NormalizedCollaborator,
} from "../domain/collaborator";

function toDomain(row: CollaboratorRow): Collaborator {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    active: row.active,
    createdAt: row.createdAt,
  };
}

export const drizzleCollaboratorRepository: CollaboratorRepository = {
  async create(
    ctx: TenantContext,
    data: NormalizedCollaborator,
  ): Promise<Collaborator> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .insert(collaborators)
        .values({ companyId: ctx.tenantId, ...data })
        .returning();
      return toDomain(row);
    });
  },

  async list(
    ctx: TenantContext,
    opts?: { search?: string },
  ): Promise<Collaborator[]> {
    return withTenant(ctx.tenantId, async (tx) => {
      const search = opts?.search?.trim();
      const rows = await tx
        .select()
        .from(collaborators)
        .where(search ? ilike(collaborators.name, `%${search}%`) : undefined)
        .orderBy(asc(collaborators.name));
      return rows.map(toDomain);
    });
  },

  async getById(ctx: TenantContext, id: string): Promise<Collaborator | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .select()
        .from(collaborators)
        .where(eq(collaborators.id, id))
        .limit(1);
      return row ? toDomain(row) : null;
    });
  },

  async update(
    ctx: TenantContext,
    id: string,
    data: NormalizedCollaborator,
  ): Promise<Collaborator | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .update(collaborators)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(collaborators.id, id))
        .returning();
      return row ? toDomain(row) : null;
    });
  },

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await withTenant(ctx.tenantId, async (tx) => {
      await tx.delete(collaborators).where(eq(collaborators.id, id));
    });
  },

  async setActive(
    ctx: TenantContext,
    id: string,
    active: boolean,
  ): Promise<void> {
    await withTenant(ctx.tenantId, async (tx) => {
      await tx
        .update(collaborators)
        .set({ active, updatedAt: new Date() })
        .where(eq(collaborators.id, id));
    });
  },
};
