import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { getCustomer } from "@/modules/customers/application/get-customer";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import { CustomerForm } from "../customer-form";
import { DeleteCustomerButton } from "../delete-customer-button";

export default async function EditClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const customer = await getCustomer(drizzleCustomerRepository, ctx, id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/clientes"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para clientes
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {customer.name}
          </h1>
        </div>
        <DeleteCustomerButton id={customer.id} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <CustomerForm initial={customer} />
      </div>
    </div>
  );
}
