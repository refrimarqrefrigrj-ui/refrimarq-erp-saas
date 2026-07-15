import { and, desc, eq, ilike, sql } from "drizzle-orm";

import {
  customers,
  financeTransactions,
  type FinanceTransactionRow,
} from "@/db/schema";
import { withTenant } from "@/db/tenant";
import type { TenantContext } from "@/shared/domain";
import type {
  FinanceSummary,
  TransactionRepository,
} from "../application/transaction-repository";
import {
  today,
  type FinanceTransaction,
  type NormalizedTransaction,
  type TransactionDirection,
  type TransactionListItem,
  type TransactionStatus,
} from "../domain/transaction";

function toDomain(row: FinanceTransactionRow): FinanceTransaction {
  return {
    id: row.id,
    direction: row.direction as TransactionDirection,
    description: row.description,
    amountCents: row.amountCents,
    status: row.status as TransactionStatus,
    dueDate: row.dueDate,
    paidDate: row.paidDate,
    category: row.category,
    customerId: row.customerId,
    obraId: row.obraId,
    notes: row.notes,
    createdAt: row.createdAt,
  };
}

function toValues(data: NormalizedTransaction) {
  return {
    direction: data.direction,
    description: data.description,
    amountCents: data.amountCents,
    status: data.status,
    dueDate: data.dueDate,
    paidDate: data.paidDate,
    category: data.category,
    customerId: data.customerId,
    notes: data.notes,
  };
}

export const drizzleTransactionRepository: TransactionRepository = {
  async create(
    ctx: TenantContext,
    data: NormalizedTransaction,
  ): Promise<FinanceTransaction> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .insert(financeTransactions)
        .values({ companyId: ctx.tenantId, ...toValues(data) })
        .returning();
      return toDomain(row);
    });
  },

  async list(
    ctx: TenantContext,
    opts?: { direction?: string; status?: string; search?: string },
  ): Promise<TransactionListItem[]> {
    return withTenant(ctx.tenantId, async (tx) => {
      const conds = [];
      if (opts?.direction)
        conds.push(eq(financeTransactions.direction, opts.direction));
      if (opts?.status) conds.push(eq(financeTransactions.status, opts.status));
      const search = opts?.search?.trim();
      if (search)
        conds.push(ilike(financeTransactions.description, `%${search}%`));

      const rows = await tx
        .select({
          id: financeTransactions.id,
          direction: financeTransactions.direction,
          description: financeTransactions.description,
          amountCents: financeTransactions.amountCents,
          status: financeTransactions.status,
          dueDate: financeTransactions.dueDate,
          category: financeTransactions.category,
          customerName: customers.name,
        })
        .from(financeTransactions)
        .leftJoin(customers, eq(customers.id, financeTransactions.customerId))
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(sql`${financeTransactions.dueDate} asc nulls last`)
        .limit(300);

      return rows.map((r) => ({
        ...r,
        direction: r.direction as TransactionDirection,
        status: r.status as TransactionStatus,
      }));
    });
  },

  async getById(
    ctx: TenantContext,
    id: string,
  ): Promise<FinanceTransaction | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .select()
        .from(financeTransactions)
        .where(eq(financeTransactions.id, id))
        .limit(1);
      return row ? toDomain(row) : null;
    });
  },

  async update(
    ctx: TenantContext,
    id: string,
    data: NormalizedTransaction,
  ): Promise<FinanceTransaction | null> {
    return withTenant(ctx.tenantId, async (tx) => {
      const [row] = await tx
        .update(financeTransactions)
        .set({ ...toValues(data), updatedAt: new Date() })
        .where(eq(financeTransactions.id, id))
        .returning();
      return row ? toDomain(row) : null;
    });
  },

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await withTenant(ctx.tenantId, async (tx) => {
      await tx.delete(financeTransactions).where(eq(financeTransactions.id, id));
    });
  },

  async markPaid(ctx: TenantContext, id: string): Promise<void> {
    await withTenant(ctx.tenantId, async (tx) => {
      await tx
        .update(financeTransactions)
        .set({ status: "paid", paidDate: today(), updatedAt: new Date() })
        .where(eq(financeTransactions.id, id));
    });
  },

  async summary(ctx: TenantContext): Promise<FinanceSummary> {
    return withTenant(ctx.tenantId, async (tx) => {
      const ref = today();
      const rows = await tx
        .select({
          direction: financeTransactions.direction,
          pending: sql<string>`coalesce(sum(${financeTransactions.amountCents}) filter (where ${financeTransactions.status} = 'pending'), 0)`,
          overdue: sql<string>`coalesce(sum(${financeTransactions.amountCents}) filter (where ${financeTransactions.status} = 'pending' and ${financeTransactions.dueDate} < ${ref}), 0)`,
        })
        .from(financeTransactions)
        .groupBy(financeTransactions.direction);

      const summary: FinanceSummary = {
        receivablePending: 0,
        receivableOverdue: 0,
        payablePending: 0,
        payableOverdue: 0,
      };
      for (const r of rows) {
        if (r.direction === "receivable") {
          summary.receivablePending = Number(r.pending);
          summary.receivableOverdue = Number(r.overdue);
        } else if (r.direction === "payable") {
          summary.payablePending = Number(r.pending);
          summary.payableOverdue = Number(r.overdue);
        }
      }
      return summary;
    });
  },
};
