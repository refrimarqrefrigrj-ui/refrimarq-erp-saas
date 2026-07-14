import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthBrand } from "@/components/auth/auth-brand";
import { SignupForm } from "./signup-form";

/** Tela de cadastro (cria empresa + usuário dono). */
export default async function CadastroPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(6,182,212,0.18),transparent_70%)]"
      />
      <div className="w-full max-w-sm">
        <AuthBrand />
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">
            Crie sua empresa
          </h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Comece grátis. Leva menos de um minuto.
          </p>
          <SignupForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
