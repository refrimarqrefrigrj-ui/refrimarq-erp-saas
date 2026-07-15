import type { TenantContext } from "@/shared/domain";
import type { TransactionListItem } from "../domain/transaction";
import type { TransactionRepository } from "./transaction-repository";

/** Caso de uso: listar lançamentos (opcional: direção, status, busca). */
export async function listTransactions(
  repo: TransactionRepository,
  ctx: TenantContext,
  opts?: { direction?: string; status?: string; search?: string },
): Promise<TransactionListItem[]> {
  return repo.list(ctx, opts);
}
