import type { TenantContext } from "@/shared/domain";
import type { ObraRepository } from "./obra-repository";

/** Caso de uso: excluir uma obra. */
export async function deleteObra(
  repo: ObraRepository,
  ctx: TenantContext,
  id: string,
): Promise<void> {
  await repo.delete(ctx, id);
}
