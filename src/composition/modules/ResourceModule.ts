import type { IResourceRepository } from "@/domain";
import type { ILogger } from "@/application/ports";
import type { IQueryBus } from "@/application/queries/IQueryBus";
import type { ICommandBus } from "@/application/commands/ICommandBus";
import {
  CreateResourceCommandHandler,
  ListResourcesQueryHandler,
} from "@/application";
import type { ListResourcesQuery, CreateResourceCommand } from "@/application";
import type { ResourceListItemDTO } from "@/application/queries/dtos";
import { BaseModule } from './BaseModule';

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
    queryBus.register<ListResourcesQuery, ResourceListItemDTO[]>(
      "ListResourcesQuery",
      async (query) => {
        return this.checkInitialization().asyncChain(
          async ({ repository, logger }) => {
            const handler = new ListResourcesQueryHandler(repository, logger);
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
