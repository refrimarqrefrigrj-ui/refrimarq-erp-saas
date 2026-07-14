import { auth } from "@/auth";
import { UnauthorizedError, type Role, type TenantContext } from "@/shared/domain";

/**
 * Deriva o TenantContext (quem/qual empresa) a partir da sessão do Auth.js.
 * Retorna null se não houver sessão válida.
 */
export async function getTenantContext(): Promise<TenantContext | null> {
  const session = await auth();
  if (!session?.user) return null;

  return {
    tenantId: session.user.companyId,
    branchId: null,
    userId: session.user.id,
    role: session.user.role as Role,
  };
}

/**
 * Igual ao anterior, mas lança se não houver sessão. Use em casos de uso e
 * server actions que exigem um usuário autenticado.
 */
export async function requireTenantContext(): Promise<TenantContext> {
  const ctx = await getTenantContext();
  if (!ctx) {
    throw new UnauthorizedError("Sessão inválida ou expirada.");
  }
  return ctx;
}
