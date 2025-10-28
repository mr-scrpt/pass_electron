import type { Validation } from "@/shared/validation";
import { invalid } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { InfrastructureError } from "@/shared/errors";
import { IQueryBus, IQuery } from "@/application";

export class InMemoryQueryBus implements IQueryBus {
  private readonly handlers = new Map<
    string,
    (query: IQuery) => Promise<Validation<IError[], unknown>>
  >();

  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: (query: TQuery) => Promise<Validation<IError[], TResult>>,
  ): void {
    this.handlers.set(
      queryType,
      handler as (query: IQuery) => Promise<Validation<IError[], unknown>>,
    );
  }

  async execute<TResult>(
    query: IQuery,
  ): Promise<Validation<IError[], TResult>> {
    const handler = this.handlers.get(query.type);

    if (!handler) {
      return invalid([
        new InfrastructureError(
          "QueryBus",
          `No handler registered for query type: ${query.type}`,
          { queryType: query.type },
        ),
      ]);
    }

    return handler(query) as Promise<Validation<IError[], TResult>>;
  }
}
