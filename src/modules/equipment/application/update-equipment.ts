import {
  fail,
  NotFoundError,
  ok,
  type Result,
  type TenantContext,
} from "@/shared/domain";
import {
  validateEquipment,
  type CreateEquipmentInput,
  type Equipment,
} from "../domain/equipment";
import type { EquipmentRepository } from "./equipment-repository";

/** Caso de uso: atualizar um equipamento. */
export async function updateEquipment(
  repo: EquipmentRepository,
  ctx: TenantContext,
  id: string,
  input: CreateEquipmentInput,
): Promise<Result<Equipment>> {
  const validated = validateEquipment(input);
  if (!validated.ok) return validated;

  const updated = await repo.update(ctx, id, validated.value);
  if (!updated) {
    return fail(new NotFoundError("Equipamento não encontrado."));
  }
  return ok(updated);
}
