import {
  fail,
  ok,
  ValidationError,
  type Result,
} from "@/shared/domain";
import { isValidCNPJ, isValidCPF, onlyDigits } from "./document";

export type CustomerType = "pf" | "pj";

export interface CustomerAddress {
  id?: string;
  label: string | null;
  zipCode: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  isPrimary: boolean;
}

export interface CustomerContact {
  id?: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
}

/** Cliente como o domínio o enxerga (independe do banco/framework). */
export interface Customer {
  id: string;
  type: CustomerType;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  addresses: CustomerAddress[];
  contacts: CustomerContact[];
  createdAt: Date;
}

/** Cliente resumido para a listagem (com cidade do endereço principal). */
export interface CustomerListItem {
  id: string;
  type: CustomerType;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  primaryCity: string | null;
  primaryState: string | null;
}

export interface AddressInput {
  label?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  isPrimary?: boolean;
}

export interface ContactInput {
  name?: string | null;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface CreateCustomerInput {
  type: CustomerType;
  name: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  addresses?: AddressInput[];
  contacts?: ContactInput[];
}

/** Saída validada e normalizada, pronta para o repositório persistir. */
export interface NormalizedCustomer {
  type: CustomerType;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  addresses: CustomerAddress[];
  contacts: CustomerContact[];
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function clean(value?: string | null): string | null {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : null;
}

function normalizeAddresses(
  input: AddressInput[] | undefined,
): Result<CustomerAddress[]> {
  const rows: CustomerAddress[] = [];

  for (const a of input ?? []) {
    const address: CustomerAddress = {
      label: clean(a.label),
      zipCode: onlyDigits(a.zipCode) || null,
      street: clean(a.street),
      number: clean(a.number),
      complement: clean(a.complement),
      neighborhood: clean(a.neighborhood),
      city: clean(a.city),
      state: clean(a.state),
      isPrimary: Boolean(a.isPrimary),
    };

    // Ignora linhas totalmente vazias.
    const hasContent =
      address.street || address.city || address.zipCode || address.neighborhood;
    if (!hasContent) continue;

    if (address.state && address.state.length !== 2) {
      return fail(new ValidationError("UF deve ter 2 letras (ex.: RJ)."));
    }
    address.state = address.state ? address.state.toUpperCase() : null;
    rows.push(address);
  }

  // Garante exatamente um endereço principal.
  if (rows.length > 0) {
    const firstPrimary = rows.findIndex((r) => r.isPrimary);
    rows.forEach((r, i) => {
      r.isPrimary = i === (firstPrimary >= 0 ? firstPrimary : 0);
    });
  }

  return ok(rows);
}

function normalizeContacts(
  input: ContactInput[] | undefined,
): Result<CustomerContact[]> {
  const rows: CustomerContact[] = [];

  for (const c of input ?? []) {
    const name = clean(c.name);
    const email = clean(c.email);
    const phone = clean(c.phone);
    const role = clean(c.role);

    // Ignora linhas totalmente vazias.
    if (!name && !email && !phone && !role) continue;

    if (!name) {
      return fail(new ValidationError("Informe o nome de cada contato."));
    }
    if (email && !EMAIL_RE.test(email)) {
      return fail(new ValidationError(`E-mail inválido no contato "${name}".`));
    }
    rows.push({ name, role, email, phone });
  }

  return ok(rows);
}

/**
 * Valida e normaliza a entrada de um cliente (regras de negócio puras).
 */
export function validateNewCustomer(
  input: CreateCustomerInput,
): Result<NormalizedCustomer> {
  const name = clean(input.name);
  if (!name) {
    return fail(new ValidationError("Informe o nome do cliente."));
  }

  if (input.type !== "pf" && input.type !== "pj") {
    return fail(new ValidationError("Tipo de cliente inválido."));
  }

  const document = onlyDigits(input.document) || null;
  if (document) {
    const valid =
      input.type === "pf" ? isValidCPF(document) : isValidCNPJ(document);
    if (!valid) {
      return fail(
        new ValidationError(input.type === "pf" ? "CPF inválido." : "CNPJ inválido."),
      );
    }
  }

  const email = clean(input.email);
  if (email && !EMAIL_RE.test(email)) {
    return fail(new ValidationError("E-mail inválido."));
  }

  const addresses = normalizeAddresses(input.addresses);
  if (!addresses.ok) return addresses;

  const contacts = normalizeContacts(input.contacts);
  if (!contacts.ok) return contacts;

  return ok({
    type: input.type,
    name,
    document,
    email,
    phone: clean(input.phone),
    notes: clean(input.notes),
    addresses: addresses.value,
    contacts: contacts.value,
  });
}
