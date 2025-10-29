import { Validation } from "@/shared";
import { ServiceContainer } from "./ServiceContainer";
import { IError } from "@/shared/errors";
import { QueryFacade } from "./queries";
import { CommandFacade } from "./commands";
import type { INotificationManager, ILogger } from "@/application/ports";

export function initializeContainer(deps: PlatformDependencies): void {
  ServiceContainer.initialize(deps);
}

export interface PlatformDependencies {
  notificationManager: INotificationManager;
  logger: ILogger;
}

export function getValidatedQueries(): Validation<IError[], QueryFacade> {
  return ServiceContainer.getQueries();
}

export function getValidatedCommands(): Validation<IError[], CommandFacade> {
  return ServiceContainer.getCommands();
}

export function getValidatedNotificationManager(): Validation<
  IError[],
  INotificationManager
> {
  return ServiceContainer.getNotificationManager();
}

export type { QueryFacade } from "./queries";
export type { CommandFacade } from "./commands";

export type * from "@/application/ports";

export type * from "@/application/queries/dto";

export type { CreateResourceCommand } from "@/application/commands";

// Infrastructure types (для platform configs)
export type { INotificationDisplay } from "@/infrastructure/notifications/INotificationDisplay";
export { WebNotificationManager } from "@/infrastructure/notifications/WebNotificationManager";
