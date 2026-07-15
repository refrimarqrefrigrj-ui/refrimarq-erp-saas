"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EQUIPMENT_KINDS,
  type Equipment,
} from "@/modules/equipment/domain/equipment";
import {
  createEquipmentAction,
  updateEquipmentAction,
  type EquipmentFormState,
} from "./actions";

const KIND_LABELS: Record<string, string> = {
  split: "Split",
  janela: "Janela",
  cassete: "Cassete",
  "piso-teto": "Piso-teto",
  "multi-split": "Multi-split",
  outro: "Outro",
};

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

export function EquipmentForm({
  customers,
  initial,
}: {
  customers: { id: string; name: string }[];
  initial?: Equipment;
}) {
  const isEdit = Boolean(initial);
  const action = isEdit ? updateEquipmentAction : createEquipmentAction;

  const [state, formAction, pending] = useActionState<
    EquipmentFormState,
    FormData
  >(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
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
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" name="brand" defaultValue={initial?.brand ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input id="model" name="model" defaultValue={initial?.model ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kind">Tipo</Label>
          <select
            id="kind"
            name="kind"
            defaultValue={initial?.kind ?? ""}
            className={selectClass}
          >
            <option value="">—</option>
            {EQUIPMENT_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABELS[k] ?? k}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="btus">BTUs</Label>
          <Input
            id="btus"
            name="btus"
            inputMode="numeric"
            placeholder="Ex.: 12000"
            defaultValue={initial?.btus ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serialNumber">Número de série</Label>
          <Input
            id="serialNumber"
            name="serialNumber"
            defaultValue={initial?.serialNumber ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Ambiente</Label>
          <Input
            id="location"
            name="location"
            placeholder="Ex.: Sala de reunião - 2º andar"
            defaultValue={initial?.location ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="installedAt">Data de instalação</Label>
          <Input
            id="installedAt"
            name="installedAt"
            type="date"
            defaultValue={initial?.installedAt ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="warrantyUntil">Garantia até</Label>
          <Input
            id="warrantyUntil"
            name="warrantyUntil"
            type="date"
            defaultValue={initial?.warrantyUntil ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={initial?.notes ?? ""}
        />
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
              : "Salvar equipamento"}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/equipamentos" />}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
