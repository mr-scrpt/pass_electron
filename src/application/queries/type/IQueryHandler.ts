import type { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type { IQuery } from "./IQuery";

export interface IQueryHandler<Q extends IQuery = IQuery, R = unknown> {
  handle(query: Q): Promise<Validation<IError[], R>>;
}
