import type { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import type {
  ListResourcesQuery,
  ResourceItemListDTO,
} from "@/application/queries";
import { IQueryBus } from "@/application/queries/type/IQueryBus";

export class QueryFacade {
  constructor(private readonly queryBus: IQueryBus) {}

  async list(): Promise<Validation<IError[], ResourceItemListDTO[]>> {
    const query: ListResourcesQuery = { type: "ListResourcesQuery" };
    return this.queryBus.execute<ResourceItemListDTO[]>(query);
  }
}
