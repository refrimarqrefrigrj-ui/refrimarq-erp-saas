import Link from "next/link";
import { Plus, Search, Building2, Wallet, Hammer, CheckCircle2 } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { listObras } from "@/modules/obras/application/list-obras";
import { drizzleObraRepository } from "@/modules/obras/infrastructure/drizzle-obra-repository";
import { OBRA_STATUS_LABELS, type ObraStatus } from "@/modules/obras/domain/obra";
import { formatBRLFromCents } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const STATUS_CLASSES: Record<ObraStatus, string> = {
  proposta: "bg-muted text-muted-foreground",
  em_andamento:
    "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-transparent",
  concluida:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-transparent",
  cancelada: "bg-destructive/10 text-destructive border-transparent",
};

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const ctx = await requireTenantContext();
  const obras = await listObras(drizzleObraRepository, ctx, { search: q });

  // Dashboard da aba (calculado a partir da lista).
  const notCancelled = obras.filter((o) => o.status !== "cancelada");
  const totalContracted = notCancelled.reduce((s, o) => s + o.valueCents, 0);
  const inProgress = obras.filter((o) => o.status === "em_andamento");
  const inProgressValue = inProgress.reduce((s, o) => s + o.valueCents, 0);
  const completed = obras.filter((o) => o.status === "concluida");
  const completedValue = completed.reduce((s, o) => s + o.valueCents, 0);

  const kpis = [
    {
      label: "Valor contratado",
      value: formatBRLFromCents(totalContracted),
      icon: Wallet,
    },
    {
      label: "Em andamento",
      value: formatBRLFromCents(inProgressValue),
      hint: `${inProgress.length} obra(s)`,
      icon: Hammer,
    },
    {
      label: "Concluídas",
      value: formatBRLFromCents(completedValue),
      hint: `${completed.length} obra(s)`,
      icon: CheckCircle2,
    },
    {
      label: "Total de obras",
      value: String(obras.length),
      icon: Building2,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Obras corporativas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Projetos e contratos por cliente, com acompanhamento financeiro.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/obras/novo" />}>
          <Plus className="h-4 w-4" />
          Nova obra
        </Button>
      </div>

      {/* Dashboard da aba */}
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
                <div className="text-xl font-semibold">{kpi.value}</div>
                {kpi.hint ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {kpi.hint}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <form className="flex gap-2" action="/obras">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por título"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {obras.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-medium">
            {q ? "Nenhuma obra encontrada" : "Nenhuma obra ainda"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {q
              ? "Tente outro termo de busca."
              : "Cadastre suas obras corporativas para acompanhar valores e andamento."}
          </p>
          {!q ? (
            <Button
              nativeButton={false}
              className="mt-5"
              render={<Link href="/obras/novo" />}
            >
              <Plus className="h-4 w-4" />
              Cadastrar obra
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Obra</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {obras.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link
                      href={`/obras/${o.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {o.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {o.customerName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn(STATUS_CLASSES[o.status])}
                    >
                      {OBRA_STATUS_LABELS[o.status]}
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
