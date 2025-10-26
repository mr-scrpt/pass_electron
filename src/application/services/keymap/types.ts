import type { IActionBus } from '@/application/actions'

/**
 * App Mode - режим работы приложения
 */
export type AppMode = 'navigation' | 'editing'

/**
 * Action Context - контекст для выполнения keymap actions
 * 
 * Предоставляет зависимости через Dependency Injection
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
  
  // Другие зависимости будут добавлены позже:
  // modalManager?: IModalManager
  // focusManager?: IFocusManager
  // notificationManager?: INotificationManager
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
