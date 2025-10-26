import type { Validation } from '@/shared/validation'
import type { IError } from '@/shared/errors'
import type { IQueryBus } from '@/application/queries/IQueryBus'
import type { ListResourcesQuery } from '@/application/queries'
import type { ResourceListItemDTO } from '@/application/queries/dtos'

/**
 * Query Facade - unified API для queries
 * 
 * Использует Query Bus для выполнения queries
 */
export class QueryFacade {
  constructor(
    private readonly queryBus: IQueryBus
  ) {}

  async list(): Promise<Validation<IError[], ResourceListItemDTO[]>> {
    const query: ListResourcesQuery = { type: 'ListResourcesQuery' }
    return this.queryBus.execute<ResourceListItemDTO[]>(query)
  }
}
