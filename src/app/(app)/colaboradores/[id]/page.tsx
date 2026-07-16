import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { getCollaborator } from "@/modules/collaborators/application/collaborator-usecases";
import { drizzleCollaboratorRepository } from "@/modules/collaborators/infrastructure/drizzle-collaborator-repository";
import { CollaboratorForm } from "../collaborator-form";
import { DeleteCollaboratorButton } from "../delete-collaborator-button";

export default async function EditColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireTenantContext();
  const collaborator = await getCollaborator(
    drizzleCollaboratorRepository,
    ctx,
    id,
  );

  if (!collaborator) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/colaboradores"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para colaboradores
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {collaborator.name}
          </h1>
        </div>
        <DeleteCollaboratorButton id={collaborator.id} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <CollaboratorForm initial={collaborator} />
      </div>
    </div>
  );
}
