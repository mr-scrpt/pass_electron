//  src/presentation/shared/platform/web/index.ts
import { SonnerNotificationDisplay } from "./adapters/SonnerNotificationDisplay";
import { createCommonDependencies } from "../common";
import {
  INotificationManager,
  ILogger,
  WebNotificationManager,
} from "@/main/composition";

// ✅ Re-export platform errors
export * from '../errors';

// ✅ Re-export hooks
export { useNotificationManager } from './hook/useNotificationManager';

// ✅ Re-export UI components
export { Toast } from './ui/toast';

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
