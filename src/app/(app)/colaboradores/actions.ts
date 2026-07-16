"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireTenantContext } from "@/lib/auth/tenant";
import {
  createCollaborator,
  updateCollaborator,
  deleteCollaborator,
  setCollaboratorActive,
} from "@/modules/collaborators/application/collaborator-usecases";
import { drizzleCollaboratorRepository } from "@/modules/collaborators/infrastructure/drizzle-collaborator-repository";

export type CollaboratorFormState = { error: string } | undefined;

function readInput(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? ""),
    active: formData.get("active") === "on",
  };
}

export async function createCollaboratorAction(
  _prev: CollaboratorFormState,
  formData: FormData,
): Promise<CollaboratorFormState> {
  const ctx = await requireTenantContext();
  const result = await createCollaborator(
    drizzleCollaboratorRepository,
    ctx,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

export async function updateCollaboratorAction(
  _prev: CollaboratorFormState,
  formData: FormData,
): Promise<CollaboratorFormState> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  const result = await updateCollaborator(
    drizzleCollaboratorRepository,
    ctx,
    id,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

export async function deleteCollaboratorAction(
  formData: FormData,
): Promise<void> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  await deleteCollaborator(drizzleCollaboratorRepository, ctx, id);

  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

/** Ativa/desativa um colaborador (o campo `active` traz o novo estado). */
export async function toggleActiveAction(formData: FormData): Promise<void> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "true") === "true";
  await setCollaboratorActive(drizzleCollaboratorRepository, ctx, id, active);

  revalidatePath("/colaboradores");
}
