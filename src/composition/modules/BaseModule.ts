import type { IQueryBus } from '@/application/queries/IQueryBus'
import type { ICommandBus } from '@/application/commands/ICommandBus'
import type { Validation } from '@/shared/validation'
import { isTrue } from '@/shared/validation'
import type { IError } from '@/shared/errors'
import { InfrastructureError } from '@/shared/errors'

/**
 * Base Module - абстрактный класс для всех модулей
 * 
 * Предоставляет:
 * - Общую логику инициализации
 * - Монадическую проверку dependencies
 * - Единый интерфейс для регистрации handlers
 * 
 * @template TConfig - конфигурация модуля при инициализации
 * @template TDeps - зависимости модуля после инициализации
 */
export abstract class BaseModule<TConfig, TDeps> {
  protected dependencies: TDeps | null = null

  /**
   * Инициализация модуля
   * Вызывается один раз при старте приложения
   */
  initialize(config: TConfig): void {
    this.dependencies = this.buildDependencies(config)
  }

  /**
   * Построение зависимостей из конфигурации
   * Каждый модуль реализует свою логику
   */
  protected abstract buildDependencies(config: TConfig): TDeps

  /**
   * Проверка инициализации - монадический подход БЕЗ if/throw
   * ✅ Возвращает Validation<IError[], TDeps>
   */
  protected checkInitialization(): Validation<IError[], TDeps> {
    return isTrue(
      this.dependencies !== null,
      this.dependencies!
    )
      .valid()
      .invalid([
        new InfrastructureError(
          this.constructor.name,
          'Module not initialized. Call initialize() first.'
        )
      ])
  }

  /**
   * Регистрация Query handlers в Query Bus
   * Каждый модуль регистрирует свои handlers
   */
  abstract registerQueryHandlers(queryBus: IQueryBus): void

  /**
   * Регистрация Command handlers в Command Bus
   * Каждый модуль регистрирует свои handlers
   */
  abstract registerCommandHandlers(commandBus: ICommandBus): void

  /**
   * Reset для тестов
   */
  reset(): void {
    this.dependencies = null
  }
}
