import { ok, type Result, type TenantContext } from "@/shared/domain";
import {
  validateNewCustomer,
  type CreateCustomerInput,
  type Customer,
} from "../domain/customer";
import type { CustomerRepository } from "./customer-repository";

/**
 * Caso de uso: cadastrar um cliente. Valida a regra de negócio (domínio) e,
 * se ok, persiste via repositório — sempre no escopo do tenant.
 */
export async function createCustomer(
  repo: CustomerRepository,
  ctx: TenantContext,
  input: CreateCustomerInput,
): Promise<Result<Customer>> {
  const validated = validateNewCustomer(input);
  if (!validated.ok) return validated;

  const customer = await repo.create(ctx, validated.value);
  return ok(customer);
}
