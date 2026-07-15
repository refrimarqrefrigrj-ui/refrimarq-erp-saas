import type { TenantContext } from "@/shared/domain";
import type { EquipmentListItem } from "../domain/equipment";
import type { EquipmentRepository } from "./equipment-repository";

/** Caso de uso: listar equipamentos (opcional: busca e/ou por cliente). */
export async function listEquipment(
  repo: EquipmentRepository,
  ctx: TenantContext,
  opts?: { search?: string; customerId?: string },
): Promise<EquipmentListItem[]> {
  return repo.list(ctx, opts);
}
