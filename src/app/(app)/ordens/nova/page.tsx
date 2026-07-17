import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { Button } from "@/components/ui/button";
import { ServiceOrderForm } from "../service-order-form";
import { loadServiceOrderOptions } from "../load-options";

export default async function NovaOrdemPage() {
  const ctx = await requireTenantContext();
  const opts = await loadServiceOrderOptions(ctx);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href="/ordens"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para ordens
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Nova ordem de serviço
        </h1>
      </div>

      {opts.customers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Você precisa ter ao menos um cliente para abrir uma OS.
          </p>
          <Button
            nativeButton={false}
            className="mt-4"
            render={<Link href="/clientes/novo" />}
          >
            Cadastrar cliente
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-6">
          <ServiceOrderForm
            customers={opts.customers}
            equipmentOptions={opts.equipmentOptions}
            collaborators={opts.collaborators}
          />
        </div>
      )}
    </div>
  );
}
