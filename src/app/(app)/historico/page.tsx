import Link from "next/link";
import { History, CheckCircle2, Wallet, Receipt } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { getServiceHistory } from "@/modules/service-orders/application/service-order-usecases";
import { drizzleServiceOrderRepository } from "@/modules/service-orders/infrastructure/drizzle-service-order-repository";
import { OS_TYPE_LABELS } from "@/modules/service-orders/domain/service-order";
import { listCollaborators } from "@/modules/collaborators/application/collaborator-usecases";
import { drizzleCollaboratorRepository } from "@/modules/collaborators/infrastructure/drizzle-collaborator-repository";
import { formatBRLFromCents } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string; tecnico?: string }>;
}) {
  const { de, ate, tecnico } = await searchParams;
  const ctx = await requireTenantContext();

  const from = de && DATE_RE.test(de) ? de : undefined;
  const to = ate && DATE_RE.test(ate) ? ate : undefined;
  const collaboratorId = tecnico || undefined;

  const [history, collaborators] = await Promise.all([
    getServiceHistory(drizzleServiceOrderRepository, ctx, {
      from,
      to,
      collaboratorId,
    }),
    listCollaborators(drizzleCollaboratorRepository, ctx),
  ]);

  const kpis = [
    {
      label: "OS concluídas",
      value: String(history.count),
      icon: CheckCircle2,
    },
    {
      label: "Valor total",
      value: formatBRLFromCents(history.totalCents),
      icon: Wallet,
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Ticket médio",
      value: formatBRLFromCents(history.averageCents),
      icon: Receipt,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Histórico de serviço
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ordens de serviço concluídas, das mais recentes para as mais antigas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
                <div
                  className={`text-2xl font-semibold ${kpi.accent ?? ""}`.trim()}
                >
                  {kpi.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtros */}
      <form
        action="/historico"
        className="flex flex-wrap items-end gap-2 rounded-xl border p-4"
      >
        <div className="space-y-1">
          <Label htmlFor="de" className="text-xs text-muted-foreground">
            De
          </Label>
          <Input id="de" name="de" type="date" defaultValue={de ?? ""} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ate" className="text-xs text-muted-foreground">
            Até
          </Label>
          <Input id="ate" name="ate" type="date" defaultValue={ate ?? ""} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tecnico" className="text-xs text-muted-foreground">
            Técnico
          </Label>
          <select
            id="tecnico"
            name="tecnico"
            defaultValue={tecnico ?? ""}
            className={`${selectClass} min-w-48`}
          >
            <option value="">Todos os técnicos</option>
            {collaborators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        {de || ate || tecnico ? (
          <Button variant="ghost" nativeButton={false} render={<Link href="/historico" />}>
            Limpar
          </Button>
        ) : null}
      </form>

      {history.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <History className="h-6 w-6 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-medium">
            Nenhuma OS concluída no filtro
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Conclua ordens de serviço para montar o histórico da sua operação.
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
                <TableHead>Concluída em</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.items.map((o) => (
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
                  <TableCell className="text-muted-foreground">
                    {o.closedAt
                      ? new Date(o.closedAt).toLocaleDateString("pt-BR")
                      : "—"}
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
