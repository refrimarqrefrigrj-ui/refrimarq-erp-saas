import type { TenantContext } from "@/shared/domain";
import type {
  NormalizedServiceOrder,
  PhotoKind,
  ServiceOrder,
  ServiceOrderHistory,
  ServiceOrderListItem,
  ServiceOrderPhoto,
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
  /**
   * Histórico de serviço: OS concluídas (mais recentes primeiro), com
   * total e ticket médio. Filtros opcionais por data de conclusão e técnico.
   */
  history(
    ctx: TenantContext,
    opts?: { from?: string; to?: string; collaboratorId?: string },
  ): Promise<ServiceOrderHistory>;

  // --- Fotos da OS (tiradas pelo técnico em campo) ---
  addPhoto(
    ctx: TenantContext,
    serviceOrderId: string,
    kind: PhotoKind,
    url: string,
  ): Promise<ServiceOrderPhoto>;
  listPhotos(
    ctx: TenantContext,
    serviceOrderId: string,
  ): Promise<ServiceOrderPhoto[]>;
  /** Busca uma foto por id (o RLS garante que é da empresa da sessão). */
  getPhoto(ctx: TenantContext, photoId: string): Promise<ServiceOrderPhoto | null>;
  /** Remove a foto e devolve a URL (para apagar o arquivo no storage). */
  deletePhoto(ctx: TenantContext, photoId: string): Promise<string | null>;
}
