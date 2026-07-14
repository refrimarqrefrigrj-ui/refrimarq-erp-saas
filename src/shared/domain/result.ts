import type { AppError } from "./app-error";

/**
 * Result<T, E> — resultado de uma operação que pode falhar, SEM lançar
 * exceção através das fronteiras de camada.
 *
 * Por que existe: casos de uso (camada Application) devem expor falhas de
 * negócio como valores tipados e explícitos, não como exceções escondidas.
 * Isso torna o fluxo de erro visível no tipo de retorno e impossível de
 * esquecer de tratar. (Railway-oriented programming.)
 *
 * Uso:
 *   const r = await useCase.execute(input);
 *   if (!r.ok) return handleError(r.error);
 *   doSomething(r.value);
 *
 * Camada: DOMAIN / APPLICATION (framework-agnostic).
 */
export type Result<T, E extends AppError = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Cria um resultado de sucesso. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Cria um resultado de falha. */
export function fail<E extends AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}
