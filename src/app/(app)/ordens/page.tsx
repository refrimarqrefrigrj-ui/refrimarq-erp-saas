import Link from "next/link";
import { Plus, ClipboardList, Hammer, CheckCircle2, FolderOpen } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { listServiceOrders } from "@/modules/service-orders/application/service-order-usecases";
import { drizzleServiceOrderRepository } from "@/modules/service-orders/infrastructure/drizzle-service-order-repository";
import {
  OS_STATUS_LABELS,
  OS_TYPE_LABELS,
  type ServiceOrderStatus,
} from "@/modules/service-orders/domain/service-order";
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

const STATUS_CLASSES: Record<ServiceOrderStatus, string> = {
  aberta: "bg-muted text-muted-foreground",
  agendada:
    "border-transparent bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
  em_andamento:
    "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  concluida:
    "border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  cancelada: "border-transparent bg-destructive/10 text-destructive",
};

const FILTERS = [
  { label: "Todas", status: undefined },
  { label: "Abertas", status: "aberta" },
  { label: "Agendadas", status: "agendada" },
  { label: "Em andamento", status: "em_andamento" },
  { label: "Concluídas", status: "concluida" },
] as const;

export default async function OrdensPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const ctx = await requireTenantContext();
  const orders = await listServiceOrders(drizzleServiceOrderRepository, ctx, {
    status,
  });

  // KPIs a partir da lista filtrada não faria sentido; buscamos sem filtro
  // para os cartões apenas quando não há filtro. Para simplicidade, calculamos
  // sobre o conjunto atual quando "Todas".
  const all = status
    ? await listServiceOrders(drizzleServiceOrderRepository, ctx)
    : orders;
  const open = all.filter(
    (o) => o.status === "aberta" || o.status === "agendada",
  ).length;
  const inProgress = all.filter((o) => o.status === "em_andamento").length;
  const done = all.filter((o) => o.status === "concluida").length;

  const kpis = [
    { label: "Abertas / agendadas", value: String(open), icon: FolderOpen },
    { label: "Em andamento", value: String(inProgress), icon: Hammer },
    { label: "Concluídas", value: String(done), icon: CheckCircle2 },
    { label: "Total de OS", value: String(all.length), icon: ClipboardList },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ordens de Serviço
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atendimentos ligados a cliente, equipamento e técnico.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/ordens/nova" />}>
          <Plus className="h-4 w-4" />
          Nova OS
        </Button>
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

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (status ?? undefined) === f.status;
          const href = f.status ? `/ordens?status=${f.status}` : "/ordens";
          return (
            <Link
              key={f.label}
              href={href}
              className={cn(
                buttonVariants({
                  variant: active ? "default" : "outline",
                  size: "sm",
                }),
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-medium">
            {status ? "Nenhuma OS neste status" : "Nenhuma OS ainda"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Abra sua primeira ordem de serviço para organizar os atendimentos.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OS</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link
                      href={`/ordens/${o.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      #{o.number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.customerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {OS_TYPE_LABELS[o.type]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.collaboratorName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(STATUS_CLASSES[o.status])}>
                      {OS_STATUS_LABELS[o.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatBRLFromCents(o.valueCents)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
