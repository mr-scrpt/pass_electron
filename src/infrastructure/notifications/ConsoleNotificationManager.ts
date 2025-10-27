import type {
  INotificationManager,
  Notification,
  CreateNotificationParams,
} from "@/application/ports";

export class ConsoleNotificationManager implements INotificationManager {
  private history: Notification[] = [];
  private subscribers: Set<(notification: Notification) => void> = new Set();
  private notificationCounter = 0;

  notify(params: CreateNotificationParams): string {
    const id = `notification-${Date.now()}-${++this.notificationCounter}`;

    const notification: Notification = {
      id,
      level: params.level,
      message: params.message,
      timestamp: new Date(),
      duration: params.duration,
      action: params.action,
    };

    this.history.unshift(notification);

    this.logNotification(notification);

    this.notifySubscribers(notification);

    return id;
  }

  private logNotification(notification: Notification): void {
    const emoji = {
      success: "✅",
      error: "❌",
      info: "ℹ️",
      warning: "⚠️",
    }[notification.level];

    const timestamp = notification.timestamp.toISOString();
    const level = notification.level.toUpperCase().padEnd(7);

    console.log(
      `${emoji} [${level}] [${timestamp}] [${notification.id}] ${notification.message}`,
    );

    if (notification.action) {
      console.log(`  └─ Action: "${notification.action.label}"`);
    }
  }

  private notifySubscribers(notification: Notification): void {
    this.subscribers.forEach((handler) => {
      try {
        handler(notification);
      } catch (error) {
        console.error("[ConsoleNotificationManager] Subscriber error:", error);
      }
    });
  }

  dismiss(id: string): void {
    console.log(`[DISMISS] ${id}`);
  }

  dismissAll(): void {
    console.log("[DISMISS ALL]");
  }

  getHistory(): Notification[] {
    return [...this.history];
  }

  clearHistory(): void {
    const count = this.history.length;
    this.history = [];
    console.log(`[HISTORY CLEARED] ${count} notifications removed`);
  }

  subscribe(handler: (notification: Notification) => void): () => void {
    this.subscribers.add(handler);
    console.log(
      `[SUBSCRIBED] New subscriber added (total: ${this.subscribers.size})`,
    );

    return () => {
      this.subscribers.delete(handler);
      console.log(
        `[UNSUBSCRIBED] Subscriber removed (total: ${this.subscribers.size})`,
      );
    };
  }
}
