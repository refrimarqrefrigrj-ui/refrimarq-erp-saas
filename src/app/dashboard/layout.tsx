import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

/**
 * Portão de proteção da área autenticada (resource-based auth).
 *
 * Toda rota sob /dashboard passa por aqui: se não houver usuário logado,
 * redireciona para /login. É o padrão recomendado pelo Clerk (verificar a
 * sessão no recurso, não por path-matching no proxy).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  return <div className="flex flex-1 flex-col">{children}</div>;
}
