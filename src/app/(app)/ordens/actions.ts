"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireTenantContext } from "@/lib/auth/tenant";
import {
  createServiceOrder,
  updateServiceOrder,
  deleteServiceOrder,
  concludeServiceOrder,
} from "@/modules/service-orders/application/service-order-usecases";
import { drizzleServiceOrderRepository } from "@/modules/service-orders/infrastructure/drizzle-service-order-repository";
import { financeBillingGateway } from "@/modules/service-orders/infrastructure/finance-billing-gateway";

export type ServiceOrderFormState = { error: string } | undefined;

function readInput(formData: FormData) {
  return {
    customerId: String(formData.get("customerId") ?? ""),
    equipmentId: String(formData.get("equipmentId") ?? ""),
    collaboratorId: String(formData.get("collaboratorId") ?? ""),
    type: String(formData.get("type") ?? "manutencao"),
    status: String(formData.get("status") ?? "aberta"),
    scheduledFor: String(formData.get("scheduledFor") ?? ""),
    description: String(formData.get("description") ?? ""),
    solution: String(formData.get("solution") ?? ""),
    value: String(formData.get("value") ?? ""),
  };
}

/** Concluir uma OS gera conta a receber — as telas de dinheiro precisam atualizar. */
function revalidateAll() {
  revalidatePath("/ordens");
  revalidatePath("/financeiro");
  revalidatePath("/dashboard");
}

export async function createServiceOrderAction(
  _prev: ServiceOrderFormState,
  formData: FormData,
): Promise<ServiceOrderFormState> {
  const ctx = await requireTenantContext();
  const result = await createServiceOrder(
    drizzleServiceOrderRepository,
    ctx,
    readInput(formData),
    financeBillingGateway,
  );
  if (!result.ok) return { error: result.error.message };

  revalidateAll();
  redirect("/ordens");
}

export async function updateServiceOrderAction(
  _prev: ServiceOrderFormState,
  formData: FormData,
): Promise<ServiceOrderFormState> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  const result = await updateServiceOrder(
    drizzleServiceOrderRepository,
    ctx,
    id,
    readInput(formData),
    financeBillingGateway,
  );
  if (!result.ok) return { error: result.error.message };

  revalidateAll();
  redirect("/ordens");
}

export async function deleteServiceOrderAction(
  formData: FormData,
): Promise<void> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  await deleteServiceOrder(drizzleServiceOrderRepository, ctx, id);

  revalidateAll();
  redirect("/ordens");
}

/** Ação rápida: concluir a OS na lista (gera a conta a receber). */
export async function concludeOrderAction(formData: FormData): Promise<void> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  await concludeServiceOrder(
    drizzleServiceOrderRepository,
    ctx,
    id,
    financeBillingGateway,
  );

  revalidateAll();
}
