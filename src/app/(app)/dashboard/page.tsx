import Link from "next/link";
import {
  Wallet,
  CalendarClock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { auth } from "@/auth";
import { requireTenantContext } from "@/lib/auth/tenant";
import { getFinanceSummary } from "@/modules/finance/application/transaction-actions";
import { drizzleTransactionRepository } from "@/modules/finance/infrastructure/drizzle-transaction-repository";
import { formatBRLFromCents } from "@/lib/masks";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Dashboard — visão geral do negócio, com os números reais do Financeiro.
 * Faturamento = contas a receber já recebidas (quitadas).
 */
export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(/\s+/)[0] ?? "por aqui";

  const ctx = await requireTenantContext();
  const summary = await getFinanceSummary(drizzleTransactionRepository, ctx);

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
    },
    {
      label: "A pagar",
      value: formatBRLFromCents(summary.payablePending),
      icon: TrendingDown,
      accent: "text-destructive",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bem-vindo, {firstName}! 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral da sua operação.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className={cn("text-2xl font-semibold", kpi.accent)}>
                  {kpi.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturamento</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          O <strong>faturamento</strong> soma as contas a receber que já foram
          recebidas (baixadas). Dê baixa nos recebimentos em{" "}
          <Link
            href="/financeiro"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Financeiro
          </Link>{" "}
          para que apareçam aqui no dia e no mês.
        </CardContent>
      </Card>
    </div>
  );
}
