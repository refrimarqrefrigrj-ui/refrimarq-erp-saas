import type { TenantContext } from "@/shared/domain";
import type { FinanceSummary, TransactionRepository } from "./transaction-repository";

/** Caso de uso: excluir um lançamento. */
export async function deleteTransaction(
  repo: TransactionRepository,
  ctx: TenantContext,
  id: string,
): Promise<void> {
  await repo.delete(ctx, id);
}

/** Caso de uso: dar baixa (marcar como pago/recebido). */
export async function markTransactionPaid(
  repo: TransactionRepository,
  ctx: TenantContext,
  id: string,
): Promise<void> {
  await repo.markPaid(ctx, id);
}

/** Caso de uso: totais para o dashboard financeiro. */
export async function getFinanceSummary(
  repo: TransactionRepository,
  ctx: TenantContext,
): Promise<FinanceSummary> {
  return repo.summary(ctx);
}
