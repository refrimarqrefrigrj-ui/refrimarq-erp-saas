import Link from "next/link";

/**
 * Página inicial pública (landing) do ERP HVAC.
 *
 * Provisória do Módulo 0: apresenta o produto e leva ao login.
 * O botão "Entrar" apontará para o fluxo de autenticação do Clerk
 * assim que a auth for conectada.
 */

const features = [
  {
    title: "Ordens de Serviço",
    description:
      "Instalação, manutenção e limpeza com checklist, fotos e assinatura digital.",
  },
  {
    title: "Contratos & PMOC",
    description:
      "Manutenção recorrente e o Plano de Manutenção exigido por lei, sob controle.",
  },
  {
    title: "Financeiro",
    description:
      "Fluxo de caixa, contas a receber e cobrança — a saúde do negócio em tempo real.",
  },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* brilho de fundo (tons frios de ar-condicionado) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(6,182,212,0.18),transparent_70%)]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Brand />
        <Link
          href="/login"
          className="rounded-full border border-black/10 px-5 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          Entrar
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-300">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          Feito sob medida para empresas de Ar-Condicionado
        </span>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          O ERP que entende a sua{" "}
          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
            climatização
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Ordens de serviço, técnicos em campo, contratos, PMOC e financeiro —
          tudo em um só lugar, do orçamento à cobrança.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-7 font-medium text-white shadow-lg shadow-cyan-500/20 transition-opacity hover:opacity-90"
          >
            Acessar o sistema
          </Link>
          <a
            href="#recursos"
            className="flex h-12 items-center justify-center rounded-full border border-black/10 px-7 font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
          >
            Conhecer recursos
          </a>
        </div>

        <section
          id="recursos"
          className="mt-20 grid w-full max-w-4xl gap-4 sm:grid-cols-3"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-black/[.06] bg-white/60 p-6 text-left backdrop-blur dark:border-white/10 dark:bg-white/[.03]"
            >
              <h2 className="text-base font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </section>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-6 py-8 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} ERP HVAC · Módulo 0 — Fundação
      </footer>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
        <SnowflakeIcon />
      </span>
      <span className="text-lg font-semibold tracking-tight">ERP HVAC</span>
    </div>
  );
}

function SnowflakeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
    </svg>
  );
}
