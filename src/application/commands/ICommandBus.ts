import type { Validation } from '@/shared/validation'
import type { IError } from '@/shared/errors'
import type { ICommand } from './ICommand'

/**
 * Command Bus - dispatcher для Command Handlers
 * 
 * Позволяет регистрировать handlers динамически
 * и выполнять commands через единый интерфейс
 */
export interface ICommandBus {
  /**
   * Регистрация handler для типа command
   */
  register<TCommand extends ICommand>(
    commandType: string,
    handler: (command: TCommand) => Promise<Validation<IError[], void>>
  ): void

  /**
   * Выполнение command через зарегистрированный handler
   */
  execute(
    command: ICommand
  ): Promise<Validation<IError[], void>>
}
