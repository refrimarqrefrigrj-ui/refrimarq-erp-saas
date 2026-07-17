import type { TenantContext } from "@/shared/domain";
import type {
  NormalizedServiceOrder,
  ServiceOrder,
  ServiceOrderListItem,
} from "../domain/service-order";

/** Porta de persistência de ordens de serviço. Operações restritas ao tenant. */
export interface ServiceOrderRepository {
  create(
    ctx: TenantContext,
    data: NormalizedServiceOrder,
  ): Promise<ServiceOrder>;
  list(
    ctx: TenantContext,
    opts?: { status?: string; type?: string; search?: string },
  ): Promise<ServiceOrderListItem[]>;
  getById(ctx: TenantContext, id: string): Promise<ServiceOrder | null>;
  update(
    ctx: TenantContext,
    id: string,
    data: NormalizedServiceOrder,
  ): Promise<ServiceOrder | null>;
  delete(ctx: TenantContext, id: string): Promise<void>;
}
