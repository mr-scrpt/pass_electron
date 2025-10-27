import { SonnerNotificationDisplay } from "./adapters/SonnerNotificationDisplay";
import { WebNotificationManager } from "@/infrastructure/notifications";
import { createCommonDependencies } from "../common";
import type { INotificationManager } from "@/application/ports";
import type { ILogger } from "@/application/ports";

export interface PlatformDependencies {
  notificationManager: INotificationManager;
  logger: ILogger;
}

export function createPlatformDependencies(): PlatformDependencies {
  console.log("[Platform Config] 🌐 Loading WEB configuration");

  const common = createCommonDependencies();

  const display = new SonnerNotificationDisplay();
  const notificationManager = new WebNotificationManager(display);

  return {
    ...common,
    notificationManager,
  };
}
