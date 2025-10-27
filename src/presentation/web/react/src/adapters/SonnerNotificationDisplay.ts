import type { Notification } from '@/application/ports'
import type { INotificationDisplay } from '@/infrastructure/notifications'
import { toast } from 'sonner'

/**
 * Sonner Notification Display - Web реализация уведомлений через toast
 * 
 * Полностью самодостаточная Web реализация.
 * НЕ знает о других платформах (Electron, Mobile).
 * Показывает уведомления ТОЛЬКО внутри приложения через sonner toast.
 * 
 * Для расширения функциональности (например, OS notifications в Electron)
 * используется Decorator Pattern - этот класс оборачивается, а НЕ изменяется.
 * 
 * @pattern Adapter (адаптирует sonner к INotificationDisplay)
 * @layer Presentation (Web)
 * 
 * @example
 * // Web entry point:
 * const display = new SonnerNotificationDisplay()
 * const manager = new WebNotificationManager(display)
 * 
 * @example
 * // Electron entry point (расширение):
 * const webDisplay = new SonnerNotificationDisplay()
 * const enhanced = new ElectronNotificationDecorator(webDisplay)  // Обертка!
 * const manager = new WebNotificationManager(enhanced)
 */
export class SonnerNotificationDisplay implements INotificationDisplay {
  /**
   * Показать toast уведомление через sonner
   * 
   * Всегда показывается внутри окна приложения.
   * Для OS notifications используйте ElectronNotificationDecorator.
   */
  show(notification: Notification): void {
    const options = {
      id: notification.id,
      duration: notification.duration ?? this.getDefaultDuration(notification.level)
    }

    // Маппинг уровней на методы sonner
    switch (notification.level) {
      case 'success':
        toast.success(notification.message, options)
        break
      case 'error':
        toast.error(notification.message, options)
        break
      case 'info':
        toast.info(notification.message, options)
        break
      case 'warning':
        toast.warning(notification.message, options)
        break
    }
  }

  dismiss(id: string): void {
    toast.dismiss(id)
  }

  dismissAll(): void {
    toast.dismiss()
  }

  /**
   * Дефолтная длительность показа по уровню важности
   */
  private getDefaultDuration(level: Notification['level']): number {
    return {
      success: 4000,
      error: 6000,
      info: 3000,
      warning: 5000
    }[level]
  }
}
