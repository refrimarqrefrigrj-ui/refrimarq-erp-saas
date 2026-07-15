import {
  fail,
  NotFoundError,
  ok,
  type Result,
  type TenantContext,
} from "@/shared/domain";
import { validateObra, type CreateObraInput, type Obra } from "../domain/obra";
import type { ObraRepository } from "./obra-repository";

/** Caso de uso: atualizar uma obra. */
export async function updateObra(
  repo: ObraRepository,
  ctx: TenantContext,
  id: string,
  input: CreateObraInput,
): Promise<Result<Obra>> {
  const validated = validateObra(input);
  if (!validated.ok) return validated;

  const updated = await repo.update(ctx, id, validated.value);
  if (!updated) {
    return fail(new NotFoundError("Obra não encontrada."));
  }
  return ok(updated);
}
