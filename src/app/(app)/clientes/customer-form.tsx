"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { maskCep, maskCpfCnpj, maskPhone } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Customer, CustomerType } from "@/modules/customers/domain/customer";
import {
  createCustomerAction,
  updateCustomerAction,
  type CustomerFormState,
} from "./actions";

export function CustomerForm({ initial }: { initial?: Customer }) {
  const isEdit = Boolean(initial);
  const action = isEdit ? updateCustomerAction : createCustomerAction;

  const [state, formAction, pending] = useActionState<
    CustomerFormState,
    FormData
  >(action, undefined);

  const [type, setType] = useState<CustomerType>(initial?.type ?? "pf");
  const [document, setDocument] = useState(maskCpfCnpj(initial?.document ?? ""));
  const [phone, setPhone] = useState(maskPhone(initial?.phone ?? ""));
  const [zipCode, setZipCode] = useState(maskCep(initial?.zipCode ?? ""));

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}
      <input type="hidden" name="type" value={type} />

      {/* Seletor PF / PJ */}
      <div className="inline-flex rounded-lg border p-1">
        {(
          [
            ["pf", "Pessoa Física"],
            ["pj", "Pessoa Jurídica"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              type === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dados principais */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">
            {type === "pf" ? "Nome completo" : "Razão social"}
          </Label>
          <Input id="name" name="name" defaultValue={initial?.name ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">{type === "pf" ? "CPF" : "CNPJ"}</Label>
          <Input
            id="document"
            name="document"
            inputMode="numeric"
            value={document}
            onChange={(e) => setDocument(maskCpfCnpj(e.target.value))}
            placeholder={type === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            placeholder="(21) 90000-0000"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
          />
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              name="zipCode"
              inputMode="numeric"
              value={zipCode}
              onChange={(e) => setZipCode(maskCep(e.target.value))}
            />
          </div>
          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="street">Rua</Label>
            <Input id="street" name="street" defaultValue={initial?.street ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input id="number" name="number" defaultValue={initial?.number ?? ""} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              name="complement"
              defaultValue={initial?.complement ?? ""}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              name="neighborhood"
              defaultValue={initial?.neighborhood ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" name="city" defaultValue={initial?.city ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">UF</Label>
            <Input
              id="state"
              name="state"
              maxLength={2}
              placeholder="RJ"
              defaultValue={initial?.state ?? ""}
            />
          </div>
        </div>
      </div>

      {/* Observações */}
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
              : "Salvar cliente"}
        </Button>
        <Button variant="outline" render={<Link href="/clientes" />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
