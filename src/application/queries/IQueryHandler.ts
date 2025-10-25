// src/application/queries/IQueryHandler.ts
import { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type { IQuery } from "./IQuery";

/**
 * Базовый интерфейс для Query Handler (v2.0 - IError)
 *
 * @template Q - тип Query
 * @template R - тип результата (обычно DTO)
 */
export interface IQueryHandler<Q extends IQuery = IQuery, R = unknown> {
  handle(query: Q): Promise<Validation<IError[], R>>;
}
