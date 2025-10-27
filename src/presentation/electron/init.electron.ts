/**
 * Electron Entry Point - инициализация приложения для Electron
 * 
 * РАСШИРЯЕТ Web версию через Decorator Pattern.
 * Переиспользует Web компоненты + добавляет Electron-специфичную функциональность.
 * 
 * Ключевые отличия от Web:
 * 1. Display оборачивается в ElectronNotificationDecorator
 * 2. Добавляются OS notifications для важных уведомлений
 * 3. Web код НЕ изменяется - только расширяется
 * 
 * @layer Presentation (Electron)
 * 
 * @example
 * // В electron/main.ts:
 * import { initializeApp } from '@/presentation/electron/init.electron'
 * initializeApp()
 */

import { ServiceContainer, ConsoleLogger } from '@/composition'
import { MockResourceRepository } from '@/infrastructure/repositories'
import { WebNotificationManager } from '@/infrastructure/notifications'
import { SonnerNotificationDisplay } from '@/presentation/web/react/adapters/SonnerNotificationDisplay'
import { ElectronNotificationDecorator } from './adapters/ElectronNotificationDecorator'
import type { INotificationManager } from '@/application/ports'

interface AppServices {
  notificationManager: INotificationManager
}

/**
 * Инициализация приложения для Electron
 * 
 * Переиспользует Web компоненты + добавляет Electron расширения
 */
export function initializeApp(): AppServices | null {
  try {
    const initialized = (
      ServiceContainer as unknown as { initialized?: boolean }
    ).initialized

    if (initialized) {
      console.log('[Electron] ServiceContainer already initialized')
      const result = ServiceContainer.getNotificationManager()
      if (result.isLeft()) {
        throw new Error('NotificationManager not available')
      }
      return { notificationManager: result.value }
    }

    // ✅ Создаем глобальные сервисы
    const repository = new MockResourceRepository()
    const logger = new ConsoleLogger()

    // ✅ Создаем Display: Web Display + Electron Decorator
    // 1️⃣ Базовый Web Display (переиспользуем!)
    const webDisplay = new SonnerNotificationDisplay()
    
    // 2️⃣ Оборачиваем в Electron Decorator (добавляет OS notifications)
    const electronDisplay = new ElectronNotificationDecorator(webDisplay)
    
    // 3️⃣ Создаем Manager с расширенным Display
    const notificationManager = new WebNotificationManager(electronDisplay)

    // ✅ Инициализируем контейнер (как в Web)
    ServiceContainer.initialize({
      repository,
      logger,
      notificationManager,
    })

    console.log('[Electron] ✅ ServiceContainer initialized successfully')
    console.log('[Electron] 🔔 OS notifications enabled for error/warning levels')
    
    return { notificationManager }
  } catch (error) {
    console.error('[Electron] ❌ Failed to initialize ServiceContainer:', error)
    return null
  }
}

/**
 * Запрос permission для OS notifications
 * 
 * Вызывается при первом запуске Electron приложения.
 * Опционально - приложение работает и без OS notifications (будет только toast).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') {
    console.warn('[Electron] Notification API not available')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    console.warn('[Electron] Notification permission denied by user')
    return false
  }

  // Запрашиваем permission
  try {
    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'
    
    if (granted) {
      console.log('[Electron] ✅ Notification permission granted')
    } else {
      console.warn('[Electron] ⚠️ Notification permission not granted')
    }
    
    return granted
  } catch (error) {
    console.error('[Electron] Failed to request notification permission:', error)
    return false
  }
}
