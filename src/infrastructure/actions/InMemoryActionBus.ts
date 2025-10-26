import type { IActionBus, IAction, IActionHandler } from '@/application/actions'

/**
 * InMemoryActionBus - in-memory реализация Action Bus
 * 
 * Adapter: реализует Port (IActionBus)
 * Выполняет действия синхронно в том же процессе
 * 
 * Hexagonal Architecture:
 * - Port (IActionBus) - Application Layer
 * - Adapter (InMemoryActionBus) - Infrastructure Layer
 * 
 * Используется для:
 * - Изоляция Core Systems от UI/Platform API
 * - Динамическая регистрация handlers (useEffect)
 * - Type-safe коммуникация через Actions
 */
export class InMemoryActionBus implements IActionBus {
  private handlers = new Map<string, IActionHandler<any>>()
  
  /**
   * Зарегистрировать обработчик для типа действия
   * 
   * Вызывается в Presentation Layer (useEffect) при
   * монтировании компонента
   * 
   * @param actionType - тип действия (action.type)
   * @param handler - обработчик действия
   */
  register<T extends IAction>(
    actionType: string,
    handler: IActionHandler<T>
  ): void {
    if (this.handlers.has(actionType)) {
      console.warn(
        `[ActionBus] Handler for action "${actionType}" already registered. Overwriting.`
      )
    }
    this.handlers.set(actionType, handler)
  }
  
  /**
   * Отменить регистрацию обработчика
   * 
   * Вызывается в cleanup функции useEffect при
   * размонтировании компонента
   * 
   * @param actionType - тип действия
   */
  unregister(actionType: string): void {
    const deleted = this.handlers.delete(actionType)
    if (!deleted) {
      console.warn(
        `[ActionBus] No handler registered for action "${actionType}"`
      )
    }
  }
  
  /**
   * Отправить действие на выполнение
   * 
   * Вызывается из Core Systems (Keymap, Modal, etc.)
   * Находит зарегистрированный handler и вызывает его
   * 
   * @param action - действие для выполнения
   * @returns Promise<void>
   */
  async dispatch<T extends IAction>(action: T): Promise<void> {
    const handler = this.handlers.get(action.type)
    
    if (!handler) {
      console.warn(
        `[ActionBus] No handler registered for action: "${action.type}"`
      )
      return
    }
    
    try {
      await handler.handle(action)
    } catch (error) {
      console.error(
        `[ActionBus] Error handling action "${action.type}":`,
        error
      )
      throw error
    }
  }
}
