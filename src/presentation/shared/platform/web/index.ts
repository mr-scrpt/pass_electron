//  src/presentation/shared/platform/web/index.ts
import { SonnerNotificationDisplay } from "./adapters/SonnerNotificationDisplay";
import { createCommonDependencies } from "../common";
import {
  INotificationManager,
  ILogger,
  WebNotificationManager,
} from "@/main/composition";

export interface WebDependencies {
  notificationManager: INotificationManager;
  logger: ILogger;
}

export function createWebDependencies(): WebDependencies {
  console.log("[Platform Config] 🌐 Loading WEB configuration");

  const common = createCommonDependencies();

  const display = new SonnerNotificationDisplay();
  const notificationManager = new WebNotificationManager(display);

  return {
    ...common,
    notificationManager,
  };
}
