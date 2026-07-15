"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireTenantContext } from "@/lib/auth/tenant";
import { createTransaction } from "@/modules/finance/application/create-transaction";
import { updateTransaction } from "@/modules/finance/application/update-transaction";
import {
  deleteTransaction,
  markTransactionPaid,
} from "@/modules/finance/application/transaction-actions";
import { drizzleTransactionRepository } from "@/modules/finance/infrastructure/drizzle-transaction-repository";

export type TransactionFormState = { error: string } | undefined;

function readInput(formData: FormData) {
  return {
    direction: String(formData.get("direction") ?? "receivable"),
    description: String(formData.get("description") ?? ""),
    value: String(formData.get("value") ?? ""),
    status: String(formData.get("status") ?? "pending"),
    dueDate: String(formData.get("dueDate") ?? ""),
    category: String(formData.get("category") ?? ""),
    customerId: String(formData.get("customerId") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createTransactionAction(
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const ctx = await requireTenantContext();
  const result = await createTransaction(
    drizzleTransactionRepository,
    ctx,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/financeiro");
  redirect("/financeiro");
}

export async function updateTransactionAction(
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  const result = await updateTransaction(
    drizzleTransactionRepository,
    ctx,
    id,
    readInput(formData),
  );
  if (!result.ok) return { error: result.error.message };

  revalidatePath("/financeiro");
  redirect("/financeiro");
}

export async function deleteTransactionAction(formData: FormData): Promise<void> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  await deleteTransaction(drizzleTransactionRepository, ctx, id);

  revalidatePath("/financeiro");
  redirect("/financeiro");
}

export async function markPaidAction(formData: FormData): Promise<void> {
  const ctx = await requireTenantContext();
  const id = String(formData.get("id") ?? "");
  await markTransactionPaid(drizzleTransactionRepository, ctx, id);

  revalidatePath("/financeiro");
}
