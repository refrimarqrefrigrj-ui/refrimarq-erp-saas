import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { getEquipment } from "@/modules/equipment/application/get-equipment";
import { drizzleEquipmentRepository } from "@/modules/equipment/infrastructure/drizzle-equipment-repository";
import { listCustomers } from "@/modules/customers/application/list-customers";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import { EquipmentForm } from "../equipment-form";
import { DeleteEquipmentButton } from "../delete-equipment-button";

export default async function EditEquipamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireTenantContext();

  const [item, customers] = await Promise.all([
    getEquipment(drizzleEquipmentRepository, ctx, id),
    listCustomers(drizzleCustomerRepository, ctx),
  ]);

  if (!item) {
    notFound();
  }

  const title = [item.brand, item.model].filter(Boolean).join(" ") || "Equipamento";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/equipamentos"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para equipamentos
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <DeleteEquipmentButton id={item.id} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <EquipmentForm
          customers={customers.map((c) => ({ id: c.id, name: c.name }))}
          initial={item}
        />
      </div>
    </div>
  );
}
