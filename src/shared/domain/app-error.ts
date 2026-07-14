/**
 * Erros esperados (de negócio) do sistema.
 *
 * NÃO são bugs — representam violações de regra de negócio, falhas de
 * validação ou de autorização que a aplicação trata graciosamente.
 * Cada erro carrega um `code` estável (para o front/i18n reagir) e um
 * `httpStatus` (para a camada de entrada — route handlers — responder).
 *
 * Bugs de verdade (falha inesperada) continuam sendo `Error`/exceção comum.
 *
 * Camada: DOMAIN (não depende de framework nenhum).
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

/** Dados de entrada inválidos (falha de validação de regra de negócio). */
export class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
  readonly httpStatus = 422;
}

/** Recurso não encontrado dentro do escopo do tenant. */
export class NotFoundError extends AppError {
  readonly code = "NOT_FOUND";
  readonly httpStatus = 404;
}

/** Usuário não autenticado. */
export class UnauthorizedError extends AppError {
  readonly code = "UNAUTHORIZED";
  readonly httpStatus = 401;
}

/** Usuário autenticado, mas sem permissão para a ação (RBAC). */
export class ForbiddenError extends AppError {
  readonly code = "FORBIDDEN";
  readonly httpStatus = 403;
}

/** Conflito de estado (ex.: registro duplicado, versão desatualizada). */
export class ConflictError extends AppError {
  readonly code = "CONFLICT";
  readonly httpStatus = 409;
}

/** Type guard para diferenciar erros de negócio de bugs inesperados. */
export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
