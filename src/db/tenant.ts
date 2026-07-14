import { sql } from "drizzle-orm";

import { db } from "./index";

/**
 * Tipo da transação do Drizzle (o "db" com escopo de tenant que os
 * repositórios usam dentro de `withTenant`).
 */
export type TenantDb = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Executa `fn` dentro de uma transação com o tenant ativo definido na sessão
 * do Postgres (`app.current_company_id`). É o que faz o Row Level Security
 * filtrar automaticamente por empresa.
 *
 * REGRA: todo acesso a tabelas de tenant (ex.: customers) deve passar por aqui.
 * O `set_config(..., true)` é local à transação (não vaza para outras).
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: TenantDb) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    // Assume o papel restrito (sem bypass de RLS) só nesta transação.
    await tx.execute(sql`set local role app_tenant`);
    // Define a empresa ativa (usada pelas políticas de RLS).
    await tx.execute(
      sql`select set_config('app.current_company_id', ${tenantId}, true)`,
    );
    return fn(tx);
  });
}
