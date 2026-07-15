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
  // Faturamento = contas a receber JÁ recebidas (quitadas).
  receivedToday: number;
  receivedMonth: number;
}

/** Um recebimento (conta a receber quitada) para o relatório por período. */
export interface ReceivedItem {
  id: string;
  description: string;
  customerName: string | null;
  paidDate: string | null;
  amountCents: number;
}

/** Faturamento (recebimentos) em um intervalo de datas. */
export interface FaturamentoPeriod {
  totalCents: number;
  count: number;
  items: ReceivedItem[];
}

/** Porta de persistência de lançamentos. Operações restritas ao tenant. */
export interface TransactionRepository {
  /** Faturamento no período: contas a receber quitadas com paid_date em [from, to]. */
  faturamento(
    ctx: TenantContext,
    from: string,
    to: string,
  ): Promise<FaturamentoPeriod>;
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
