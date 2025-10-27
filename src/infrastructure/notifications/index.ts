/**
 * Notification Manager Adapters - Public API
 * 
 * Экспорт адаптеров для INotificationManager.
 * Адаптеры НЕ упоминают конкретные UI библиотеки в названиях.
 * 
 * @layer Infrastructure
 */
export { WebNotificationManager } from './WebNotificationManager'
export { ConsoleNotificationManager } from './ConsoleNotificationManager'
export type { INotificationDisplay } from './INotificationDisplay'
