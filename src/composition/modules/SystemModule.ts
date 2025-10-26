import type { ILogger } from '@/application/ports'
import type { IQueryBus } from '@/application/queries/IQueryBus'
import type { ICommandBus } from '@/application/commands/ICommandBus'
import type { Validation } from '@/shared/validation'
import type { IError } from '@/shared/errors'
import { BaseModule } from './BaseModule'

/**
 * System Module - DI для системных сервисов
 * 
 * Управляет Logger и другими системными зависимостями
 * Наследует BaseModule для унификации структуры модулей
 */
export class SystemModule extends BaseModule<
  { logger: ILogger },
  { logger: ILogger }
> {
  /**
   * Построение зависимостей - просто возвращаем config as is
   */
  protected buildDependencies(config: { logger: ILogger }): { logger: ILogger } {
    return config
  }

  /**
   * Получить Logger
   * ✅ Возвращает Validation через checkInitialization()
   */
  getLogger(): Validation<IError[], ILogger> {
    return this.checkInitialization().map(({ logger }) => logger)
  }

  /**
   * SystemModule не регистрирует Query handlers
   */
  registerQueryHandlers(_queryBus: IQueryBus): void {
    // No query handlers in SystemModule
  }

  /**
   * SystemModule не регистрирует Command handlers
   */
  registerCommandHandlers(_commandBus: ICommandBus): void {
    // No command handlers in SystemModule
  }

}
