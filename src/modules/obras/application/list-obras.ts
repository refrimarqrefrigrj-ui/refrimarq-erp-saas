import type { TenantContext } from "@/shared/domain";
import type { ObraListItem } from "../domain/obra";
import type { ObraRepository } from "./obra-repository";

/** Caso de uso: listar obras (opcional: busca, status, cliente). */
export async function listObras(
  repo: ObraRepository,
  ctx: TenantContext,
  opts?: { search?: string; status?: string; customerId?: string },
): Promise<ObraListItem[]> {
  return repo.list(ctx, opts);
}
