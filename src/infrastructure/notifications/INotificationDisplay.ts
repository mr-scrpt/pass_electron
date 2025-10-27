import type { Notification } from "@/application/ports";

/**
 * INotificationDisplay - интерфейс для рендеринга уведомлений
 * 
 * Минималистичный контракт для отображения нотификаций.
 * НЕ содержит platform-specific методов (например, canShowSystemNotifications).
 * 
 * Реализации:
 * - SonnerNotificationDisplay (Web - toast)
 * - ElectronNotificationDecorator (Electron - toast + OS)
 * 
 * @pattern Strategy
 * @layer Infrastructure
 */
export interface INotificationDisplay {
  /**
   * Показать уведомление
   * 
   * Реализация сама решает КАК показывать:
   * - Web: только toast
   * - Electron: toast + OS (для важных уровней)
   */
  show(notification: Notification): void;

  /**
   * Скрыть конкретное уведомление по ID
   */
  dismiss(id: string): void;

  /**
   * Скрыть все активные уведомления
   */
  dismissAll(): void;
}
