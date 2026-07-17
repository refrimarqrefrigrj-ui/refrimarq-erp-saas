import { fail, ok, ValidationError, type Result } from "@/shared/domain";

export const OS_TYPES = [
  "instalacao",
  "manutencao",
  "limpeza",
  "reparo",
] as const;
export type ServiceOrderType = (typeof OS_TYPES)[number];
export const OS_TYPE_LABELS: Record<ServiceOrderType, string> = {
  instalacao: "Instalação",
  manutencao: "Manutenção",
  limpeza: "Limpeza",
  reparo: "Reparo",
};

export const OS_STATUSES = [
  "aberta",
  "agendada",
  "em_andamento",
  "concluida",
  "cancelada",
] as const;
export type ServiceOrderStatus = (typeof OS_STATUSES)[number];
export const OS_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  aberta: "Aberta",
  agendada: "Agendada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

/** Ordem de serviço (independe do banco/framework). Valor em centavos. */
export interface ServiceOrder {
  id: string;
  number: number;
  customerId: string;
  equipmentId: string | null;
  collaboratorId: string | null;
  type: ServiceOrderType;
  status: ServiceOrderStatus;
  scheduledFor: string | null;
  description: string | null;
  solution: string | null;
  valueCents: number;
  createdAt: Date;
}

/** OS resumida para a listagem (com nomes de cliente e técnico). */
export interface ServiceOrderListItem {
  id: string;
  number: number;
  customerName: string;
  collaboratorName: string | null;
  type: ServiceOrderType;
  status: ServiceOrderStatus;
  scheduledFor: string | null;
  valueCents: number;
  createdAt: Date;
}

/** Item do histórico de serviço (OS concluída). */
export interface ServiceOrderHistoryItem {
  id: string;
  number: number;
  customerName: string;
  collaboratorName: string | null;
  type: ServiceOrderType;
  closedAt: Date | null;
  valueCents: number;
}

/** Histórico de serviço com os totais do período. */
export interface ServiceOrderHistory {
  count: number;
  totalCents: number;
  /** Ticket médio = total / quantidade. */
  averageCents: number;
  items: ServiceOrderHistoryItem[];
}

export interface CreateServiceOrderInput {
  customerId: string;
  equipmentId?: string | null;
  collaboratorId?: string | null;
  type: string;
  status?: string | null;
  scheduledFor?: string | null;
  description?: string | null;
  solution?: string | null;
  value?: string | null; // texto mascarado
}

export interface NormalizedServiceOrder {
  customerId: string;
  equipmentId: string | null;
  collaboratorId: string | null;
  type: ServiceOrderType;
  status: ServiceOrderStatus;
  scheduledFor: string | null;
  description: string | null;
  solution: string | null;
  valueCents: number;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clean(value?: string | null): string | null {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : null;
}
function cleanDate(value?: string | null): string | null {
  const v = clean(value);
  return v && DATE_RE.test(v) ? v : null;
}
function parseValueToCents(value?: string | null): number {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Valida e normaliza a entrada de uma OS. */
export function validateServiceOrder(
  input: CreateServiceOrderInput,
): Result<NormalizedServiceOrder> {
  const customerId = clean(input.customerId);
  if (!customerId) {
    return fail(new ValidationError("Selecione o cliente da OS."));
  }

  const type = clean(input.type) as ServiceOrderType;
  if (!OS_TYPES.includes(type)) {
    return fail(new ValidationError("Tipo de OS inválido."));
  }

  const status = (clean(input.status) ?? "aberta") as ServiceOrderStatus;
  if (!OS_STATUSES.includes(status)) {
    return fail(new ValidationError("Status inválido."));
  }

  return ok({
    customerId,
    equipmentId: clean(input.equipmentId),
    collaboratorId: clean(input.collaboratorId),
    type,
    status,
    scheduledFor: cleanDate(input.scheduledFor),
    description: clean(input.description),
    solution: clean(input.solution),
    valueCents: parseValueToCents(input.value),
  });
}
