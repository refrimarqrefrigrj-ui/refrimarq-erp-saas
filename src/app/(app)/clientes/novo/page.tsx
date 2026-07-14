import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CustomerForm } from "../customer-form";

export default function NovoClientePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para clientes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Novo cliente
        </h1>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <CustomerForm />
      </div>
    </div>
  );
}
