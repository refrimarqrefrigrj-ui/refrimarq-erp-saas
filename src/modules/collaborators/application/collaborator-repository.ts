import type { TenantContext } from "@/shared/domain";
import type {
  Collaborator,
  NormalizedCollaborator,
} from "../domain/collaborator";

/** Porta de persistência de colaboradores. Operações restritas ao tenant. */
export interface CollaboratorRepository {
  create(
    ctx: TenantContext,
    data: NormalizedCollaborator,
  ): Promise<Collaborator>;
  list(ctx: TenantContext, opts?: { search?: string }): Promise<Collaborator[]>;
  getById(ctx: TenantContext, id: string): Promise<Collaborator | null>;
  update(
    ctx: TenantContext,
    id: string,
    data: NormalizedCollaborator,
  ): Promise<Collaborator | null>;
  delete(ctx: TenantContext, id: string): Promise<void>;
  setActive(ctx: TenantContext, id: string, active: boolean): Promise<void>;
}
