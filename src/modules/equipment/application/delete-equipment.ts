import type { TenantContext } from "@/shared/domain";
import type { EquipmentRepository } from "./equipment-repository";

/** Caso de uso: excluir um equipamento. */
export async function deleteEquipment(
  repo: EquipmentRepository,
  ctx: TenantContext,
  id: string,
): Promise<void> {
  await repo.delete(ctx, id);
}
