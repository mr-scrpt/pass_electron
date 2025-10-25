import { BaseCommandHandler } from "@/application/shared/BaseCommandHandler";
import type { ILogger } from "@/application/ports";
import type { IResourceRepository } from "@/domain";
import { Resource, Namespace, ResourceName } from "@/domain";
import type { Validation } from "@/shared/validation";
import { fromCondition } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { DuplicateError } from "@/shared/errors";
import { Pipeline } from "@/shared/pipeline";
import type { CreateContext } from "@/application/shared";
import type { ICommandHandler } from "../ICommandHandler";
import type { CreateResourceCommand } from "../CreateResourceCommand";

interface CreateResourceContext
  extends CreateContext<CreateResourceCommand, Resource> {
  existingResources?: Resource[];
}

export class CreateResourceCommandHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateResourceCommand>
{
  constructor(
    private readonly repository: IResourceRepository,
    logger: ILogger,
  ) {
    super(logger);
  }

  async handle(
    command: CreateResourceCommand,
  ): Promise<Validation<IError[], void>> {
    return (
      await new Pipeline<CreateResourceContext>()
        .step((ctx) => this.checkUniqueness(ctx))
        .step((ctx) => this.createEntity(ctx))
        .stepWithRetry((ctx) => this.persistResource(ctx), 3)
        .execute({ command })
    ).map(() => undefined);
  }

  // ============================================
  // Pipeline шаги - каждый одна ответственность
  // ============================================

  private async checkUniqueness(
    ctx: CreateResourceContext,
  ): Promise<Validation<IError[], CreateResourceContext>> {
    const namespaceValidation = Namespace.create(ctx.command.namespace).mapLeft(
      (errors): IError[] => errors,
    );

    return namespaceValidation.asyncChain(async (namespace) =>
      this.handleInfrastructureErrors(
        await this.repository.findByNamespace(namespace),
        "check uniqueness",
      ).chain((existingResources) =>
        fromCondition(
          existingResources.length === 0,
          { ...ctx, existingResources },
          [
            new DuplicateError("Resource", ctx.command.namespace, {
              field: "namespace",
            }),
          ],
        ),
      ),
    );
  }

  private createEntity(
    ctx: CreateResourceContext,
  ): Promise<Validation<IError[], CreateResourceContext>> {
    return Promise.resolve(
      Resource.create(
        Namespace.create(ctx.command.namespace),
        ResourceName.create(ctx.command.name),
        ctx.command.secret,
      ).map((entity) => ({ ...ctx, entity }))
    );
  }

  private async persistResource(
    ctx: CreateResourceContext,
  ): Promise<Validation<IError[], CreateResourceContext>> {
    return this.handleInfrastructureErrors(
      await this.repository.save(ctx.entity!),
      "save resource",
    ).map(() => ctx);
  }
}
