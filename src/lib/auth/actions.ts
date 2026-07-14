"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { db } from "@/db";
import { companies, users } from "@/db/schema";
import { signIn, signOut } from "@/auth";

export type AuthActionState = { error: string } | undefined;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Cadastro: cria a EMPRESA (tenant) e o USUÁRIO dono (role admin) numa única
 * transação, e já autentica. É aqui que o multi-tenant nasce no nosso banco.
 */
export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !companyName || !email || !password) {
    return { error: "Preencha todos os campos." };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "E-mail inválido." };
  }
  if (password.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.transaction(async (tx) => {
    const [company] = await tx
      .insert(companies)
      .values({ name: companyName })
      .returning({ id: companies.id });

    await tx.insert(users).values({
      companyId: company.id,
      name,
      email,
      passwordHash,
      role: "admin",
    });
  });

  // Autentica automaticamente após o cadastro (lança redirect em caso de sucesso).
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Conta criada, mas falha ao entrar. Faça login." };
    }
    throw error; // NEXT_REDIRECT (sucesso) e demais erros seguem o fluxo normal.
  }
}

/** Login por e-mail + senha. */
export async function authenticateAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha incorretos." };
    }
    throw error; // NEXT_REDIRECT (sucesso) segue normalmente.
  }
}

/** Logout. */
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
