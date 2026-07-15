import type { TenantContext } from "@/shared/domain";
import type { Customer } from "../domain/customer";
import type { CustomerRepository } from "./customer-repository";

/** Caso de uso: buscar um cliente por id (dentro do tenant). */
export async function getCustomer(
  repo: CustomerRepository,
  ctx: TenantContext,
  id: string,
): Promise<Customer | null> {
  return repo.getById(ctx, id);
}
