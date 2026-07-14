import type { DefaultSession } from "next-auth";

/**
 * Aumenta os tipos do Auth.js para incluir os campos do nosso multi-tenant
 * (id do usuário, empresa/tenant e papel) na sessão e no token.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyId: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    companyId: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    companyId: string;
    role: string;
  }
}
