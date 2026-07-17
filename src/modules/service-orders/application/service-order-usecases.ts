import {
  fail,
  NotFoundError,
  ok,
  type Result,
  type TenantContext,
} from "@/shared/domain";
import {
  validateServiceOrder,
  type CreateServiceOrderInput,
  type NormalizedServiceOrder,
  type ServiceOrder,
  type ServiceOrderHistory,
  type ServiceOrderListItem,
} from "../domain/service-order";
import type { BillingGateway } from "./billing-gateway";
import type { ServiceOrderRepository } from "./service-order-repository";

/**
 * Ao concluir uma OS, o valor vira uma conta a receber no Financeiro.
 * O gateway é idempotente (não duplica) e ignora OS sem valor.
 */
async function billIfConcluded(
  billing: BillingGateway | undefined,
  ctx: TenantContext,
  order: ServiceOrder,
) {
  if (billing && order.status === "concluida") {
    await billing.ensureReceivableForOrder(ctx, order);
  }
}

export async function createServiceOrder(
  repo: ServiceOrderRepository,
  ctx: TenantContext,
  input: CreateServiceOrderInput,
  billing?: BillingGateway,
): Promise<Result<ServiceOrder>> {
  const validated = validateServiceOrder(input);
  if (!validated.ok) return validated;

  const order = await repo.create(ctx, validated.value);
  await billIfConcluded(billing, ctx, order);
  return ok(order);
}

export async function listServiceOrders(
  repo: ServiceOrderRepository,
  ctx: TenantContext,
  opts?: { status?: string; type?: string; search?: string },
): Promise<ServiceOrderListItem[]> {
  return repo.list(ctx, opts);
}

export async function getServiceOrder(
  repo: ServiceOrderRepository,
  ctx: TenantContext,
  id: string,
): Promise<ServiceOrder | null> {
  return repo.getById(ctx, id);
}

export async function updateServiceOrder(
  repo: ServiceOrderRepository,
  ctx: TenantContext,
  id: string,
  input: CreateServiceOrderInput,
  billing?: BillingGateway,
): Promise<Result<ServiceOrder>> {
  const validated = validateServiceOrder(input);
  if (!validated.ok) return validated;

  const updated = await repo.update(ctx, id, validated.value);
  if (!updated) {
    return fail(new NotFoundError("Ordem de serviço não encontrada."));
  }
  await billIfConcluded(billing, ctx, updated);
  return ok(updated);
}

/** Caso de uso: concluir uma OS (ação rápida) e gerar a conta a receber. */
export async function concludeServiceOrder(
  repo: ServiceOrderRepository,
  ctx: TenantContext,
  id: string,
  billing?: BillingGateway,
): Promise<Result<ServiceOrder>> {
  const order = await repo.getById(ctx, id);
  if (!order) {
    return fail(new NotFoundError("Ordem de serviço não encontrada."));
  }

  // Já concluída: nada a fazer (mas garante a cobrança, se faltou).
  if (order.status === "concluida") {
    await billIfConcluded(billing, ctx, order);
    return ok(order);
  }

  const data: NormalizedServiceOrder = {
    customerId: order.customerId,
    equipmentId: order.equipmentId,
    collaboratorId: order.collaboratorId,
    type: order.type,
    status: "concluida",
    scheduledFor: order.scheduledFor,
    description: order.description,
    solution: order.solution,
    valueCents: order.valueCents,
  };

  const updated = await repo.update(ctx, id, data);
  if (!updated) {
    return fail(new NotFoundError("Ordem de serviço não encontrada."));
  }
  await billIfConcluded(billing, ctx, updated);
  return ok(updated);
}

export async function deleteServiceOrder(
  repo: ServiceOrderRepository,
  ctx: TenantContext,
  id: string,
): Promise<void> {
  await repo.delete(ctx, id);
}

/** Caso de uso: histórico de serviço (OS concluídas + totais). */
export async function getServiceHistory(
  repo: ServiceOrderRepository,
  ctx: TenantContext,
  opts?: { from?: string; to?: string; collaboratorId?: string },
): Promise<ServiceOrderHistory> {
  return repo.history(ctx, opts);
}
