import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { listCustomers } from "@/modules/customers/application/list-customers";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import { Button } from "@/components/ui/button";
import { EquipmentForm } from "../equipment-form";

export default async function NovoEquipamentoPage() {
  const ctx = await requireTenantContext();
  const customers = await listCustomers(drizzleCustomerRepository, ctx);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href="/equipamentos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para equipamentos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Novo equipamento
        </h1>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Você precisa ter ao menos um cliente para cadastrar um equipamento.
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
          <EquipmentForm
            customers={customers.map((c) => ({ id: c.id, name: c.name }))}
          />
        </div>
      )}
    </div>
  );
}
