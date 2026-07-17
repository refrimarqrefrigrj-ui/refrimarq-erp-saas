import { fail, ok, ValidationError, type Result } from "@/shared/domain";

export const DIRECTIONS = ["receivable", "payable"] as const;
export type TransactionDirection = (typeof DIRECTIONS)[number];

export const DIRECTION_LABELS: Record<TransactionDirection, string> = {
  receivable: "A receber",
  payable: "A pagar",
};

export type TransactionStatus = "pending" | "paid";

/** Lançamento financeiro (independe do banco/framework). Valor em centavos. */
export interface FinanceTransaction {
  id: string;
  direction: TransactionDirection;
  description: string;
  amountCents: number;
  status: TransactionStatus;
  dueDate: string | null;
  paidDate: string | null;
  category: string | null;
  customerId: string | null;
  obraId: string | null;
  /** Preenchido quando o lançamento nasceu da conclusão de uma OS. */
  serviceOrderId: string | null;
  notes: string | null;
  createdAt: Date;
}

/** Lançamento resumido para listagem (com nome do cliente, se houver). */
export interface TransactionListItem {
  id: string;
  direction: TransactionDirection;
  description: string;
  amountCents: number;
  status: TransactionStatus;
  dueDate: string | null;
  category: string | null;
  customerName: string | null;
}

export interface CreateTransactionInput {
  direction: string;
  description: string;
  value?: string | null; // texto mascarado
  status?: string | null;
  dueDate?: string | null;
  category?: string | null;
  customerId?: string | null;
  notes?: string | null;
}

export interface NormalizedTransaction {
  direction: TransactionDirection;
  description: string;
  amountCents: number;
  status: TransactionStatus;
  dueDate: string | null;
  paidDate: string | null;
  category: string | null;
  customerId: string | null;
  /** Vínculo com a OS de origem (quando gerado automaticamente). */
  serviceOrderId?: string | null;
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

function parseValueToCents(value?: string | null): number {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Data de hoje em YYYY-MM-DD (fuso local). */
export function today(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Um lançamento pendente está vencido se o vencimento já passou. */
export function isOverdue(t: {
  status: TransactionStatus;
  dueDate: string | null;
}): boolean {
  return t.status === "pending" && t.dueDate !== null && t.dueDate < today();
}

/** Valida e normaliza a entrada de um lançamento. */
export function validateTransaction(
  input: CreateTransactionInput,
): Result<NormalizedTransaction> {
  const direction = clean(input.direction) as TransactionDirection;
  if (!DIRECTIONS.includes(direction)) {
    return fail(new ValidationError("Tipo de lançamento inválido."));
  }

  const description = clean(input.description);
  if (!description) {
    return fail(new ValidationError("Informe a descrição do lançamento."));
  }

  const amountCents = parseValueToCents(input.value);
  if (amountCents <= 0) {
    return fail(new ValidationError("Informe um valor maior que zero."));
  }

  const status: TransactionStatus = input.status === "paid" ? "paid" : "pending";

  return ok({
    direction,
    description,
    amountCents,
    status,
    dueDate: cleanDate(input.dueDate),
    paidDate: status === "paid" ? today() : null,
    category: clean(input.category),
    customerId: clean(input.customerId),
    notes: clean(input.notes),
  });
}
