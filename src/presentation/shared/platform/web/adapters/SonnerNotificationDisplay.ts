//  src/presentation/shared/platform/web/adapters/SonnerNotificationDisplay.ts
import type { Notification, INotificationDisplay } from "@/main/composition";
import { toast } from "sonner";

export class SonnerNotificationDisplay implements INotificationDisplay {
  show(notification: Notification): void {
    const options = {
      id: notification.id,
      duration:
        notification.duration ?? this.getDefaultDuration(notification.level),
    };

    switch (notification.level) {
      case "success":
        toast.success(notification.message, options);
        break;
      case "error":
        toast.error(notification.message, options);
        break;
      case "info":
        toast.info(notification.message, options);
        break;
      case "warning":
        toast.warning(notification.message, options);
        break;
    }
  }

  dismiss(id: string): void {
    toast.dismiss(id);
  }

  dismissAll(): void {
    toast.dismiss();
  }

  private getDefaultDuration(level: Notification["level"]): number {
    const durations: Record<Notification["level"], number> = {
      success: 4000,
      error: 6000,
      info: 3000,
      warning: 5000,
    };
    return durations[level];
  }
}
