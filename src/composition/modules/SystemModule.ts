import type { ILogger } from "@/application/ports";
import type { IQueryBus } from "@/application/queries";
import type { ICommandBus } from "@/application/commands/ICommandBus";
import type { Validation } from "@/shared/validation";
import type { IError } from "@/shared/errors";
import { BaseModule } from "./BaseModule";

export class SystemModule extends BaseModule<
  { logger: ILogger },
  { logger: ILogger }
> {
  protected buildDependencies(config: { logger: ILogger }): {
    logger: ILogger;
  } {
    return config;
  }

  getLogger(): Validation<IError[], ILogger> {
    return this.checkInitialization().map(({ logger }) => logger);
  }

  registerQueryHandlers(_queryBus: IQueryBus): void {}

  registerCommandHandlers(_commandBus: ICommandBus): void {}
}
