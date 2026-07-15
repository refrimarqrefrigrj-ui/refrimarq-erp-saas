import { ok, type Result, type TenantContext } from "@/shared/domain";
import {
  validateEquipment,
  type CreateEquipmentInput,
  type Equipment,
} from "../domain/equipment";
import type { EquipmentRepository } from "./equipment-repository";

/** Caso de uso: cadastrar um equipamento. */
export async function createEquipment(
  repo: EquipmentRepository,
  ctx: TenantContext,
  input: CreateEquipmentInput,
): Promise<Result<Equipment>> {
  const validated = validateEquipment(input);
  if (!validated.ok) return validated;

  const equipment = await repo.create(ctx, validated.value);
  return ok(equipment);
}
