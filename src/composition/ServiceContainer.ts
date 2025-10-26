import type { IResourceRepository } from '@/domain'
import type { ILogger } from '@/application/ports'
import type { IQueryBus } from '@/application/queries/IQueryBus'
import type { ICommandBus } from '@/application/commands/ICommandBus'
import { InMemoryQueryBus } from '@/infrastructure/queries/InMemoryQueryBus'
import { InMemoryCommandBus } from '@/infrastructure/commands/InMemoryCommandBus'
import { ResourceModule } from './modules/ResourceModule'
import { SystemModule } from './modules/SystemModule'
import { QueryFacade } from './queries'
import { CommandFacade } from './commands'
import type { Validation } from '@/shared/validation'
import { isTrue } from '@/shared/validation'
import type { IError } from '@/shared/errors'
import { InfrastructureError } from '@/shared/errors'

/**
 * Service Container - Root DI Container
 * 
 * Инициализирует модули и регистрирует handlers в Query/Command Bus
 * ✅ Использует инстансы модулей вместо static
 */
export class ServiceContainer {
  // Инстансы модулей (Singleton)
  private static resourceModule = new ResourceModule()
  private static systemModule = new SystemModule()
  
  private static queryBus: IQueryBus | null = null
  private static commandBus: ICommandBus | null = null
  private static queryFacade: QueryFacade | null = null
  private static commandFacade: CommandFacade | null = null
  private static initialized = false

  /**
   * Инициализация контейнера
   * Вызывается ОДИН РАЗ при старте приложения (entry point)
   */
  static initialize(config: {
    repository: IResourceRepository
    logger: ILogger
  }): void {
    if (this.initialized) return

    // Инициализируем модули (инстансы)
    this.systemModule.initialize({ logger: config.logger })
    this.resourceModule.initialize({
      repository: config.repository,
      logger: config.logger
    })

    // Создаем Query Bus и регистрируем handlers
    const queryBus = new InMemoryQueryBus()
    this.resourceModule.registerQueryHandlers(queryBus)
    this.systemModule.registerQueryHandlers(queryBus)
    this.queryBus = queryBus

    // Создаем Command Bus и регистрируем handlers
    const commandBus = new InMemoryCommandBus()
    this.resourceModule.registerCommandHandlers(commandBus)
    this.systemModule.registerCommandHandlers(commandBus)
    this.commandBus = commandBus

    // Создаем facades
    this.queryFacade = new QueryFacade(queryBus)
    this.commandFacade = new CommandFacade(commandBus)

    this.initialized = true
  }

  static getQueries(): Validation<IError[], QueryFacade> {
    return isTrue(
      this.queryFacade !== null,
      this.queryFacade!
    )
      .valid()
      .invalid([
        new InfrastructureError(
          'ServiceContainer',
          'Container not initialized. Call initialize() first.'
        )
      ])
  }

  static getCommands(): Validation<IError[], CommandFacade> {
    return isTrue(
      this.commandFacade !== null,
      this.commandFacade!
    )
      .valid()
      .invalid([
        new InfrastructureError(
          'ServiceContainer',
          'Container not initialized. Call initialize() first.'
        )
      ])
  }

  static getLogger(): Validation<IError[], ILogger> {
    return isTrue(
      this.initialized,
      undefined
    )
      .valid()
      .invalid([
        new InfrastructureError(
          'ServiceContainer',
          'Container not initialized. Call initialize() first.'
        )
      ])
      .chain(() => this.systemModule.getLogger())
  }

  /**
   * Reset для тестов (сбрасываем инстансы)
   */
  static reset(): void {
    this.resourceModule.reset()
    this.systemModule.reset()
    this.queryBus = null
    this.commandBus = null
    this.queryFacade = null
    this.commandFacade = null
    this.initialized = false
  }
}
