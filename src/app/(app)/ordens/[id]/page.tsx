import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import {
  getServiceOrder,
  getServiceOrderPhotos,
} from "@/modules/service-orders/application/service-order-usecases";
import { drizzleServiceOrderRepository } from "@/modules/service-orders/infrastructure/drizzle-service-order-repository";
import { ServiceOrderForm } from "../service-order-form";
import { DeleteOrderButton } from "../delete-order-button";
import { loadServiceOrderOptions } from "../load-options";
import { PhotoSection } from "./photo-section";

export default async function EditOrdemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireTenantContext();

  const [order, opts, photos] = await Promise.all([
    getServiceOrder(drizzleServiceOrderRepository, ctx, id),
    loadServiceOrderOptions(ctx),
    getServiceOrderPhotos(drizzleServiceOrderRepository, ctx, id),
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

      {/* Fotos do serviço — o técnico registra a chegada e a conclusão */}
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <div>
          <h3 className="text-base font-semibold">Fotos do serviço</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            O técnico registra a foto ao chegar e ao concluir. No celular, o
            botão abre a câmera direto.
          </p>
        </div>
        <PhotoSection
          serviceOrderId={order.id}
          kind="chegada"
          label="📷 Chegada"
          photos={photos.filter((p) => p.kind === "chegada")}
        />
        <PhotoSection
          serviceOrderId={order.id}
          kind="conclusao"
          label="✅ Conclusão"
          photos={photos.filter((p) => p.kind === "conclusao")}
        />
      </div>
    </div>
  );
}
