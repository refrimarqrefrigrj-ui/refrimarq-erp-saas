import type { TenantContext } from "@/shared/domain";
import type {
  Customer,
  CustomerListItem,
  NormalizedCustomer,
} from "../domain/customer";

/**
 * Porta (interface) de persistência de clientes. A aplicação depende disto,
 * nunca da implementação concreta (Drizzle). Todas as operações recebem o
 * TenantContext e ficam restritas àquela empresa.
 */
export interface CustomerRepository {
  create(ctx: TenantContext, data: NormalizedCustomer): Promise<Customer>;
  list(ctx: TenantContext, opts?: { search?: string }): Promise<CustomerListItem[]>;
  getById(ctx: TenantContext, id: string): Promise<Customer | null>;
  update(
    ctx: TenantContext,
    id: string,
    data: NormalizedCustomer,
  ): Promise<Customer | null>;
  delete(ctx: TenantContext, id: string): Promise<void>;
}
