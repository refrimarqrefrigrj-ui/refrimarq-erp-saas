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
  type ServiceOrder,
  type ServiceOrderListItem,
} from "../domain/service-order";
import type { ServiceOrderRepository } from "./service-order-repository";

export async function createServiceOrder(
  repo: ServiceOrderRepository,
  ctx: TenantContext,
  input: CreateServiceOrderInput,
): Promise<Result<ServiceOrder>> {
  const validated = validateServiceOrder(input);
  if (!validated.ok) return validated;
  return ok(await repo.create(ctx, validated.value));
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
): Promise<Result<ServiceOrder>> {
  const validated = validateServiceOrder(input);
  if (!validated.ok) return validated;
  const updated = await repo.update(ctx, id, validated.value);
  if (!updated) return fail(new NotFoundError("Ordem de serviço não encontrada."));
  return ok(updated);
}

export async function deleteServiceOrder(
  repo: ServiceOrderRepository,
  ctx: TenantContext,
  id: string,
): Promise<void> {
  await repo.delete(ctx, id);
}
