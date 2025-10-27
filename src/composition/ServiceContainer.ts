import type { IResourceRepository } from '@/domain'
import type { ILogger, INotificationManager } from '@/application/ports'
import type { IQueryBus } from '@/application/queries/IQueryBus'
import type { ICommandBus } from '@/application/commands/ICommandBus'
import type { IActionBus } from '@/application/actions'
import { InMemoryQueryBus } from '@/infrastructure/queries/InMemoryQueryBus'
import { InMemoryCommandBus } from '@/infrastructure/commands/InMemoryCommandBus'
import { InMemoryActionBus } from '@/infrastructure/actions'
import { MockResourceRepository } from '@/infrastructure/repositories'
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
 * Инициализирует модули и регистрирует handlers в Query/Command Bus.
 * 
 * ⚠️ ВАЖНО: Управляет БИЗНЕС-СЛОЕМ зависимостями:
 * - Repository (создает MockResourceRepository)
 * - Handlers (регистрирует в Bus)
 * - Bus instances (Query, Command, Action)
 * 
 * Platform-specific зависимости (logger, notificationManager) получает извне.
 * 
 * ✅ Использует инстансы модулей вместо static
 */
export class ServiceContainer {
  // Инстансы модулей (Singleton)
  private static resourceModule = new ResourceModule()
  private static systemModule = new SystemModule()
  
  private static queryBus: IQueryBus | null = null
  private static commandBus: ICommandBus | null = null
  private static actionBus: IActionBus | null = null
  private static notificationManager: INotificationManager | null = null
  private static queryFacade: QueryFacade | null = null
  private static commandFacade: CommandFacade | null = null
  private static initialized = false

  /**
   * Инициализация контейнера
   * 
   * Принимает ТОЛЬКО platform-specific зависимости:
   * - logger (console, файловый, remote)
   * - notificationManager (Web sonner, Electron OS)
   * 
   * Бизнес-слой зависимости создает сам:
   * - repository (MockResourceRepository)
   * - handlers (через модули)
   * 
   * Вызывается ОДИН РАЗ при старте приложения (entry point).
   */
  static initialize(config: {
    logger: ILogger
    notificationManager: INotificationManager
  }): void {
    if (this.initialized) return

    // ✅ Создаем бизнес-слой зависимости ЗДЕСЬ (Composition Layer)
    const repository: IResourceRepository = new MockResourceRepository()

    // Инициализируем модули
    this.systemModule.initialize({ logger: config.logger })
    this.resourceModule.initialize({
      repository,  // ← Создали в Composition Layer
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

    // Создаем Action Bus для Keymap/UI коммуникации
    const actionBus = new InMemoryActionBus()
    this.actionBus = actionBus

    // Сохраняем Notification Manager (создан в entry point)
    this.notificationManager = config.notificationManager

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

  static getActionBus(): Validation<IError[], IActionBus> {
    return isTrue(
      this.actionBus !== null,
      this.actionBus!
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
   * Получить Notification Manager
   * 
   * Возвращает Validation монаду с INotificationManager или ошибкой.
   * Следует монадическому подходу - НЕ throws, а возвращает Result.
   * 
   * @returns Validation<IError[], INotificationManager>
   * 
   * @example
   * // Монадический подход:
   * const result = ServiceContainer.getNotificationManager()
   * result
   *   .map(manager => {
   *     const id = manager.notify({ level: 'success', message: 'Hello!' })
   *     return id
   *   })
   *   .mapLeft(errors => {
   *     console.error('Failed to get NotificationManager:', errors)
   *   })
   */
  static getNotificationManager(): Validation<IError[], INotificationManager> {
    return isTrue(
      this.notificationManager !== null,
      this.notificationManager!
    )
      .valid()
      .invalid([
        new InfrastructureError(
          'ServiceContainer',
          'Container not initialized. Call initialize() first.'
        )
      ])
  }

  /**
   * Reset для тестов (сбрасываем инстансы)
   */
  static reset(): void {
    this.resourceModule.reset()
    this.systemModule.reset()
    this.queryBus = null
    this.commandBus = null
    this.actionBus = null
    this.notificationManager = null
    this.queryFacade = null
    this.commandFacade = null
    this.initialized = false
  }
}
