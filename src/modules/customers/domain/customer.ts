import {
  fail,
  ok,
  ValidationError,
  type Result,
} from "@/shared/domain";
import { isValidCNPJ, isValidCPF, onlyDigits } from "./document";

export type CustomerType = "pf" | "pj";

/** Cliente como o domínio o enxerga (independe do banco/framework). */
export interface Customer {
  id: string;
  type: CustomerType;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  createdAt: Date;
}

/** Dados de entrada para criar um cliente (antes da validação). */
export interface CreateCustomerInput {
  type: CustomerType;
  name: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function clean(value?: string | null): string | null {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : null;
}

/**
 * Valida e normaliza a entrada de um novo cliente (regras de negócio puras).
 * Retorna os dados prontos para persistir, ou um erro de validação.
 */
export function validateNewCustomer(
  input: CreateCustomerInput,
): Result<CreateCustomerInput> {
  const name = clean(input.name);
  if (!name) {
    return fail(new ValidationError("Informe o nome do cliente."));
  }

  if (input.type !== "pf" && input.type !== "pj") {
    return fail(new ValidationError("Tipo de cliente inválido."));
  }

  const document = onlyDigits(input.document) || null;
  if (document) {
    const valid = input.type === "pf" ? isValidCPF(document) : isValidCNPJ(document);
    if (!valid) {
      return fail(
        new ValidationError(
          input.type === "pf" ? "CPF inválido." : "CNPJ inválido.",
        ),
      );
    }
  }

  const email = clean(input.email);
  if (email && !EMAIL_RE.test(email)) {
    return fail(new ValidationError("E-mail inválido."));
  }

  const state = clean(input.state);
  if (state && state.length !== 2) {
    return fail(new ValidationError("UF deve ter 2 letras (ex.: RJ)."));
  }

  return ok({
    type: input.type,
    name,
    document,
    email,
    phone: clean(input.phone),
    zipCode: onlyDigits(input.zipCode) || null,
    street: clean(input.street),
    number: clean(input.number),
    complement: clean(input.complement),
    neighborhood: clean(input.neighborhood),
    city: clean(input.city),
    state: state ? state.toUpperCase() : null,
    notes: clean(input.notes),
  });
}
