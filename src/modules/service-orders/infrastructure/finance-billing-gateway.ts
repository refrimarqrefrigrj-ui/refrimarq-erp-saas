import type { TenantContext } from "@/shared/domain";
import { drizzleTransactionRepository } from "@/modules/finance/infrastructure/drizzle-transaction-repository";
import { today } from "@/modules/finance/domain/transaction";
import type { BillingGateway } from "../application/billing-gateway";
import { OS_TYPE_LABELS, type ServiceOrder } from "../domain/service-order";

/**
 * Adaptador que implementa o faturamento da OS usando o módulo Financeiro.
 * É aqui — e só aqui — que os dois módulos se encontram.
 */
export const financeBillingGateway: BillingGateway = {
  async ensureReceivableForOrder(
    ctx: TenantContext,
    order: ServiceOrder,
  ): Promise<void> {
    // Sem valor não há o que cobrar.
    if (order.valueCents <= 0) return;

    // Já existe lançamento desta OS? Não duplica.
    const exists = await drizzleTransactionRepository.existsForServiceOrder(
      ctx,
      order.id,
    );
    if (exists) return;

    await drizzleTransactionRepository.create(ctx, {
      direction: "receivable",
      description: `OS #${order.number} · ${OS_TYPE_LABELS[order.type]}`,
      amountCents: order.valueCents,
      status: "pending",
      dueDate: today(),
      paidDate: null,
      category: "Ordem de Serviço",
      customerId: order.customerId,
      serviceOrderId: order.id,
      notes: null,
    });
  },
};
