import type {
  Notification,
  CreateNotificationParams,
} from "./types/Notification";

export interface INotificationManager {
  notify(params: CreateNotificationParams): string;

  dismiss(id: string): void;

  dismissAll(): void;

  getHistory(): Notification[];

  clearHistory(): void;

  subscribe(handler: (notification: Notification) => void): () => void;
}
