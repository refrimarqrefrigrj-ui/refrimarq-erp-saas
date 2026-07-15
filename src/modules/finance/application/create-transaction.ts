import { ok, type Result, type TenantContext } from "@/shared/domain";
import {
  validateTransaction,
  type CreateTransactionInput,
  type FinanceTransaction,
} from "../domain/transaction";
import type { TransactionRepository } from "./transaction-repository";

/** Caso de uso: cadastrar um lançamento financeiro. */
export async function createTransaction(
  repo: TransactionRepository,
  ctx: TenantContext,
  input: CreateTransactionInput,
): Promise<Result<FinanceTransaction>> {
  const validated = validateTransaction(input);
  if (!validated.ok) return validated;

  const transaction = await repo.create(ctx, validated.value);
  return ok(transaction);
}
