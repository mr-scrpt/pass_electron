import type { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type { IQuery } from "./IQuery";

export interface IQueryBus {
  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: (query: TQuery) => Promise<Validation<IError[], TResult>>,
  ): void;

  execute<TResult>(query: IQuery): Promise<Validation<IError[], TResult>>;
}
