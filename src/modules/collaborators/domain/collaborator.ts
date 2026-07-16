import { fail, ok, ValidationError, type Result } from "@/shared/domain";

/** Colaborador (equipe/técnico) — independe do banco/framework. */
export interface Collaborator {
  id: string;
  name: string;
  role: string | null;
  active: boolean;
  createdAt: Date;
}

export interface CreateCollaboratorInput {
  name: string;
  role?: string | null;
  active?: boolean;
}

export interface NormalizedCollaborator {
  name: string;
  role: string | null;
  active: boolean;
}

function clean(value?: string | null): string | null {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : null;
}

/** Valida e normaliza a entrada de um colaborador. */
export function validateCollaborator(
  input: CreateCollaboratorInput,
): Result<NormalizedCollaborator> {
  const name = clean(input.name);
  if (!name) {
    return fail(new ValidationError("Informe o nome do colaborador."));
  }
  return ok({
    name,
    role: clean(input.role),
    active: input.active ?? true,
  });
}
