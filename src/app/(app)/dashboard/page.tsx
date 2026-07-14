import { currentUser } from "@clerk/nextjs/server";
import { Wallet, ClipboardList, FileText, FileCheck2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Dashboard — visão geral do negócio.
 *
 * Os indicadores (KPIs) estão zerados por enquanto: passam a mostrar dados
 * reais conforme os módulos forem entrando (Financeiro, Ordens de Serviço,
 * Orçamentos, Contratos). A casca (menu/topo) vem do layout do grupo (app).
 */
const kpis = [
  { label: "Faturamento do mês", value: "R$ 0,00", icon: Wallet },
  { label: "Ordens de serviço hoje", value: "0", icon: ClipboardList },
  { label: "Orçamentos pendentes", value: "0", icon: FileText },
  { label: "Contratos ativos", value: "0", icon: FileCheck2 },
];

export default async function DashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "por aqui";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bem-vindo, {firstName}! 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral da sua operação. Os números ganham vida conforme você usa
          o sistema.
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
                <div className="text-2xl font-semibold">{kpi.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Primeiros passos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Comece cadastrando seus <strong>Clientes</strong> no menu ao lado. É a
          base para orçamentos, ordens de serviço e contratos.
        </CardContent>
      </Card>
    </div>
  );
}
