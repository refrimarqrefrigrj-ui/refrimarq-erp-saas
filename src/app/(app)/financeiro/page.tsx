import Link from "next/link";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Scale,
  AlertTriangle,
  Check,
  Wallet,
  CalendarClock,
} from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { listTransactions } from "@/modules/finance/application/list-transactions";
import { getFinanceSummary } from "@/modules/finance/application/transaction-actions";
import { drizzleTransactionRepository } from "@/modules/finance/infrastructure/drizzle-transaction-repository";
import { isOverdue } from "@/modules/finance/domain/transaction";
import { formatBRLFromCents } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { markPaidAction } from "./actions";

const FILTERS = [
  { label: "Todos", tipo: undefined },
  { label: "A receber", tipo: "receivable" },
  { label: "A pagar", tipo: "payable" },
] as const;

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const ctx = await requireTenantContext();

  const [summary, items] = await Promise.all([
    getFinanceSummary(drizzleTransactionRepository, ctx),
    listTransactions(drizzleTransactionRepository, ctx, { direction: tipo }),
  ]);

  const balance = summary.receivablePending - summary.payablePending;
  const overdue = summary.receivableOverdue + summary.payableOverdue;

  const kpis = [
    {
      label: "Faturamento do mês",
      value: formatBRLFromCents(summary.receivedMonth),
      icon: Wallet,
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Faturamento do dia",
      value: formatBRLFromCents(summary.receivedToday),
      icon: CalendarClock,
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "A receber",
      value: formatBRLFromCents(summary.receivablePending),
      icon: TrendingUp,
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "A pagar",
      value: formatBRLFromCents(summary.payablePending),
      icon: TrendingDown,
      accent: "text-destructive",
    },
    {
      label: "Saldo previsto",
      value: formatBRLFromCents(balance),
      icon: Scale,
      accent: balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
    },
    {
      label: "Vencidas",
      value: formatBRLFromCents(overdue),
      icon: AlertTriangle,
      accent: overdue > 0 ? "text-destructive" : undefined,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Contas a receber e a pagar, com fluxo de caixa em tempo real.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/financeiro/novo?tipo=receivable"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Plus className="h-4 w-4" />
            A receber
          </Link>
          <Link
            href="/financeiro/novo?tipo=payable"
            className={cn(buttonVariants())}
          >
            <Plus className="h-4 w-4" />
            A pagar
          </Link>
        </div>
      </div>

      {/* Dashboard financeiro */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={cn("text-xl font-semibold", kpi.accent)}>
                  {kpi.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (tipo ?? undefined) === f.tipo;
          const href = f.tipo ? `/financeiro?tipo=${f.tipo}` : "/financeiro";
          return (
            <Link
              key={f.label}
              href={href}
              className={cn(
                buttonVariants({ variant: active ? "default" : "outline", size: "sm" }),
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum lançamento por aqui ainda.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => {
                const receivable = t.direction === "receivable";
                const overdueRow = isOverdue(t);
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link
                        href={`/financeiro/${t.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {t.description}
                      </Link>
                      {t.category ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {t.category}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.customerName ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.dueDate
                        ? new Date(t.dueDate + "T00:00:00").toLocaleDateString(
                            "pt-BR",
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {t.status === "paid" ? (
                        <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                          {receivable ? "Recebido" : "Pago"}
                        </Badge>
                      ) : overdueRow ? (
                        <Badge className="border-transparent bg-destructive/10 text-destructive">
                          Vencido
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        receivable
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive",
                      )}
                    >
                      {receivable ? "+" : "−"} {formatBRLFromCents(t.amountCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      {t.status === "pending" ? (
                        <form action={markPaidAction}>
                          <input type="hidden" name="id" value={t.id} />
                          <Button type="submit" variant="ghost" size="sm">
                            <Check className="h-4 w-4" />
                            Baixar
                          </Button>
                        </form>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
