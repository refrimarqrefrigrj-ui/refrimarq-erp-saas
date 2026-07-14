import type { TenantContext } from "@/shared/domain";

/**
 * AuthGateway — porta (interface) que a aplicação usa para descobrir QUEM
 * está autenticado e em QUAL empresa/filial, SEM conhecer o provedor de auth.
 *
 * A implementação concreta (ex.: ClerkAuthGateway) vive ao lado, em
 * `infrastructure/auth/`, e traduz o provedor externo para o nosso
 * `TenantContext`. Trocar de provedor de autenticação = trocar apenas a
 * implementação desta interface, sem tocar em domínio ou casos de uso.
 *
 * Camada: SHARED / INFRASTRUCTURE (porta). Ver docs/ARCHITECTURE.md.
 */
export interface AuthGateway {
  /**
   * Contexto do usuário autenticado no request atual, ou `null` se não houver
   * sessão válida. Quem chama decide o que fazer com o `null` (ex.: redirecionar
   * para /login ou responder 401).
   */
  getCurrentContext(): Promise<TenantContext | null>;
}
