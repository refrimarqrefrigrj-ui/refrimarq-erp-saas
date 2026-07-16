"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Collaborator } from "@/modules/collaborators/domain/collaborator";
import {
  createCollaboratorAction,
  updateCollaboratorAction,
  type CollaboratorFormState,
} from "./actions";

export function CollaboratorForm({ initial }: { initial?: Collaborator }) {
  const isEdit = Boolean(initial);
  const action = isEdit ? updateCollaboratorAction : createCollaboratorAction;

  const [state, formAction, pending] = useActionState<
    CollaboratorFormState,
    FormData
  >(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      {isEdit ? <input type="hidden" name="id" value={initial!.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={initial?.name ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Função</Label>
          <Input
            id="role"
            name="role"
            placeholder="Ex.: Instalador, Auxiliar, Líder Operacional"
            defaultValue={initial?.role ?? ""}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="h-4 w-4 rounded border-input accent-cyan-600"
        />
        Ativo (disponível para atendimentos)
      </label>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Salvar"}
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/colaboradores" />}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
