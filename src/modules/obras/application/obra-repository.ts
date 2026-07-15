import type { TenantContext } from "@/shared/domain";
import type { NormalizedObra, Obra, ObraListItem } from "../domain/obra";

/** Porta de persistência de obras. Operações restritas ao tenant. */
export interface ObraRepository {
  create(ctx: TenantContext, data: NormalizedObra): Promise<Obra>;
  list(
    ctx: TenantContext,
    opts?: { search?: string; status?: string; customerId?: string },
  ): Promise<ObraListItem[]>;
  getById(ctx: TenantContext, id: string): Promise<Obra | null>;
  update(
    ctx: TenantContext,
    id: string,
    data: NormalizedObra,
  ): Promise<Obra | null>;
  delete(ctx: TenantContext, id: string): Promise<void>;
}
