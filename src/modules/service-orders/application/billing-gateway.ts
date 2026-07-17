import type { TenantContext } from "@/shared/domain";
import type { ServiceOrder } from "../domain/service-order";

/**
 * Porta de faturamento da OS.
 *
 * As Ordens de Serviço NÃO conhecem o módulo Financeiro — dependem apenas
 * desta interface (regra de dependência da Clean Architecture). O adaptador
 * concreto vive em `infrastructure/` e usa o repositório do Financeiro.
 */
export interface BillingGateway {
  /**
   * Garante a conta a receber de uma OS concluída.
   * Idempotente: não duplica se já existir, e ignora OS sem valor.
   */
  ensureReceivableForOrder(
    ctx: TenantContext,
    order: ServiceOrder,
  ): Promise<void>;
}
