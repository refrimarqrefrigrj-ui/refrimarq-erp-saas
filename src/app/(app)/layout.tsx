import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { AppShell } from "@/components/app-shell/app-shell";

/**
 * Layout de toda a área autenticada (route group `(app)`, não aparece na URL).
 *
 * Guarda de acesso: sem usuário logado -> /login.
 *
 * NOTA (multi-tenancy): decidimos NÃO usar as "Organizations" do Clerk para o
 * MVP (evita o atrito de forçar criação/seleção de empresa no login). O tenant
 * será resolvido no nosso banco (uma empresa por usuário dono, criada
 * automaticamente) quando construirmos o módulo de Clientes. Ver task de
 * "tenant resolution".
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
