import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// O drizzle-kit roda fora do Next, então carregamos as variáveis manualmente.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Prefixo dos arquivos de migration (sequencial, legível no histórico).
  migrations: {
    prefix: "timestamp",
  },
  verbose: true,
  strict: true,
});
