"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

import { requireTenantContext } from "@/lib/auth/tenant";
import { drizzleServiceOrderRepository } from "@/modules/service-orders/infrastructure/drizzle-service-order-repository";
import {
  PHOTO_KINDS,
  type PhotoKind,
} from "@/modules/service-orders/domain/service-order";

/** Salva no banco a URL da foto que o navegador acabou de subir ao storage. */
export async function savePhotoAction(input: {
  serviceOrderId: string;
  kind: string;
  url: string;
}): Promise<void> {
  const ctx = await requireTenantContext();

  const kind = (
    PHOTO_KINDS.includes(input.kind as PhotoKind) ? input.kind : "chegada"
  ) as PhotoKind;

  await drizzleServiceOrderRepository.addPhoto(
    ctx,
    input.serviceOrderId,
    kind,
    input.url,
  );

  revalidatePath(`/ordens/${input.serviceOrderId}`);
}

/** Remove a foto do banco e apaga o arquivo do storage. */
export async function deletePhotoAction(formData: FormData): Promise<void> {
  const ctx = await requireTenantContext();
  const photoId = String(formData.get("photoId") ?? "");
  const serviceOrderId = String(formData.get("serviceOrderId") ?? "");

  const url = await drizzleServiceOrderRepository.deletePhoto(ctx, photoId);
  if (url) {
    // Não deixa arquivo órfão ocupando espaço no storage.
    try {
      await del(url);
    } catch {
      // Se o arquivo já não existir, seguir em frente.
    }
  }

  revalidatePath(`/ordens/${serviceOrderId}`);
}
