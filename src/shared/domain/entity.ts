/**
 * Base para entidades de domínio — objetos com identidade estável que
 * persiste mesmo quando seus atributos mudam.
 *
 * Regra de igualdade: duas entidades são iguais se compartilham o mesmo
 * `id`, independentemente dos demais campos.
 *
 * Camada: DOMAIN (framework-agnostic).
 */
export abstract class Entity<TId> {
  protected constructor(public readonly id: TId) {}

  equals(other?: Entity<TId>): boolean {
    if (other === undefined || other === null) return false;
    if (this === other) return true;
    return this.id === other.id;
  }
}
