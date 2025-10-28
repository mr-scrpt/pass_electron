import type { IResourceRepository } from "@/domain";
import type { ILogger } from "@/application/ports";
import type { ICommandBus } from "@/application/commands/ICommandBus";
import {
  CreateResourceCommandHandler,
  ResourceListQueryHandler,
} from "@/application";
import type {
  ListResourcesQuery,
  CreateResourceCommand,
  IQueryBus,
} from "@/application";
import type { ResourceItemListDTO } from "@/application/queries/";
import { BaseModule } from "./BaseModule";

/**
 * Resource Module - DI для Resource сущности
 *
 * Наследует BaseModule для унификации структуры модулей
 * ✅ Монадический подход через checkInitialization()
 */
export class ResourceModule extends BaseModule<
  { repository: IResourceRepository; logger: ILogger },
  { repository: IResourceRepository; logger: ILogger }
> {
  /**
   * Построение зависимостей - просто возвращаем config as is
   */
  protected buildDependencies(config: {
    repository: IResourceRepository;
    logger: ILogger;
  }): { repository: IResourceRepository; logger: ILogger } {
    return config;
  }

  registerQueryHandlers(queryBus: IQueryBus): void {
    queryBus.register<ListResourcesQuery, ResourceItemListDTO[]>(
      "ListResourcesQuery",
      async (query) => {
        return this.checkInitialization().asyncChain(
          async ({ repository, logger }) => {
            const handler = new ResourceListQueryHandler(repository, logger);
            return handler.handle(query);
          },
        );
      },
    );
  }

  registerCommandHandlers(commandBus: ICommandBus): void {
    commandBus.register<CreateResourceCommand>(
      "CreateResourceCommand",
      async (command) => {
        return this.checkInitialization().asyncChain(
          async ({ repository, logger }) => {
            const handler = new CreateResourceCommandHandler(
              repository,
              logger,
            );
            return handler.handle(command);
          },
        );
      },
    );
  }
}
