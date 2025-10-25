import { BaseQueryHandler } from "@/application/shared/BaseQueryHandler";
import type { ILogger } from "@/application/ports";
import type { IResourceRepository } from "@/domain";
import type { Resource } from "@/domain";
import type { Validation } from "@/shared/validation";
import { valid } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { Pipeline } from "@/shared/pipeline";
import type { IQueryHandler } from "../IQueryHandler";
import type { ListResourcesQuery } from "../ListResourcesQuery";
import type { ResourceListItemDTO } from "../dtos/ResourceListItemDTO";

interface ListResourcesContext {
  query: ListResourcesQuery;
  resources?: Resource[];
  dtos?: ResourceListItemDTO[];
}

export class ListResourcesQueryHandler
  extends BaseQueryHandler
  implements IQueryHandler<ListResourcesQuery, ResourceListItemDTO[]>
{
  constructor(
    private readonly repository: IResourceRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  async handle(
    query: ListResourcesQuery,
  ): Promise<Validation<IError[], ResourceListItemDTO[]>> {
    return (await new Pipeline<ListResourcesContext>()
      .step((ctx) => this.fetchResources(ctx))
      .step((ctx) => this.transformToDTOs(ctx))
      .execute({ query }))
      .map((ctx) => ctx.dtos!);
  }

  private async fetchResources(
    ctx: ListResourcesContext,
  ): Promise<Validation<IError[], ListResourcesContext>> {
    return this.handleInfrastructureErrors(
      await this.repository.findAll(),
      "fetch resources"
    )
      .map((resources) => ({ ...ctx, resources }));
  }

  private async transformToDTOs(
    ctx: ListResourcesContext,
  ): Promise<Validation<IError[], ListResourcesContext>> {
    return Promise.resolve(
      valid({
        ...ctx,
        dtos: ctx.resources!.map((resource) => this.toDTO(resource)),
      })
    );
  }

  private toDTO(resource: Resource): ResourceListItemDTO {
    return {
      id: resource.id.getValue(),
      namespace: resource.namespace.getValue(),
      name: resource.name.getValue(),
      secretPreview: "****",
      fieldsCount: 0,
      updatedAt: resource.updatedAt.toISOString(),
    };
  }
}
