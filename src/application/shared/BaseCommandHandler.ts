import { ErrorClassifier } from '@/shared/errors/ErrorClassifier'
import { GenericApplicationError, CommandValidationError } from '@/application/errors'
import type { Validation } from '@/shared/validation'
import { invalid } from '@/shared/validation'
import type { ILogger } from '@/application/ports'

/**
 * Базовый класс для Command Handlers с общей логикой обработки ошибок
 * 
 * Предоставляет переиспользуемые методы:
 * - checkInfrastructureErrors() - проверка infrastructure/unknown ошибок
 * - transformDomainErrors() - трансформация Domain → Application
 * - handleRepositoryResult() - обработка результата Repository
 * - logCommandExecution() - логирование начала команды
 * - logCommandSuccess() - логирование успеха
 * 
 * Использование:
 * ```typescript
 * export class CreateResourceCommandHandler extends BaseCommandHandler {
 *   constructor(
 *     private readonly repo: IResourceRepository,
 *     logger: ILogger
 *   ) {
 *     super(logger)
 *   }
 *   
 *   async handle(cmd: CreateResourceCommand): Promise<Validation<Error[], Resource>> {
 *     this.logCommandExecution('CreateResourceCommand', { name: cmd.name })
 *     
 *     const error = this.checkInfrastructureErrors(errors, 'operation')
 *     if (error !== null) return error
 *     
 *     this.logCommandSuccess('CreateResourceCommand')
 *     return result
 *   }
 * }
 * ```
 */
export abstract class BaseCommandHandler {
  protected readonly logger: ILogger
  
  constructor(logger: ILogger) {
    this.logger = logger
  }
  
  /**
   * Проверяет наличие infrastructure/unknown ошибок и логирует их
   * 
   * @param errors - массив ошибок для проверки
   * @param operation - название операции (для логирования и сообщения)
   * @returns Validation с ошибкой если найдены критические ошибки, null если все OK
   */
  protected checkInfrastructureErrors(
    errors: Error[],
    operation: string
  ): Validation<Error[], never> | null {
    const errorCheck = ErrorClassifier.check(errors)
    
    if (!errorCheck.hasInfrastructureErrors && !errorCheck.hasUnknownErrors) {
      return null
    }
    
    if (errorCheck.hasInfrastructureErrors) {
      this.logger.error(`Infrastructure error: ${operation}`, {
        errors: errorCheck.classification.infrastructure.map(e => ({
          code: e.code,
          message: e.message,
          severity: e.severity,
          cause: e.cause
        }))
      })
    }
    
    if (errorCheck.hasUnknownErrors) {
      this.logger.error(`Unknown error: ${operation}`, {
        errors: errorCheck.classification.unknown.map(e => ({
          name: e.name,
          message: e.message,
          stack: e.stack
        }))
      })
    }
    
    return invalid([
      new GenericApplicationError(
        `Cannot ${operation}: service temporarily unavailable`,
        [...errorCheck.classification.infrastructure, ...errorCheck.classification.unknown]
      )
    ])
  }
  
  /**
   * Трансформирует Domain ошибки в Application контекст
   * 
   * @param result - результат с Domain ошибками
   * @param operation - название операции (для сообщения)
   * @returns результат с Application ошибками
   */
  protected transformDomainErrors(
    result: Validation<Error[], never>,
    operation: string
  ): Validation<Error[], never> {
    return result.mapLeft(errors =>
      errors.map(e => 
        new CommandValidationError(
          `Failed to ${operation}: ${e.message}`,
          errors.map(err => err.message)
        )
      )
    )
  }
  
  /**
   * Обрабатывает результат из Repository
   * 
   * @param result - результат из Repository
   * @param operation - название операции
   * @returns Validation с ошибкой если критические, null если можно продолжать
   */
  protected handleRepositoryResult<T>(
    result: Validation<Error[], T>,
    operation: string
  ): Validation<Error[], T> | null {
    if (result.isRight()) {
      return null
    }
    
    const errorCheck = this.checkInfrastructureErrors(result.value, operation)
    
    if (errorCheck !== null) {
      return errorCheck
    }
    
    return result
  }
  
  /**
   * Логирует начало выполнения команды
   */
  protected logCommandExecution(
    commandName: string,
    context?: Record<string, unknown>
  ): void {
    this.logger.info(`Executing command: ${commandName}`, context)
  }
  
  /**
   * Логирует успешное выполнение команды
   */
  protected logCommandSuccess(
    commandName: string,
    result?: Record<string, unknown>
  ): void {
    this.logger.info(`Command executed successfully: ${commandName}`, result)
  }
  
  /**
   * Логирует ошибку выполнения команды
   */
  protected logCommandFailure(
    commandName: string,
    errors: Error[]
  ): void {
    const errorCheck = ErrorClassifier.check(errors)
    
    if (errorCheck.hasInfrastructureErrors || errorCheck.hasUnknownErrors) {
      this.logger.error(`Command failed: ${commandName}`, {
        infrastructure: errorCheck.classification.infrastructure,
        unknown: errorCheck.classification.unknown
      })
    }
    
    if (errorCheck.hasOperationalErrors) {
      this.logger.warn(`Command validation failed: ${commandName}`, {
        operational: errorCheck.classification.operational.map(e => ({
          code: e.code,
          message: e.message
        }))
      })
    }
  }
}
