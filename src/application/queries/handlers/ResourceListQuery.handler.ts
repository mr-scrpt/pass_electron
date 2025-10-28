import { BaseQueryHandler } from "@/application/shared/BaseQueryHandler";
import type { ILogger } from "@/application/ports";
import type { IResourceRepository } from "@/domain";
import type { Resource } from "@/domain";
import type { Validation } from "@/shared/validation";
import { valid } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { Pipeline } from "@/shared/pipeline";
import { IQueryHandler } from "../type/IQueryHandler";
import { ResourceListQuery } from "../type/ListResourcesQuery";
import { ResourceItemListDTO } from "../dto/ResourceItemList.dto";

interface ResourceListContext {
  query: ResourceListQuery;
  resources: Resource[];
  dtos: ResourceItemListDTO[];
}

export class ResourceListQueryHandler
  extends BaseQueryHandler
  implements IQueryHandler<ResourceListQuery, ResourceItemListDTO[]>
{
  private static readonly initialContextDefaults = {
    resources: [],
    dtos: [],
  };

  constructor(
    private readonly repository: IResourceRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  async handle(
    query: ResourceListQuery,
  ): Promise<Validation<IError[], ResourceItemListDTO[]>> {
    return (
      await new Pipeline<ResourceListContext>()
        .step((ctx) => this.fetchResources(ctx))
        .criticalStep(
          (ctx) => this.transformToDTOs(ctx),
          "DTO transformation skipped due to data fetching errors",
        )
        .execute({ query, ...ResourceListQueryHandler.initialContextDefaults })
    ).map((ctx) => ctx.dtos ?? []);
  }

  private async fetchResources(
    ctx: ResourceListContext,
  ): Promise<Validation<IError[], ResourceListContext>> {
    return this.handleInfrastructureErrors(
      await this.repository.findAll(),
      "fetch resources",
    ).map((resources) => ({ ...ctx, resources }));
  }

  private transformToDTOs(
    ctx: ResourceListContext,
  ): Promise<Validation<IError[], ResourceListContext>> {
    const dtos = ctx.resources
      ? ctx.resources.map((resource) => this.toDTO(resource))
      : [];

    return Promise.resolve(
      valid({
        ...ctx,
        dtos,
      }),
    );
  }

  private toDTO(resource: Resource): ResourceItemListDTO {
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
