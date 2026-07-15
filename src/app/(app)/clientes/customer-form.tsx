"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Star, Trash2 } from "lucide-react";

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

type AddressRow = {
  key: string;
  label: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  isPrimary: boolean;
};

type ContactRow = {
  key: string;
  name: string;
  role: string;
  email: string;
  phone: string;
};

const newKey = () => Math.random().toString(36).slice(2);

function emptyAddress(isPrimary = false): AddressRow {
  return {
    key: newKey(),
    label: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    isPrimary,
  };
}

function emptyContact(): ContactRow {
  return { key: newKey(), name: "", role: "", email: "", phone: "" };
}

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

  const [addresses, setAddresses] = useState<AddressRow[]>(() =>
    initial?.addresses?.length
      ? initial.addresses.map((a) => ({
          key: newKey(),
          label: a.label ?? "",
          zipCode: maskCep(a.zipCode ?? ""),
          street: a.street ?? "",
          number: a.number ?? "",
          complement: a.complement ?? "",
          neighborhood: a.neighborhood ?? "",
          city: a.city ?? "",
          state: a.state ?? "",
          isPrimary: a.isPrimary,
        }))
      : [emptyAddress(true)],
  );

  const [contacts, setContacts] = useState<ContactRow[]>(() =>
    initial?.contacts?.length
      ? initial.contacts.map((c) => ({
          key: newKey(),
          name: c.name,
          role: c.role ?? "",
          email: c.email ?? "",
          phone: maskPhone(c.phone ?? ""),
        }))
      : [],
  );

  function updateAddress(key: string, patch: Partial<AddressRow>) {
    setAddresses((rows) =>
      rows.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }
  function setPrimary(key: string) {
    setAddresses((rows) => rows.map((r) => ({ ...r, isPrimary: r.key === key })));
  }
  function removeAddress(key: string) {
    setAddresses((rows) => {
      const next = rows.filter((r) => r.key !== key);
      if (next.length > 0 && !next.some((r) => r.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  }

  function updateContact(key: string, patch: Partial<ContactRow>) {
    setContacts((rows) =>
      rows.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="addresses" value={JSON.stringify(addresses)} />
      <input type="hidden" name="contacts" value={JSON.stringify(contacts)} />

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
          <Label htmlFor="phone">Telefone principal</Label>
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
          <Label htmlFor="email">E-mail principal</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={initial?.email ?? ""}
          />
        </div>
      </div>

      {/* Endereços */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Endereços</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddresses((r) => [...r, emptyAddress(r.length === 0)])}
          >
            <Plus className="h-4 w-4" />
            Adicionar endereço
          </Button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum endereço.</p>
        ) : null}

        {addresses.map((a) => (
          <div key={a.key} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant={a.isPrimary ? "default" : "outline"}
                size="sm"
                onClick={() => setPrimary(a.key)}
              >
                <Star className="h-4 w-4" />
                {a.isPrimary ? "Principal" : "Tornar principal"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remover endereço"
                onClick={() => removeAddress(a.key)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-6">
              <div className="space-y-2 sm:col-span-2">
                <Label>Identificação</Label>
                <Input
                  placeholder="Residencial, Obra…"
                  value={a.label}
                  onChange={(e) => updateAddress(a.key, { label: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>CEP</Label>
                <Input
                  inputMode="numeric"
                  value={a.zipCode}
                  onChange={(e) =>
                    updateAddress(a.key, { zipCode: maskCep(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-4">
                <Label>Rua</Label>
                <Input
                  value={a.street}
                  onChange={(e) => updateAddress(a.key, { street: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  value={a.number}
                  onChange={(e) => updateAddress(a.key, { number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input
                  value={a.complement}
                  onChange={(e) =>
                    updateAddress(a.key, { complement: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Bairro</Label>
                <Input
                  value={a.neighborhood}
                  onChange={(e) =>
                    updateAddress(a.key, { neighborhood: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Cidade</Label>
                <Input
                  value={a.city}
                  onChange={(e) => updateAddress(a.key, { city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>UF</Label>
                <Input
                  maxLength={2}
                  placeholder="RJ"
                  value={a.state}
                  onChange={(e) => updateAddress(a.key, { state: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Contatos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Contatos adicionais</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setContacts((r) => [...r, emptyContact()])}
          >
            <Plus className="h-4 w-4" />
            Adicionar contato
          </Button>
        </div>

        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum contato adicional.
          </p>
        ) : null}

        {contacts.map((c) => (
          <div
            key={c.key}
            className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
          >
            <div className="flex items-center justify-between sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">
                Contato
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remover contato"
                onClick={() =>
                  setContacts((rows) => rows.filter((r) => r.key !== c.key))
                }
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={c.name}
                onChange={(e) => updateContact(c.key, { name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Input
                placeholder="Gerente, Zelador…"
                value={c.role}
                onChange={(e) => updateContact(c.key, { role: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={c.email}
                onChange={(e) => updateContact(c.key, { email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                inputMode="numeric"
                value={c.phone}
                onChange={(e) =>
                  updateContact(c.key, { phone: maskPhone(e.target.value) })
                }
              />
            </div>
          </div>
        ))}
      </section>

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
