import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { AppShell } from "@/components/app-shell/app-shell";

/**
 * Layout de toda a área autenticada (route group `(app)`, não aparece na URL).
 *
 * Faz a guarda de sessão (resource-based auth): sem usuário logado, redireciona
 * para /login. Em seguida, renderiza a casca do app (menu lateral + topo).
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
