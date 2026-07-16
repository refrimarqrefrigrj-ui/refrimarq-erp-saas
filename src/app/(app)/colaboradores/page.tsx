import Link from "next/link";
import { Plus, Search, HardHat, Power, PowerOff } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { listCollaborators } from "@/modules/collaborators/application/collaborator-usecases";
import { drizzleCollaboratorRepository } from "@/modules/collaborators/infrastructure/drizzle-collaborator-repository";
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
import { toggleActiveAction } from "./actions";

export default async function ColaboradoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const ctx = await requireTenantContext();
  const collaborators = await listCollaborators(
    drizzleCollaboratorRepository,
    ctx,
    { search: q },
  );

  const activeCount = collaborators.filter((c) => c.active).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Colaboradores
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sua equipe e funções. {activeCount} de {collaborators.length} ativo(s).
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/colaboradores/novo" />}>
          <Plus className="h-4 w-4" />
          Novo colaborador
        </Button>
      </div>

      <form className="flex gap-2" action="/colaboradores">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nome"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {collaborators.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <HardHat className="h-6 w-6 text-muted-foreground" />
          </span>
          <h2 className="mt-4 text-base font-medium">
            {q ? "Nenhum colaborador encontrado" : "Nenhum colaborador ainda"}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Cadastre sua equipe para atribuir atendimentos e ordens de serviço.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/colaboradores/${c.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.role ?? "—"}
                  </TableCell>
                  <TableCell>
                    {c.active ? (
                      <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={toggleActiveAction} className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={c.active ? "false" : "true"}
                      />
                      <Button
                        type="submit"
                        variant={c.active ? "outline" : "default"}
                        size="sm"
                      >
                        {c.active ? (
                          <>
                            <PowerOff className="h-4 w-4" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </form>
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
