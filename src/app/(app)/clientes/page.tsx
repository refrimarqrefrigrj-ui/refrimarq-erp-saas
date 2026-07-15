import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { listCustomers } from "@/modules/customers/application/list-customers";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import { onlyDigits } from "@/modules/customers/domain/document";
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

/** Formata CPF/CNPJ para exibição. */
function formatDocument(value: string | null): string {
  const d = onlyDigits(value);
  if (d.length === 11) {
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  if (d.length === 14) {
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return value ?? "—";
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const ctx = await requireTenantContext();
  const customers = await listCustomers(drizzleCustomerRepository, ctx, {
    search: q,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastro de clientes (pessoa física e jurídica) da sua empresa.
          </p>
        </div>
        <Button render={<Link href="/clientes/novo" />}>
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      <form className="flex gap-2" action="/clientes">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nome ou documento"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-medium">
            {q ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {q
              ? "Tente outro termo de busca."
              : "Cadastre seu primeiro cliente para começar a criar orçamentos e ordens de serviço."}
          </p>
          {!q ? (
            <Button className="mt-5" render={<Link href="/clientes/novo" />}>
              <Plus className="h-4 w-4" />
              Cadastrar primeiro cliente
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/clientes/${c.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {c.name}
                      </Link>
                      <Badge variant="secondary" className="uppercase">
                        {c.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDocument(c.document)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email || c.phone || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.primaryCity
                      ? `${c.primaryCity}${c.primaryState ? `/${c.primaryState}` : ""}`
                      : "—"}
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
