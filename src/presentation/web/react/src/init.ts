import {
  initializeContainer,
  type ILogger,
  type INotificationManager,
} from "@/main/composition";

export interface PlatformDependencies {
  notificationManager: INotificationManager;
  logger: ILogger;
}

interface AppServices {
  notificationManager: INotificationManager;
}

export function initializeApp(deps: PlatformDependencies): AppServices {
  initializeContainer({
    notificationManager: deps.notificationManager,
    logger: deps.logger,
  });

  console.log("[App] ✅ ServiceContainer initialized");

  return { notificationManager: deps.notificationManager };
}
