import type { IActionBus } from '@/application/actions'
import type { INotificationManager } from '@/application/ports'

/**
 * App Mode - режим работы приложения
 */
export type AppMode = 'navigation' | 'editing'

/**
 * Action Context - контекст для выполнения keymap actions
 * 
 * Предоставляет зависимости через Dependency Injection.
 * Keymaps получают все необходимые сервисы через этот контекст.
 * 
 * @pattern Service Locator (для функциональных keymaps)
 * @pattern Dependency Injection
 */
export interface ActionContext {
  /**
   * Текущий режим приложения
   */
  mode: AppMode
  
  /**
   * Текущий маршрут (React Router path)
   */
  route: string
  
  /**
   * Action Bus для отправки действий в Presentation Layer
   * ✅ Изолирует Keymap систему от Browser/UI API
   */
  actionBus?: IActionBus
  
  /**
   * Notification Manager для показа уведомлений
   * ✅ Изолирует Keymap систему от конкретной UI библиотеки
   * 
   * @example
   * ctx.notificationManager?.notify({
   *   level: 'success',
   *   message: 'Action completed!'
   * })
   */
  notificationManager?: INotificationManager
  
  // Другие зависимости будут добавлены позже:
  // modalManager?: IModalManager
  // focusManager?: IFocusManager
}

/**
 * Keymap Binding - привязка клавиш
 */
export interface KeymapBinding {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
}

/**
 * Keymap - горячая клавиша с действием
 */
export interface Keymap {
  id: string
  name: string
  binding: KeymapBinding
  action: (ctx: ActionContext) => Promise<void> | void
  description: string
  modes?: AppMode[]
  routes?: string[]
}
