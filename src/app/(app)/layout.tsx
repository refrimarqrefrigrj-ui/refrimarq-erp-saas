import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell/app-shell";

/**
 * Layout de toda a área autenticada (route group `(app)`, não aparece na URL).
 *
 * Guarda de acesso (resource-based auth): sem sessão válida -> /login.
 * Passa os dados do usuário (nome/e-mail) para a casca do app.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        name: session.user.name ?? "Usuário",
        email: session.user.email ?? "",
      }}
    >
      {children}
    </AppShell>
  );
}
