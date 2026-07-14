import type { TenantContext } from "@/shared/domain";
import type { CreateCustomerInput, Customer } from "../domain/customer";

/**
 * Porta (interface) de persistência de clientes. A aplicação depende disto,
 * nunca da implementação concreta (Drizzle). Todas as operações recebem o
 * TenantContext e ficam restritas àquela empresa.
 */
export interface CustomerRepository {
  create(ctx: TenantContext, data: CreateCustomerInput): Promise<Customer>;
  list(ctx: TenantContext, opts?: { search?: string }): Promise<Customer[]>;
}
