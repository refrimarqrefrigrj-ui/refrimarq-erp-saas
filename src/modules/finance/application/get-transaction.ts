import type { TenantContext } from "@/shared/domain";
import type { FinanceTransaction } from "../domain/transaction";
import type { TransactionRepository } from "./transaction-repository";

/** Caso de uso: buscar um lançamento por id (dentro do tenant). */
export async function getTransaction(
  repo: TransactionRepository,
  ctx: TenantContext,
  id: string,
): Promise<FinanceTransaction | null> {
  return repo.getById(ctx, id);
}
