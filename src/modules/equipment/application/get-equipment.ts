import type { TenantContext } from "@/shared/domain";
import type { Equipment } from "../domain/equipment";
import type { EquipmentRepository } from "./equipment-repository";

/** Caso de uso: buscar um equipamento por id (dentro do tenant). */
export async function getEquipment(
  repo: EquipmentRepository,
  ctx: TenantContext,
  id: string,
): Promise<Equipment | null> {
  return repo.getById(ctx, id);
}
