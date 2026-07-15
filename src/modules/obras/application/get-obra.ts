import type { TenantContext } from "@/shared/domain";
import type { Obra } from "../domain/obra";
import type { ObraRepository } from "./obra-repository";

/** Caso de uso: buscar uma obra por id (dentro do tenant). */
export async function getObra(
  repo: ObraRepository,
  ctx: TenantContext,
  id: string,
): Promise<Obra | null> {
  return repo.getById(ctx, id);
}
