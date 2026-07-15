import Link from "next/link";
import { Plus, Search, Wind } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { listEquipment } from "@/modules/equipment/application/list-equipment";
import { drizzleEquipmentRepository } from "@/modules/equipment/infrastructure/drizzle-equipment-repository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const KIND_LABELS: Record<string, string> = {
  split: "Split",
  janela: "Janela",
  cassete: "Cassete",
  "piso-teto": "Piso-teto",
  "multi-split": "Multi-split",
  outro: "Outro",
};

export default async function EquipamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const ctx = await requireTenantContext();
  const items = await listEquipment(drizzleEquipmentRepository, ctx, {
    search: q,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Equipamentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aparelhos de ar-condicionado instalados nos seus clientes.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/equipamentos/novo" />}>
          <Plus className="h-4 w-4" />
          Novo equipamento
        </Button>
      </div>

      <form className="flex gap-2" action="/equipamentos">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por marca, modelo ou nº de série"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Wind className="h-6 w-6 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-medium">
            {q ? "Nenhum equipamento encontrado" : "Nenhum equipamento ainda"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {q
              ? "Tente outro termo de busca."
              : "Cadastre os aparelhos dos seus clientes para controlar manutenções e garantias."}
          </p>
          {!q ? (
            <Button
              nativeButton={false}
              className="mt-5"
              render={<Link href="/equipamentos/novo" />}
            >
              <Plus className="h-4 w-4" />
              Cadastrar equipamento
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>BTUs</TableHead>
                <TableHead>Ambiente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <Link
                      href={`/equipamentos/${e.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {[e.brand, e.model].filter(Boolean).join(" ") ||
                        "Equipamento"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.customerName}
                  </TableCell>
                  <TableCell>
                    {e.kind ? (
                      <Badge variant="secondary">
                        {KIND_LABELS[e.kind] ?? e.kind}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.btus ? e.btus.toLocaleString("pt-BR") : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.location || "—"}
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
