import { ok, type Result, type TenantContext } from "@/shared/domain";
import { validateObra, type CreateObraInput, type Obra } from "../domain/obra";
import type { ObraRepository } from "./obra-repository";

/** Caso de uso: cadastrar uma obra. */
export async function createObra(
  repo: ObraRepository,
  ctx: TenantContext,
  input: CreateObraInput,
): Promise<Result<Obra>> {
  const validated = validateObra(input);
  if (!validated.ok) return validated;

  const obra = await repo.create(ctx, validated.value);
  return ok(obra);
}
