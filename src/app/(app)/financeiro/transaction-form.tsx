"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { maskCurrency } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DIRECTIONS,
  DIRECTION_LABELS,
  type FinanceTransaction,
  type TransactionDirection,
} from "@/modules/finance/domain/transaction";
import {
  createTransactionAction,
  updateTransactionAction,
  type TransactionFormState,
} from "./actions";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

export function TransactionForm({
  customers,
  initial,
  defaultDirection = "receivable",
}: {
  customers: { id: string; name: string }[];
  initial?: FinanceTransaction;
  defaultDirection?: TransactionDirection;
}) {
  const isEdit = Boolean(initial);
  const action = isEdit ? updateTransactionAction : createTransactionAction;

  const [state, formAction, pending] = useActionState<
    TransactionFormState,
    FormData
  >(action, undefined);

  const [direction, setDirection] = useState<TransactionDirection>(
    initial?.direction ?? defaultDirection,
  );
  const [value, setValue] = useState(
    initial ? maskCurrency(String(initial.amountCents)) : "",
  );

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}
      <input type="hidden" name="direction" value={direction} />

      {/* A receber / A pagar */}
      <div className="inline-flex rounded-lg border p-1">
        {DIRECTIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              direction === d
                ? d === "receivable"
                  ? "bg-emerald-600 text-white"
                  : "bg-destructive text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {DIRECTION_LABELS[d]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            name="description"
            placeholder="Ex.: Instalação split - Cliente X"
            defaultValue={initial?.description ?? ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valor (R$)</Label>
          <Input
            id="value"
            name="value"
            inputMode="numeric"
            placeholder="0,00"
            value={value}
            onChange={(e) => setValue(maskCurrency(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Vencimento</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={initial?.dueDate ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "pending"}
            className={selectClass}
          >
            <option value="pending">Pendente</option>
            <option value="paid">
              {direction === "receivable" ? "Recebido" : "Pago"}
            </option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoria / centro de custo</Label>
          <Input
            id="category"
            name="category"
            placeholder="Ex.: Serviços, Peças, Salários"
            defaultValue={initial?.category ?? ""}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="customerId">Cliente (opcional)</Label>
          <select
            id="customerId"
            name="customerId"
            defaultValue={initial?.customerId ?? ""}
            className={selectClass}
          >
            <option value="">— Nenhum —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={initial?.notes ?? ""}
          />
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Salvando..."
            : isEdit
              ? "Salvar alterações"
              : "Salvar lançamento"}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/financeiro" />}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
