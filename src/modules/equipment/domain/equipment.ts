import { fail, ok, ValidationError, type Result } from "@/shared/domain";

export const EQUIPMENT_KINDS = [
  "split",
  "janela",
  "cassete",
  "piso-teto",
  "multi-split",
  "outro",
] as const;
export type EquipmentKind = (typeof EQUIPMENT_KINDS)[number];

/** Equipamento de ar-condicionado (independe do banco/framework). */
export interface Equipment {
  id: string;
  customerId: string;
  brand: string | null;
  model: string | null;
  kind: string | null;
  btus: number | null;
  serialNumber: string | null;
  location: string | null;
  installedAt: string | null; // YYYY-MM-DD
  warrantyUntil: string | null;
  notes: string | null;
  createdAt: Date;
}

/** Equipamento resumido para listagem (com o nome do cliente). */
export interface EquipmentListItem {
  id: string;
  customerId: string;
  customerName: string;
  brand: string | null;
  model: string | null;
  kind: string | null;
  btus: number | null;
  location: string | null;
}

export interface CreateEquipmentInput {
  customerId: string;
  brand?: string | null;
  model?: string | null;
  kind?: string | null;
  btus?: string | number | null;
  serialNumber?: string | null;
  location?: string | null;
  installedAt?: string | null;
  warrantyUntil?: string | null;
  notes?: string | null;
}

export interface NormalizedEquipment {
  customerId: string;
  brand: string | null;
  model: string | null;
  kind: string | null;
  btus: number | null;
  serialNumber: string | null;
  location: string | null;
  installedAt: string | null;
  warrantyUntil: string | null;
  notes: string | null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clean(value?: string | null): string | null {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : null;
}

function parseBtus(value?: string | number | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n =
    typeof value === "number"
      ? value
      : parseInt(String(value).replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function cleanDate(value?: string | null): string | null {
  const v = clean(value);
  if (!v) return null;
  return DATE_RE.test(v) ? v : null;
}

/** Valida e normaliza a entrada de um equipamento. */
export function validateEquipment(
  input: CreateEquipmentInput,
): Result<NormalizedEquipment> {
  const customerId = clean(input.customerId);
  if (!customerId) {
    return fail(new ValidationError("Selecione o cliente do equipamento."));
  }

  const brand = clean(input.brand);
  const model = clean(input.model);
  if (!brand && !model) {
    return fail(
      new ValidationError("Informe ao menos a marca ou o modelo do equipamento."),
    );
  }

  return ok({
    customerId,
    brand,
    model,
    kind: clean(input.kind),
    btus: parseBtus(input.btus),
    serialNumber: clean(input.serialNumber),
    location: clean(input.location),
    installedAt: cleanDate(input.installedAt),
    warrantyUntil: cleanDate(input.warrantyUntil),
    notes: clean(input.notes),
  });
}
