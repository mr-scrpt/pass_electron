import type { Validation } from '@/shared/validation'
import type { IError } from '@/shared/errors'
import type { ICommandBus } from '@/application/commands/ICommandBus'
import { CreateResourceCommand } from '@/application/commands'

/**
 * Command Facade - unified API для commands
 * 
 * Использует Command Bus для выполнения commands
 */
export class CommandFacade {
  constructor(
    private readonly commandBus: ICommandBus
  ) {}

  async createResource(params: {
    namespace: string
    name: string
    secret: string
  }): Promise<Validation<IError[], void>> {
    const command = new CreateResourceCommand(
      params.namespace,
      params.name,
      params.secret
    )

    return this.commandBus.execute(command)
  }
}
