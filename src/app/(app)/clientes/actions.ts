"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireTenantContext } from "@/lib/auth/tenant";
import { createCustomer } from "@/modules/customers/application/create-customer";
import { updateCustomer } from "@/modules/customers/application/update-customer";
import { deleteCustomer } from "@/modules/customers/application/delete-customer";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import type {
  AddressInput,
  ContactInput,
  CustomerType,
} from "@/modules/customers/domain/customer";

export type CustomerFormState = { error: string } | undefined;

function parseJsonArray<T>(formData: FormData, key: string): T[] {
  try {
    const raw = formData.get(key);
    const parsed = raw ? JSON.parse(String(raw)) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function readInput(formData: FormData) {
  return {
    type: (String(formData.get("type") ?? "pf") as CustomerType) || "pf",
    name: String(formData.get("name") ?? ""),
    document: String(formData.get("document") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    addresses: parseJsonArray<AddressInput>(formData, "addresses"),
    contacts: parseJsonArray<ContactInput>(formData, "contacts"),
  };
}

/** Cadastra um cliente e volta para a listagem. */
export async function createCustomerAction(
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const ctx = await requireTenantContext();
  const result = await createCustomer(
    drizzleCustomerRepository,
    ctx,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/clientes");
  redirect("/clientes");
}

/** Atualiza um cliente e volta para a listagem. */
export async function updateCustomerAction(
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  const result = await updateCustomer(
    drizzleCustomerRepository,
    ctx,
    id,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/clientes");
  redirect("/clientes");
}

/** Exclui um cliente e volta para a listagem. */
export async function deleteCustomerAction(formData: FormData): Promise<void> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  await deleteCustomer(drizzleCustomerRepository, ctx, id);

  revalidatePath("/clientes");
  redirect("/clientes");
}
