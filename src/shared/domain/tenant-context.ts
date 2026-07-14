/**
 * TenantContext — "quem está fazendo esta requisição" num sistema
 * multi-tenant (multiempresa).
 *
 * REGRA DE OURO: todo caso de uso que toca dados de tenant DEVE receber
 * um TenantContext. É a garantia, no nível da aplicação, de que dados
 * nunca vazam entre empresas. No nível do banco, a mesma regra é reforçada
 * por Row Level Security (defesa em profundidade).
 *
 * Hierarquia de dados do produto:
 *   Empresa (tenant)  ->  Filial (branch)  ->  Dados operacionais
 *
 * Campos:
 * - tenantId: a empresa dona dos dados (obrigatório sempre).
 * - branchId: a filial específica. Pode ser null para dados da empresa
 *             inteira ou para empresas que não usam múltiplas filiais.
 * - userId:   o usuário autenticado que executa a ação.
 * - role:     papel do usuário, usado pela camada de RBAC.
 *
 * Camada: DOMAIN (framework-agnostic).
 */
export type Role = "admin" | "staff" | "technician";

export interface TenantContext {
  readonly tenantId: string;
  readonly branchId: string | null;
  readonly userId: string;
  readonly role: Role;
}
