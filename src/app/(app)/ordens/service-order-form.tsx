"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { maskCurrency } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  OS_STATUSES,
  OS_STATUS_LABELS,
  OS_TYPES,
  OS_TYPE_LABELS,
  type ServiceOrder,
} from "@/modules/service-orders/domain/service-order";
import {
  createServiceOrderAction,
  updateServiceOrderAction,
  type ServiceOrderFormState,
} from "./actions";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

export function ServiceOrderForm({
  customers,
  equipmentOptions,
  collaborators,
  initial,
}: {
  customers: { id: string; name: string }[];
  equipmentOptions: { id: string; label: string }[];
  collaborators: { id: string; name: string }[];
  initial?: ServiceOrder;
}) {
  const isEdit = Boolean(initial);
  const action = isEdit ? updateServiceOrderAction : createServiceOrderAction;

  const [state, formAction, pending] = useActionState<
    ServiceOrderFormState,
    FormData
  >(action, undefined);

  const [value, setValue] = useState(
    initial ? maskCurrency(String(initial.valueCents)) : "",
  );

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            name="type"
            defaultValue={initial?.type ?? "manutencao"}
            className={selectClass}
          >
            {OS_TYPES.map((t) => (
              <option key={t} value={t}>
                {OS_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={initial?.status ?? "aberta"}
            className={selectClass}
          >
            {OS_STATUSES.map((s) => (
              <option key={s} value={s}>
                {OS_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
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
          <Label htmlFor="collaboratorId">Técnico responsável</Label>
          <select
            id="collaboratorId"
            name="collaboratorId"
            defaultValue={initial?.collaboratorId ?? ""}
            className={selectClass}
          >
            <option value="">— Não atribuído —</option>
            {collaborators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="equipmentId">Equipamento (opcional)</Label>
          <select
            id="equipmentId"
            name="equipmentId"
            defaultValue={initial?.equipmentId ?? ""}
            className={selectClass}
          >
            <option value="">— Nenhum —</option>
            {equipmentOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledFor">Agendada para</Label>
          <Input
            id="scheduledFor"
            name="scheduledFor"
            type="date"
            defaultValue={initial?.scheduledFor ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valor do serviço (R$)</Label>
          <Input
            id="value"
            name="value"
            inputMode="numeric"
            placeholder="0,00"
            value={value}
            onChange={(e) => setValue(maskCurrency(e.target.value))}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição / problema relatado</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initial?.description ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="solution">Solução / laudo técnico</Label>
          <Textarea
            id="solution"
            name="solution"
            rows={3}
            defaultValue={initial?.solution ?? ""}
          />
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Abrir OS"}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/ordens" />}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
