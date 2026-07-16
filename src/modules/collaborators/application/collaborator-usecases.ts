import {
  fail,
  NotFoundError,
  ok,
  type Result,
  type TenantContext,
} from "@/shared/domain";
import {
  validateCollaborator,
  type Collaborator,
  type CreateCollaboratorInput,
} from "../domain/collaborator";
import type { CollaboratorRepository } from "./collaborator-repository";

export async function createCollaborator(
  repo: CollaboratorRepository,
  ctx: TenantContext,
  input: CreateCollaboratorInput,
): Promise<Result<Collaborator>> {
  const validated = validateCollaborator(input);
  if (!validated.ok) return validated;
  return ok(await repo.create(ctx, validated.value));
}

export async function listCollaborators(
  repo: CollaboratorRepository,
  ctx: TenantContext,
  opts?: { search?: string },
): Promise<Collaborator[]> {
  return repo.list(ctx, opts);
}

export async function getCollaborator(
  repo: CollaboratorRepository,
  ctx: TenantContext,
  id: string,
): Promise<Collaborator | null> {
  return repo.getById(ctx, id);
}

export async function updateCollaborator(
  repo: CollaboratorRepository,
  ctx: TenantContext,
  id: string,
  input: CreateCollaboratorInput,
): Promise<Result<Collaborator>> {
  const validated = validateCollaborator(input);
  if (!validated.ok) return validated;
  const updated = await repo.update(ctx, id, validated.value);
  if (!updated) return fail(new NotFoundError("Colaborador não encontrado."));
  return ok(updated);
}

export async function deleteCollaborator(
  repo: CollaboratorRepository,
  ctx: TenantContext,
  id: string,
): Promise<void> {
  await repo.delete(ctx, id);
}

export async function setCollaboratorActive(
  repo: CollaboratorRepository,
  ctx: TenantContext,
  id: string,
  active: boolean,
): Promise<void> {
  await repo.setActive(ctx, id, active);
}
