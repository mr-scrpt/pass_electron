import type { IAction } from './IAction'

/**
 * IActionHandler - интерфейс обработчика действия
 * 
 * Handler реализуется в Presentation Layer и выполняет
 * платформо-специфичную логику (React hooks, navigation, etc.)
 * 
 * @template T - тип действия (extends IAction)
 */
export interface IActionHandler<T extends IAction> {
  /**
   * Обработать действие
   * 
   * @param action - действие для выполнения
   * @returns Promise<void> или void
   */
  handle(action: T): Promise<void> | void
}
