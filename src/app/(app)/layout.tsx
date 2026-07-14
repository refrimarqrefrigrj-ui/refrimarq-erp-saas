import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { AppShell } from "@/components/app-shell/app-shell";

/**
 * Layout de toda a área autenticada (route group `(app)`, não aparece na URL).
 *
 * Guarda de acesso (resource-based auth), em duas camadas:
 *  1. Sem usuário logado  -> /login
 *  2. Logado mas sem empresa (organização) ativa -> /onboarding
 *
 * A 2ª camada é essencial no multi-tenant: nenhuma tela interna deve renderizar
 * sem um tenant ativo (era isso que causava o loop login/dashboard). O
 * /onboarding fica FORA deste grupo, para não cair na própria guarda.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  if (!orgId) {
    redirect("/onboarding");
  }

  return <AppShell>{children}</AppShell>;
}
