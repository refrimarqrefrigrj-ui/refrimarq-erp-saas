import { SignUp } from "@clerk/nextjs";

/**
 * Tela de cadastro. A rota catch-all `[[...rest]]` é exigida pelo Clerk para
 * gerenciar os passos internos (verificação de e-mail, etc.) dentro de /cadastro.
 */
export default function CadastroPage() {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(6,182,212,0.18),transparent_70%)]"
      />
      <SignUp />
    </div>
  );
}
