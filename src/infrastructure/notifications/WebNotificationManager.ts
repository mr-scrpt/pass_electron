import type {
  INotificationManager,
  Notification,
  CreateNotificationParams,
} from "@/application/ports";
import type { INotificationDisplay } from "./INotificationDisplay";

/**
 * WebNotificationManager - реализация INotificationManager
 * 
 * Отвечает за бизнес-логику нотификаций:
 * - Генерация уникальных ID
 * - История уведомлений
 * - Управление подписчиками
 * 
 * НЕ знает о конкретной UI реализации - делегирует отображение через INotificationDisplay.
 * Работает с любым Display (Web, Electron, Console).
 * 
 * @pattern Facade + Delegation
 * @layer Infrastructure
 * 
 * @example
 * // Web
 * const manager = new WebNotificationManager(new SonnerNotificationDisplay())
 * 
 * @example
 * // Electron (расширенный Display)
 * const webDisplay = new SonnerNotificationDisplay()
 * const electronDisplay = new ElectronNotificationDecorator(webDisplay)
 * const manager = new WebNotificationManager(electronDisplay)
 */
export class WebNotificationManager implements INotificationManager {
  private history: Notification[] = [];
  private subscribers: Set<(notification: Notification) => void> = new Set();
  private notificationCounter = 0;

  constructor(private readonly display: INotificationDisplay) {}

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

    this.displayNotification(notification);

    this.notifySubscribers(notification);

    return id;
  }

  private displayNotification(notification: Notification): void {
    this.display.show(notification);
  }

  private notifySubscribers(notification: Notification): void {
    this.subscribers.forEach((handler) => {
      try {
        handler(notification);
      } catch (error) {
        console.error("[WebNotificationManager] Subscriber error:", error);
      }
    });
  }

  dismiss(id: string): void {
    this.display.dismiss(id);
  }

  dismissAll(): void {
    this.display.dismissAll();
  }

  getHistory(): Notification[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  subscribe(handler: (notification: Notification) => void): () => void {
    this.subscribers.add(handler);

    return () => {
      this.subscribers.delete(handler);
    };
  }
}
