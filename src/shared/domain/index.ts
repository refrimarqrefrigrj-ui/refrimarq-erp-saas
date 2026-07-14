/**
 * Barrel da camada de domínio compartilhada.
 * Permite importar as primitivas com: import { Result, ok, fail } from "@/shared/domain";
 */
export * from "./app-error";
export * from "./result";
export * from "./entity";
export * from "./tenant-context";
