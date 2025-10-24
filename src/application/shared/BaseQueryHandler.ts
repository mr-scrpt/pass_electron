import { ErrorClassifier } from '@/shared/errors/ErrorClassifier'
import { GenericApplicationError } from '@/application/errors'
import type { Validation } from '@/shared/validation'
import { invalid } from '@/shared/validation'
import type { ILogger } from '@/application/ports'

/**
 * Базовый класс для Query Handlers с общей логикой обработки ошибок
 * 
 * Предоставляет переиспользуемые методы:
 * - checkInfrastructureErrors() - проверка infrastructure/unknown ошибок
 * - handleRepositoryResult() - обработка результата Repository
 * - logQueryExecution() - логирование начала запроса
 * - logQuerySuccess() - логирование успеха
 * 
 * Использование:
 * ```typescript
 * export class ListResourcesQueryHandler extends BaseQueryHandler {
 *   constructor(
 *     private readonly repo: IResourceRepository,
 *     logger: ILogger
 *   ) {
 *     super(logger)
 *   }
 *   
 *   async handle(query: ListResourcesQuery): Promise<Validation<Error[], DTO[]>> {
 *     this.logQueryExecution('ListResourcesQuery')
 *     
 *     const result = await this.repo.findAll()
 *     
 *     const error = this.handleRepositoryResult(result, 'find all resources')
 *     if (error !== null) return error
 *     
 *     this.logQuerySuccess('ListResourcesQuery')
 *     return result
 *   }
 * }
 * ```
 */
export abstract class BaseQueryHandler {
  protected readonly logger: ILogger
  
  constructor(logger: ILogger) {
    this.logger = logger
  }
  
  /**
   * Проверяет наличие infrastructure/unknown ошибок и логирует их
   * 
   * @param errors - массив ошибок для проверки
   * @param operation - название операции (для логирования)
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
          severity: e.severity
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
        `Cannot ${operation}: service temporarily unavailable`
      )
    ])
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
   * Логирует начало выполнения запроса
   */
  protected logQueryExecution(
    queryName: string,
    context?: Record<string, unknown>
  ): void {
    this.logger.info(`Executing query: ${queryName}`, context)
  }
  
  /**
   * Логирует успешное выполнение запроса
   */
  protected logQuerySuccess(
    queryName: string,
    result?: Record<string, unknown>
  ): void {
    this.logger.info(`Query executed successfully: ${queryName}`, result)
  }
  
  /**
   * Логирует ошибку выполнения запроса
   */
  protected logQueryFailure(
    queryName: string,
    errors: Error[]
  ): void {
    const errorCheck = ErrorClassifier.check(errors)
    
    if (errorCheck.hasInfrastructureErrors || errorCheck.hasUnknownErrors) {
      this.logger.error(`Query failed: ${queryName}`, {
        infrastructure: errorCheck.classification.infrastructure,
        unknown: errorCheck.classification.unknown
      })
    }
  }
}
