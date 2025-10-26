/**
 * IAction - базовый интерфейс для всех действий (Actions)
 * 
 * Action представляет намерение выполнить системное действие,
 * которое НЕ является бизнес-операцией (CQRS Command).
 * 
 * Примеры Actions:
 * - ShowRandomResourceAction - показать случайный ресурс
 * - NavigateToAction - навигация
 * - CopyToClipboardAction - копирование в буфер
 * - ShowNotificationAction - показать уведомление
 * 
 * @see ICommand для бизнес-операций (CQRS)
 */
export interface IAction {
  /**
   * Тип действия (уникальный идентификатор)
   * Используется для маршрутизации к правильному handler
   */
  readonly type: string
}
