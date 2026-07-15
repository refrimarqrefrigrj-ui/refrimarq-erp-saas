"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireTenantContext } from "@/lib/auth/tenant";
import { createObra } from "@/modules/obras/application/create-obra";
import { updateObra } from "@/modules/obras/application/update-obra";
import { deleteObra } from "@/modules/obras/application/delete-obra";
import { drizzleObraRepository } from "@/modules/obras/infrastructure/drizzle-obra-repository";

export type ObraFormState = { error: string } | undefined;

function readInput(formData: FormData) {
  return {
    customerId: String(formData.get("customerId") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "proposta"),
    value: String(formData.get("value") ?? ""),
    location: String(formData.get("location") ?? ""),
    startDate: String(formData.get("startDate") ?? ""),
    expectedEndDate: String(formData.get("expectedEndDate") ?? ""),
    endedAt: String(formData.get("endedAt") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createObraAction(
  _prev: ObraFormState,
  formData: FormData,
): Promise<ObraFormState> {
  const ctx = await requireTenantContext();
  const result = await createObra(
    drizzleObraRepository,
    ctx,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/obras");
  redirect("/obras");
}

export async function updateObraAction(
  _prev: ObraFormState,
  formData: FormData,
): Promise<ObraFormState> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  const result = await updateObra(
    drizzleObraRepository,
    ctx,
    id,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/obras");
  redirect("/obras");
}

export async function deleteObraAction(formData: FormData): Promise<void> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  await deleteObra(drizzleObraRepository, ctx, id);

  revalidatePath("/obras");
  redirect("/obras");
}
