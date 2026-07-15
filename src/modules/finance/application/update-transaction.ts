import {
  fail,
  NotFoundError,
  ok,
  type Result,
  type TenantContext,
} from "@/shared/domain";
import {
  validateTransaction,
  type CreateTransactionInput,
  type FinanceTransaction,
} from "../domain/transaction";
import type { TransactionRepository } from "./transaction-repository";

/** Caso de uso: atualizar um lançamento. */
export async function updateTransaction(
  repo: TransactionRepository,
  ctx: TenantContext,
  id: string,
  input: CreateTransactionInput,
): Promise<Result<FinanceTransaction>> {
  const validated = validateTransaction(input);
  if (!validated.ok) return validated;

  const updated = await repo.update(ctx, id, validated.value);
  if (!updated) {
    return fail(new NotFoundError("Lançamento não encontrado."));
  }
  return ok(updated);
}
