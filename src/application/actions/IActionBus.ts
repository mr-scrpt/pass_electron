import type { IAction } from './IAction'
import type { IActionHandler } from './IActionHandler'

/**
 * IActionBus - Port (интерфейс) для Action Bus
 * 
 * Action Bus - посредник между Core Systems (Keymap, Modal, etc.)
 * и Presentation Layer (UI handlers)
 * 
 * Hexagonal Architecture:
 * - Port (интерфейс) - определяет ЧТО нужно Application Core
 * - Adapter (реализация) - определяет КАК это сделать
 * 
 * Отличия от CQRS Command Bus:
 * - Actions - системные действия (навигация, UI)
 * - Commands - бизнес-операции (создать ресурс)
 * - Actions handlers в Presentation Layer
 * - Commands handlers в Application Layer
 * 
 * @see InMemoryActionBus для реализации (Adapter)
 */
export interface IActionBus {
  /**
   * Отправить действие на выполнение
   * 
   * @param action - действие для выполнения
   * @returns Promise<void>
   */
  dispatch<T extends IAction>(action: T): Promise<void>
  
  /**
   * Зарегистрировать обработчик для типа действия
   * 
   * Используется в Presentation Layer (useEffect) для
   * регистрации handler при монтировании компонента
   * 
   * @param actionType - тип действия (action.type)
   * @param handler - обработчик действия
   */
  register<T extends IAction>(
    actionType: string,
    handler: IActionHandler<T>
  ): void
  
  /**
   * Отменить регистрацию обработчика
   * 
   * Используется в cleanup функции useEffect
   * при размонтировании компонента
   * 
   * @param actionType - тип действия
   */
  unregister(actionType: string): void
}
