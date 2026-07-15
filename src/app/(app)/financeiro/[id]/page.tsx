import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { getTransaction } from "@/modules/finance/application/get-transaction";
import { drizzleTransactionRepository } from "@/modules/finance/infrastructure/drizzle-transaction-repository";
import { listCustomers } from "@/modules/customers/application/list-customers";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import { TransactionForm } from "../transaction-form";
import { DeleteTransactionButton } from "../delete-transaction-button";

export default async function EditLancamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireTenantContext();

  const [transaction, customers] = await Promise.all([
    getTransaction(drizzleTransactionRepository, ctx, id),
    listCustomers(drizzleCustomerRepository, ctx),
  ]);

  if (!transaction) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/financeiro"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o financeiro
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {transaction.description}
          </h1>
        </div>
        <DeleteTransactionButton id={transaction.id} />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <TransactionForm
          customers={customers.map((c) => ({ id: c.id, name: c.name }))}
          initial={transaction}
        />
      </div>
    </div>
  );
}
