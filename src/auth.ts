import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { users } from "@/db/schema";

/**
 * Configuração central do Auth.js (autenticação por e-mail + senha).
 *
 * - Sessão em JWT (cookie de primeira-parte no domínio do app) → funciona em
 *   qualquer domínio (localhost, vercel.app, domínio próprio) sem handshake.
 * - `authorize` valida as credenciais contra o banco (senha via bcrypt).
 * - Os callbacks colocam `id`, `companyId` (tenant) e `role` na sessão, para
 *   o multi-tenancy e o RBAC.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) return null;

        const passwordOk = await bcrypt.compare(password, user.passwordHash);
        if (!passwordOk) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          companyId: user.companyId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // No login, `user` está presente: copiamos os dados de tenant/role.
      if (user) {
        token.id = user.id as string;
        token.companyId = user.companyId;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.companyId = token.companyId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
