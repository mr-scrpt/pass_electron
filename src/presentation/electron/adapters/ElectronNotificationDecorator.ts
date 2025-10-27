/// <reference lib="dom" />

import type { Notification as AppNotification } from '@/application/ports'
import type { INotificationDisplay } from '@/infrastructure/notifications'

/**
 * ElectronNotificationDecorator - расширение Web Display через OS notifications
 * 
 * Декоратор который ОБОРАЧИВАЕТ существующий Display (обычно SonnerNotificationDisplay)
 * и ДОБАВЛЯЕТ функциональность OS notifications для Electron.
 * 
 * КЛЮЧЕВОЙ ПРИНЦИП:
 * - Web Display НЕ изменяется
 * - Electron РАСШИРЯЕТ Web через обертку
 * - Application Layer НЕ знает о платформе
 * 
 * Стратегия показа:
 * 1. ВСЕГДА показывает toast через базовый Display (Web)
 * 2. ДОПОЛНИТЕЛЬНО показывает OS notification для важных уровней (error/warning)
 * 
 * Будущие расширения:
 * - Focus-aware: показывать OS только если окно не в фокусе
 * - Configurable: настраиваемая стратегия через конструктор
 * - Sound: добавить звук для критичных уведомлений
 * 
 * @pattern Decorator (расширяет INotificationDisplay)
 * @layer Presentation (Electron)
 * 
 * @example
 * // Electron entry point (src/presentation/electron/init.electron.ts):
 * import { SonnerNotificationDisplay } from '@/presentation/web/react/adapters/SonnerNotificationDisplay'
 * import { ElectronNotificationDecorator } from './adapters/ElectronNotificationDecorator'
 * import { WebNotificationManager } from '@/infrastructure/notifications'
 * 
 * const webDisplay = new SonnerNotificationDisplay()  // ← Переиспользуем Web!
 * const electronDisplay = new ElectronNotificationDecorator(webDisplay)
 * const manager = new WebNotificationManager(electronDisplay)
 * 
 * ServiceContainer.initialize({ notificationManager: manager })
 */
export class ElectronNotificationDecorator implements INotificationDisplay {
  constructor(
    private readonly baseDisplay: INotificationDisplay  // ← Оборачиваем Web Display
  ) {}

  /**
   * Показать уведомление: toast + OS (для важных)
   * 
   * 1. Делегирует показ toast базовому Display (Web)
   * 2. Дополнительно показывает OS notification если нужно
   */
  show(notification: AppNotification): void {
    // 1️⃣ ВСЕГДА показываем через базовый Display (toast в окне)
    this.baseDisplay.show(notification)

    // 2️⃣ ДОПОЛНИТЕЛЬНО показываем в OS (если важное)
    if (this.shouldShowInOS(notification)) {
      this.showOSNotification(notification)
    }
  }

  /**
   * Скрыть уведомление
   * 
   * Делегируем базовому Display.
   * OS notifications закрываются автоматически по timeout.
   */
  dismiss(id: string): void {
    this.baseDisplay.dismiss(id)
  }

  /**
   * Скрыть все уведомления
   */
  dismissAll(): void {
    this.baseDisplay.dismissAll()
  }

  /**
   * Стратегия: какие уведомления показывать в OS
   * 
   * Текущая логика: только error и warning
   * 
   * Будущие расширения:
   * - Проверка фокуса окна (BrowserWindow.getFocusedWindow())
   * - Настраиваемая стратегия через конструктор
   * - Пользовательские настройки (preferences)
   */
  private shouldShowInOS(notification: AppNotification): boolean {
    // Базовая стратегия: только важные уровни
    const isImportantLevel = 
      notification.level === 'error' || 
      notification.level === 'warning'

    return isImportantLevel

    // 🔮 Будущее расширение - focus-aware:
    // const { BrowserWindow } = require('electron')
    // const isAppFocused = BrowserWindow.getFocusedWindow() !== null
    // return !isAppFocused && isImportantLevel
  }

  /**
   * Показать нативную OS notification через Electron API
   * 
   * Использует Web Notification API, который в Electron
   * автоматически делегируется к OS notifications.
   * 
   * Feature detection + graceful degradation:
   * - Проверяет наличие API
   * - Проверяет permission
   * - Не падает если API недоступно
   */
  private showOSNotification(notification: AppNotification): void {
    // Feature detection - graceful degradation
    if (typeof Notification === 'undefined') {
      // OS Notification API недоступно
      // Не критично - toast уже показан через baseDisplay
      console.warn('[ElectronNotificationDecorator] OS Notification API not available')
      return
    }

    // Проверяем permission
    if (Notification.permission !== 'granted') {
      // Permission не получен
      // Можно запросить: Notification.requestPermission()
      // Но не критично - toast уже показан
      console.warn('[ElectronNotificationDecorator] Notification permission not granted')
      return
    }

    // Создаем OS notification
    try {
      new Notification('Password Manager', {
        body: notification.message,
        icon: '/assets/icon.png',  // TODO: путь к иконке
        tag: notification.id,  // Для группировки/обновления
        requireInteraction: notification.level === 'error'  // Не закрывать автоматически для ошибок
      })
    } catch (error) {
      // Не критично - toast уже показан
      console.error('[ElectronNotificationDecorator] Failed to show OS notification:', error)
    }
  }
}
