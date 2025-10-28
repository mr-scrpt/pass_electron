//  src/composition/ServiceContainer.ts
import type { IResourceRepository } from "@/domain";
import type { ILogger, INotificationManager } from "@/application/ports";
import type { IQueryBus } from "@/application/queries";
import type { ICommandBus } from "@/application/commands/ICommandBus";
import type { IActionBus } from "@/application/actions";
import { InMemoryQueryBus } from "@/infrastructure/queries/InMemoryQueryBus";
import { InMemoryCommandBus } from "@/infrastructure/commands/InMemoryCommandBus";
import { InMemoryActionBus } from "@/infrastructure/actions";
import { MockResourceRepository } from "@/infrastructure/repositories";
import { ResourceModule } from "./modules/ResourceModule";
import { SystemModule } from "./modules/SystemModule";
import { QueryFacade } from "./queries";
import { CommandFacade } from "./commands";
import type { Validation } from "@/shared/validation";
import { isTrue } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { InfrastructureError } from "@/shared/errors";

export class ServiceContainer {
  private static resourceModule = new ResourceModule();
  private static systemModule = new SystemModule();

  private static queryBus: IQueryBus | null = null;
  private static commandBus: ICommandBus | null = null;
  private static actionBus: IActionBus | null = null;
  private static notificationManager: INotificationManager | null = null;
  private static queryFacade: QueryFacade | null = null;
  private static commandFacade: CommandFacade | null = null;
  private static initialized = false;

  static initialize(config: {
    logger: ILogger;
    notificationManager: INotificationManager;
  }): void {
    if (this.initialized) return;

    const repository: IResourceRepository = new MockResourceRepository();

    this.systemModule.initialize({ logger: config.logger });
    this.resourceModule.initialize({
      repository,
      logger: config.logger,
    });

    this.queryBus = new InMemoryQueryBus();
    this.resourceModule.registerQueryHandlers(this.queryBus);
    this.systemModule.registerQueryHandlers(this.queryBus);

    this.commandBus = new InMemoryCommandBus();
    this.resourceModule.registerCommandHandlers(this.commandBus);
    this.systemModule.registerCommandHandlers(this.commandBus);

    this.queryFacade = new QueryFacade(this.queryBus);
    this.commandFacade = new CommandFacade(this.commandBus);

    const actionBus = new InMemoryActionBus();
    this.actionBus = actionBus;

    this.notificationManager = config.notificationManager;

    this.initialized = true;
  }

  static getQueries(): Validation<IError[], QueryFacade> {
    return isTrue(this.queryFacade !== null, this.queryFacade!)
      .valid()
      .invalid([
        new InfrastructureError(
          "ServiceContainer",
          "Container not initialized. Call initialize() first.",
        ),
      ]);
  }

  static getCommands(): Validation<IError[], CommandFacade> {
    return isTrue(this.commandFacade !== null, this.commandFacade!)
      .valid()
      .invalid([
        new InfrastructureError(
          "ServiceContainer",
          "Container not initialized. Call initialize() first.",
        ),
      ]);
  }

  static getActionBus(): Validation<IError[], IActionBus> {
    return isTrue(this.actionBus !== null, this.actionBus!)
      .valid()
      .invalid([
        new InfrastructureError(
          "ServiceContainer",
          "Container not initialized. Call initialize() first.",
        ),
      ]);
  }

  static getLogger(): Validation<IError[], ILogger> {
    return isTrue(this.initialized, undefined)
      .valid()
      .invalid([
        new InfrastructureError(
          "ServiceContainer",
          "Container not initialized. Call initialize() first.",
        ),
      ])
      .chain(() => this.systemModule.getLogger());
  }

  static getNotificationManager(): Validation<IError[], INotificationManager> {
    return isTrue(this.notificationManager !== null, this.notificationManager!)
      .valid()
      .invalid([
        new InfrastructureError(
          "ServiceContainer",
          "Container not initialized. Call initialize() first.",
        ),
      ]);
  }

  static reset(): void {
    this.resourceModule.reset();
    this.systemModule.reset();
    this.queryBus = null;
    this.commandBus = null;
    this.actionBus = null;
    this.notificationManager = null;
    this.queryFacade = null;
    this.commandFacade = null;
    this.initialized = false;
  }
}
