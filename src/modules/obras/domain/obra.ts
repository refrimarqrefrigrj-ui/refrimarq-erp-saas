import { fail, ok, ValidationError, type Result } from "@/shared/domain";

export const OBRA_STATUSES = [
  "proposta",
  "em_andamento",
  "concluida",
  "cancelada",
] as const;
export type ObraStatus = (typeof OBRA_STATUSES)[number];

export const OBRA_STATUS_LABELS: Record<ObraStatus, string> = {
  proposta: "Proposta",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

/** Obra corporativa (independe do banco/framework). Valor em centavos. */
export interface Obra {
  id: string;
  customerId: string;
  title: string;
  description: string | null;
  status: ObraStatus;
  valueCents: number;
  location: string | null;
  startDate: string | null;
  expectedEndDate: string | null;
  endedAt: string | null;
  notes: string | null;
  createdAt: Date;
}

/** Obra resumida para listagem (com nome do cliente). */
export interface ObraListItem {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  status: ObraStatus;
  valueCents: number;
  startDate: string | null;
  expectedEndDate: string | null;
}

export interface CreateObraInput {
  customerId: string;
  title: string;
  description?: string | null;
  status?: string | null;
  value?: string | null; // texto mascarado "150.000,00"
  location?: string | null;
  startDate?: string | null;
  expectedEndDate?: string | null;
  endedAt?: string | null;
  notes?: string | null;
}

export interface NormalizedObra {
  customerId: string;
  title: string;
  description: string | null;
  status: ObraStatus;
  valueCents: number;
  location: string | null;
  startDate: string | null;
  expectedEndDate: string | null;
  endedAt: string | null;
  notes: string | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clean(value?: string | null): string | null {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : null;
}

function cleanDate(value?: string | null): string | null {
  const v = clean(value);
  if (!v) return null;
  return DATE_RE.test(v) ? v : null;
}

/** Converte o texto mascarado de moeda em centavos (inteiro). */
function parseValueToCents(value?: string | null): number {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Valida e normaliza a entrada de uma obra. */
export function validateObra(input: CreateObraInput): Result<NormalizedObra> {
  const customerId = clean(input.customerId);
  if (!customerId) {
    return fail(new ValidationError("Selecione o cliente da obra."));
  }

  const title = clean(input.title);
  if (!title) {
    return fail(new ValidationError("Informe o título da obra."));
  }

  const status = (clean(input.status) ?? "proposta") as ObraStatus;
  if (!OBRA_STATUSES.includes(status)) {
    return fail(new ValidationError("Status inválido."));
  }

  return ok({
    customerId,
    title,
    description: clean(input.description),
    status,
    valueCents: parseValueToCents(input.value),
    location: clean(input.location),
    startDate: cleanDate(input.startDate),
    expectedEndDate: cleanDate(input.expectedEndDate),
    endedAt: cleanDate(input.endedAt),
    notes: clean(input.notes),
  });
}
