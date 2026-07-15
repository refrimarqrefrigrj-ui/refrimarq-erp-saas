import type { TenantContext } from "@/shared/domain";
import type { CustomerRepository } from "./customer-repository";

/** Caso de uso: excluir um cliente (dentro do tenant). */
export async function deleteCustomer(
  repo: CustomerRepository,
  ctx: TenantContext,
  id: string,
): Promise<void> {
  await repo.delete(ctx, id);
}
