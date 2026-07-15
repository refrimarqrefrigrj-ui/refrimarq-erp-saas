import type { TenantContext } from "@/shared/domain";
import type {
  Equipment,
  EquipmentListItem,
  NormalizedEquipment,
} from "../domain/equipment";

/**
 * Porta de persistência de equipamentos. Operações restritas ao tenant.
 */
export interface EquipmentRepository {
  create(ctx: TenantContext, data: NormalizedEquipment): Promise<Equipment>;
  list(
    ctx: TenantContext,
    opts?: { search?: string; customerId?: string },
  ): Promise<EquipmentListItem[]>;
  getById(ctx: TenantContext, id: string): Promise<Equipment | null>;
  update(
    ctx: TenantContext,
    id: string,
    data: NormalizedEquipment,
  ): Promise<Equipment | null>;
  delete(ctx: TenantContext, id: string): Promise<void>;
}
