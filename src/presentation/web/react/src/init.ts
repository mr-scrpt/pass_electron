import { ServiceContainer } from "@/composition";
import type { INotificationManager, ILogger } from "@/application/ports";

export interface PlatformDependencies {
  notificationManager: INotificationManager;
  logger: ILogger;
}

interface AppServices {
  notificationManager: INotificationManager;
}

export function initializeApp(deps: PlatformDependencies): AppServices {
  ServiceContainer.initialize({
    notificationManager: deps.notificationManager,
    logger: deps.logger,
  });

  console.log("[App] ✅ ServiceContainer initialized");

  return { notificationManager: deps.notificationManager };
}
