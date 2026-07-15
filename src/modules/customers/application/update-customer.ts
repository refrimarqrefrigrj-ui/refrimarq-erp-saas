import {
  fail,
  NotFoundError,
  ok,
  type Result,
  type TenantContext,
} from "@/shared/domain";
import {
  validateNewCustomer,
  type CreateCustomerInput,
  type Customer,
} from "../domain/customer";
import type { CustomerRepository } from "./customer-repository";

/** Caso de uso: atualizar um cliente existente (com validação de domínio). */
export async function updateCustomer(
  repo: CustomerRepository,
  ctx: TenantContext,
  id: string,
  input: CreateCustomerInput,
): Promise<Result<Customer>> {
  const validated = validateNewCustomer(input);
  if (!validated.ok) return validated;

  const updated = await repo.update(ctx, id, validated.value);
  if (!updated) {
    return fail(new NotFoundError("Cliente não encontrado."));
  }
  return ok(updated);
}
