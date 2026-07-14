"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireTenantContext } from "@/lib/auth/tenant";
import { createCustomer } from "@/modules/customers/application/create-customer";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import type { CustomerType } from "@/modules/customers/domain/customer";

export type CustomerFormState = { error: string } | undefined;

/** Server action: cadastra um cliente e volta para a listagem. */
export async function createCustomerAction(
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const ctx = await requireTenantContext();

  const type = (String(formData.get("type") ?? "pf") as CustomerType) || "pf";

  const result = await createCustomer(drizzleCustomerRepository, ctx, {
    type,
    name: String(formData.get("name") ?? ""),
    document: String(formData.get("document") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    zipCode: String(formData.get("zipCode") ?? ""),
    street: String(formData.get("street") ?? ""),
    number: String(formData.get("number") ?? ""),
    complement: String(formData.get("complement") ?? ""),
    neighborhood: String(formData.get("neighborhood") ?? ""),
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) {
    return { error: result.error.message };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}
