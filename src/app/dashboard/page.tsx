import { currentUser } from "@clerk/nextjs/server";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

/**
 * Primeira área protegida do sistema (prova de que a autenticação funciona).
 *
 * Só é acessível por usuários autenticados — quem não estiver logado é
 * redirecionado para /login pelo proxy (src/proxy.ts).
 *
 * O layout completo (menu lateral, tema, navegação) vem no próximo passo
 * do Módulo 0. Aqui montamos apenas a casca com os controles do Clerk:
 * - OrganizationSwitcher: troca entre empresas (multi-tenant visível).
 * - UserButton: menu do usuário (perfil, sair).
 */
export default async function DashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "por aqui";

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-black/[.06] px-6 py-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
            </svg>
          </span>
          <span className="font-semibold tracking-tight">ERP HVAC</span>
        </div>

        <div className="flex items-center gap-4">
          <OrganizationSwitcher
            hidePersonal
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
          />
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
          Área autenticada
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Bem-vindo, {firstName}! 👋
        </h1>
        <p className="mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
          Sua autenticação está funcionando. Este é o esqueleto do painel — nos
          próximos passos ele ganha o menu lateral e os módulos (Clientes,
          Ordens de Serviço, Financeiro…).
        </p>

        <div className="mt-8 rounded-2xl border border-black/[.06] bg-white/60 p-6 dark:border-white/10 dark:bg-white/[.03]">
          <h2 className="text-base font-semibold">Multi-empresa (multi-tenant)</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Use o seletor no topo para criar e alternar entre empresas. Cada
            empresa é uma organização isolada — a base do nosso SaaS.
          </p>
        </div>
      </main>
    </div>
  );
}
