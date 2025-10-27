/**
 * Notification - объект уведомления
 * 
 * Неизменяемый объект (readonly) для представления уведомления в системе.
 * Часть Application Layer, НЕ знает о конкретной UI реализации.
 * 
 * @layer Application
 * @pattern Value Object (неизменяемый)
 */
export interface Notification {
  readonly id: string
  readonly level: NotificationLevel
  readonly message: string
  readonly timestamp: Date
  readonly duration?: number
  readonly action?: NotificationAction
}

/**
 * Уровень важности уведомления
 */
export type NotificationLevel = 'success' | 'error' | 'info' | 'warning'

/**
 * Действие (кнопка) в уведомлении
 * 
 * Позволяет добавить интерактивность к уведомлениям.
 * 
 * @example
 * {
 *   label: 'Undo',
 *   onClick: () => restoreResource()
 * }
 */
export interface NotificationAction {
  readonly label: string
  readonly onClick: () => void
}

/**
 * Параметры для создания нотификации
 * 
 * Используется в INotificationManager.notify() для создания уведомления.
 * ID и timestamp генерируются автоматически адаптером.
 */
export interface CreateNotificationParams {
  readonly level: NotificationLevel
  readonly message: string
  readonly duration?: number
  readonly action?: NotificationAction
}
