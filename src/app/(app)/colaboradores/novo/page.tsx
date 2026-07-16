import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CollaboratorForm } from "../collaborator-form";

export default function NovoColaboradorPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div>
        <Link
          href="/colaboradores"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para colaboradores
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Novo colaborador
        </h1>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <CollaboratorForm />
      </div>
    </div>
  );
}
