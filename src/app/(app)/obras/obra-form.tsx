"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { maskCurrency } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  OBRA_STATUSES,
  OBRA_STATUS_LABELS,
  type Obra,
} from "@/modules/obras/domain/obra";
import { createObraAction, updateObraAction, type ObraFormState } from "./actions";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

export function ObraForm({
  customers,
  initial,
}: {
  customers: { id: string; name: string }[];
  initial?: Obra;
}) {
  const isEdit = Boolean(initial);
  const action = isEdit ? updateObraAction : createObraAction;

  const [state, formAction, pending] = useActionState<ObraFormState, FormData>(
    action,
    undefined,
  );

  const [value, setValue] = useState(
    initial ? maskCurrency(String(initial.valueCents)) : "",
  );

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Título da obra</Label>
          <Input
            id="title"
            name="title"
            placeholder="Ex.: Climatização - Edifício Corporativo XPTO"
            defaultValue={initial?.title ?? ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerId">Cliente</Label>
          <select
            id="customerId"
            name="customerId"
            required
            defaultValue={initial?.customerId ?? ""}
            className={selectClass}
          >
            <option value="" disabled>
              Selecione o cliente
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "proposta"}
            className={selectClass}
          >
            {OBRA_STATUSES.map((s) => (
              <option key={s} value={s}>
                {OBRA_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Valor do contrato (R$)</Label>
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
          <Label htmlFor="location">Local da obra</Label>
          <Input
            id="location"
            name="location"
            defaultValue={initial?.location ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Início</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={initial?.startDate ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expectedEndDate">Previsão de conclusão</Label>
          <Input
            id="expectedEndDate"
            name="expectedEndDate"
            type="date"
            defaultValue={initial?.expectedEndDate ?? ""}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initial?.description ?? ""}
          />
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
          {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar obra"}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/obras" />}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
