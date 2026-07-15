import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { getObra } from "@/modules/obras/application/get-obra";
import { drizzleObraRepository } from "@/modules/obras/infrastructure/drizzle-obra-repository";
import { listCustomers } from "@/modules/customers/application/list-customers";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import { ObraForm } from "../obra-form";
import { DeleteObraButton } from "../delete-obra-button";

export default async function EditObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireTenantContext();

  const [obra, customers] = await Promise.all([
    getObra(drizzleObraRepository, ctx, id),
    listCustomers(drizzleCustomerRepository, ctx),
  ]);

  if (!obra) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/obras"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para obras
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {obra.title}
          </h1>
        </div>
        <DeleteObraButton id={obra.id} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <ObraForm
          customers={customers.map((c) => ({ id: c.id, name: c.name }))}
          initial={obra}
        />
      </div>
    </div>
  );
}
