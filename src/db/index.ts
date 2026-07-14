import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Cliente do banco (Drizzle + Neon serverless).
 *
 * Usa o driver WebSocket (Pool) porque ele suporta TRANSAÇÕES — necessárias
 * para o padrão de multi-tenancy com Row Level Security (definir o tenant da
 * sessão e executar as queries no mesmo escopo transacional).
 *
 * Reaproveita a conexão entre invocações no ambiente serverless (evita abrir
 * um novo pool a cada request em dev/hot-reload).
 */
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL! });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });

export { schema };
