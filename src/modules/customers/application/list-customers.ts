import type { TenantContext } from "@/shared/domain";
import type { Customer } from "../domain/customer";
import type { CustomerRepository } from "./customer-repository";

/**
 * Caso de uso: listar clientes da empresa (opcionalmente filtrando por busca).
 */
export async function listCustomers(
  repo: CustomerRepository,
  ctx: TenantContext,
  opts?: { search?: string },
): Promise<Customer[]> {
  return repo.list(ctx, opts);
}
