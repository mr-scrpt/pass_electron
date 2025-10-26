import type { ICommandBus } from '@/application/commands/ICommandBus'
import type { ICommand } from '@/application/commands/ICommand'
import type { Validation } from '@/shared/validation'
import { invalid } from '@/shared/validation'
import type { IError } from '@/shared/errors'
import { InfrastructureError } from '@/shared/errors'

/**
 * In-Memory Command Bus implementation
 * 
 * Хранит handlers в Map и диспатчит commands
 */
export class InMemoryCommandBus implements ICommandBus {
  private readonly handlers = new Map<
    string,
    (command: ICommand) => Promise<Validation<IError[], void>>
  >()

  register<TCommand extends ICommand>(
    commandType: string,
    handler: (command: TCommand) => Promise<Validation<IError[], void>>
  ): void {
    this.handlers.set(commandType, handler as (command: ICommand) => Promise<Validation<IError[], void>>)
  }

  async execute(
    command: ICommand
  ): Promise<Validation<IError[], void>> {
    const handler = this.handlers.get(command.type)

    if (!handler) {
      return invalid([
        new InfrastructureError(
          'CommandBus',
          `No handler registered for command type: ${command.type}`,
          { commandType: command.type }
        )
      ])
    }

    return handler(command)
  }
}
