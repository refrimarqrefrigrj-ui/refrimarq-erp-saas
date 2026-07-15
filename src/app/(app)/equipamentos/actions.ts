"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireTenantContext } from "@/lib/auth/tenant";
import { createEquipment } from "@/modules/equipment/application/create-equipment";
import { updateEquipment } from "@/modules/equipment/application/update-equipment";
import { deleteEquipment } from "@/modules/equipment/application/delete-equipment";
import { drizzleEquipmentRepository } from "@/modules/equipment/infrastructure/drizzle-equipment-repository";

export type EquipmentFormState = { error: string } | undefined;

function readInput(formData: FormData) {
  return {
    customerId: String(formData.get("customerId") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    model: String(formData.get("model") ?? ""),
    kind: String(formData.get("kind") ?? ""),
    btus: String(formData.get("btus") ?? ""),
    serialNumber: String(formData.get("serialNumber") ?? ""),
    location: String(formData.get("location") ?? ""),
    installedAt: String(formData.get("installedAt") ?? ""),
    warrantyUntil: String(formData.get("warrantyUntil") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createEquipmentAction(
  _prev: EquipmentFormState,
  formData: FormData,
): Promise<EquipmentFormState> {
  const ctx = await requireTenantContext();
  const result = await createEquipment(
    drizzleEquipmentRepository,
    ctx,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/equipamentos");
  redirect("/equipamentos");
}

export async function updateEquipmentAction(
  _prev: EquipmentFormState,
  formData: FormData,
): Promise<EquipmentFormState> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  const result = await updateEquipment(
    drizzleEquipmentRepository,
    ctx,
    id,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/equipamentos");
  redirect("/equipamentos");
}

export async function deleteEquipmentAction(formData: FormData): Promise<void> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  await deleteEquipment(drizzleEquipmentRepository, ctx, id);

  revalidatePath("/equipamentos");
  redirect("/equipamentos");
}
