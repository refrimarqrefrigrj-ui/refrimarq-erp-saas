import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { getServiceOrder } from "@/modules/service-orders/application/service-order-usecases";
import { drizzleServiceOrderRepository } from "@/modules/service-orders/infrastructure/drizzle-service-order-repository";
import { ServiceOrderForm } from "../service-order-form";
import { DeleteOrderButton } from "../delete-order-button";
import { loadServiceOrderOptions } from "../load-options";

export default async function EditOrdemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireTenantContext();

  const [order, opts] = await Promise.all([
    getServiceOrder(drizzleServiceOrderRepository, ctx, id),
    loadServiceOrderOptions(ctx),
  ]);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/ordens"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para ordens
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            OS #{order.number}
          </h1>
        </div>
        <DeleteOrderButton id={order.id} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <ServiceOrderForm
          customers={opts.customers}
          equipmentOptions={opts.equipmentOptions}
          collaborators={opts.collaborators}
          initial={order}
        />
      </div>
    </div>
  );
}
