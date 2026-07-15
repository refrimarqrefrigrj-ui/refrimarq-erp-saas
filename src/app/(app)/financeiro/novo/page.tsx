import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireTenantContext } from "@/lib/auth/tenant";
import { listCustomers } from "@/modules/customers/application/list-customers";
import { drizzleCustomerRepository } from "@/modules/customers/infrastructure/drizzle-customer-repository";
import {
  DIRECTIONS,
  type TransactionDirection,
} from "@/modules/finance/domain/transaction";
import { TransactionForm } from "../transaction-form";

export default async function NovoLancamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const ctx = await requireTenantContext();
  const customers = await listCustomers(drizzleCustomerRepository, ctx);

  const defaultDirection: TransactionDirection = DIRECTIONS.includes(
    tipo as TransactionDirection,
  )
    ? (tipo as TransactionDirection)
    : "receivable";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href="/financeiro"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o financeiro
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Novo lançamento
        </h1>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <TransactionForm
          customers={customers.map((c) => ({ id: c.id, name: c.name }))}
          defaultDirection={defaultDirection}
        />
      </div>
    </div>
  );
}
