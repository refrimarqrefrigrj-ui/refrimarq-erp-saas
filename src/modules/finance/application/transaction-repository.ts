import type { TenantContext } from "@/shared/domain";
import type {
  FinanceTransaction,
  NormalizedTransaction,
  TransactionListItem,
} from "../domain/transaction";

/** Totais para o dashboard financeiro (em centavos). */
export interface FinanceSummary {
  receivablePending: number;
  receivableOverdue: number;
  payablePending: number;
  payableOverdue: number;
}

/** Porta de persistência de lançamentos. Operações restritas ao tenant. */
export interface TransactionRepository {
  create(
    ctx: TenantContext,
    data: NormalizedTransaction,
  ): Promise<FinanceTransaction>;
  list(
    ctx: TenantContext,
    opts?: { direction?: string; status?: string; search?: string },
  ): Promise<TransactionListItem[]>;
  getById(ctx: TenantContext, id: string): Promise<FinanceTransaction | null>;
  update(
    ctx: TenantContext,
    id: string,
    data: NormalizedTransaction,
  ): Promise<FinanceTransaction | null>;
  delete(ctx: TenantContext, id: string): Promise<void>;
  markPaid(ctx: TenantContext, id: string): Promise<void>;
  summary(ctx: TenantContext): Promise<FinanceSummary>;
}
