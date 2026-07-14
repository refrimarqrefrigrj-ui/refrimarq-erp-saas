import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CreateOrganization } from "@clerk/nextjs";

/**
 * Onboarding — criação da empresa (organização/tenant).
 *
 * Fica FORA do grupo (app) de propósito: um usuário logado mas sem empresa
 * precisa chegar aqui sem ser barrado pela guarda de tenant. Ao criar a
 * empresa, o Clerk a torna ativa e redireciona para /dashboard.
 */
export default async function OnboardingPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // Já tem empresa ativa? Vai direto para o sistema.
  if (orgId) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(6,182,212,0.18),transparent_70%)]"
      />
      <div className="mb-6 max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Crie sua empresa
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada empresa é um espaço isolado e seguro dentro do ERP. É aqui que
          seus clientes, ordens de serviço e finanças vão viver.
        </p>
      </div>
      <CreateOrganization
        skipInvitationScreen
        afterCreateOrganizationUrl="/dashboard"
      />
    </div>
  );
}
