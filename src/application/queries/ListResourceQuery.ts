// src/application/queries/ListResourcesQuery.ts
import type { IQuery } from "./IQuery";

/**
 * Query: Получить список всех ресурсов
 *
 * Пустой Query (без параметров) - возвращает все ресурсы
 */
export class ListResourcesQuery implements IQuery {
  readonly type = "ListResourcesQuery";
}
