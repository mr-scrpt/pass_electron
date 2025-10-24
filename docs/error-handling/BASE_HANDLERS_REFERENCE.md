# BaseCommandHandler & BaseQueryHandler - Reference Implementation

Полная реализация базовых классов для переиспользования логики обработки ошибок в Command/Query Handlers.

> 📖 **Использование:** См. [APPLICATION_ERROR_HANDLING.md](./APPLICATION_ERROR_HANDLING.md) для практических примеров

---

## 📁 Файл: `src/application/shared/BaseCommandHandler.ts`

### Базовый класс для Command Handlers

#### BaseCommandHandler [#class:BaseCommandHandler|#code]

```typescript
// ==================== src/application/shared/BaseCommandHandler.ts ====================

import { ErrorClassifier } from '@/shared/errors/ErrorClassifier'
import { GenericApplicationError, CommandValidationError } from '@/application/errors'
import type { Validation } from '@/shared/validation'
import type { ILogger } from '@/application/ports'
import { invalid } from '@sweet-monads/either'

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
 *     // Используем helper методы...
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
   * Логика:
   * 1. Если нет критических ошибок - возвращает null (можно продолжать)
   * 2. Если есть infrastructure - логирует ERROR, возвращает generic ApplicationError
   * 3. Если есть unknown - логирует ERROR + stack, возвращает generic ApplicationError
   * 
   * @param errors - массив ошибок для проверки
   * @param operation - название операции (для логирования и сообщения)
   * @returns Validation с ошибкой если найдены критические ошибки, null если все OK
   * 
   * @example
   * ```typescript
   * const existingResult = await this.repo.findByName(name)
   * 
   * if (existingResult.isLeft()) {
   *   const error = this.checkInfrastructureErrors(existingResult.value, 'verify duplicates')
   *   if (error !== null) return error
   *   
   *   // Только operational - можем продолжать
   * }
   * ```
   */
  protected checkInfrastructureErrors(
    errors: Error[],
    operation: string
  ): Validation<Error[], never> | null {
    const errorCheck = ErrorClassifier.check(errors)
    
    // Нет критических ошибок - можно продолжать
    if (!errorCheck.hasInfrastructureErrors && !errorCheck.hasUnknownErrors) {
      return null
    }
    
    // Логируем infrastructure ошибки
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
    
    // Логируем unknown ошибки (баги!)
    if (errorCheck.hasUnknownErrors) {
      this.logger.error(`Unknown error: ${operation}`, {
        errors: errorCheck.classification.unknown.map(e => ({
          name: e.name,
          message: e.message,
          stack: e.stack
        }))
      })
    }
    
    // Возвращаем generic ошибку для пользователя
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
   * Оборачивает каждую Domain ошибку в CommandValidationError
   * с контекстным сообщением
   * 
   * @param result - результат с Domain ошибками
   * @param operation - название операции (для сообщения)
   * @returns результат с Application ошибками
   * 
   * @example
   * ```typescript
   * const resourceResult = Resource.create(name, namespace, secret)
   * 
   * if (resourceResult.isLeft()) {
   *   return this.transformDomainErrors(resourceResult, 'create resource')
   * }
   * ```
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
   * Комбинирует проверку на success + checkInfrastructureErrors:
   * 1. Если Right - возвращает null (все OK)
   * 2. Если Left - проверяет infrastructure ошибки
   * 3. Если есть infrastructure - возвращает их (критические)
   * 4. Если только operational - возвращает исходный result
   * 
   * @param result - результат из Repository
   * @param operation - название операции
   * @returns Validation с ошибкой если критические, null если можно продолжать
   * 
   * @example
   * ```typescript
   * const saveResult = await this.repo.save(resource)
   * 
   * const error = this.handleRepositoryResult(saveResult, 'save resource')
   * if (error !== null) return error
   * 
   * // Все OK или только operational ошибки
   * return saveResult
   * ```
   */
  protected handleRepositoryResult<T>(
    result: Validation<Error[], T>,
    operation: string
  ): Validation<Error[], T> | null {
    // Success - ничего не делаем
    if (result.isRight()) {
      return null
    }
    
    // Проверяем критические ошибки
    const errorCheck = this.checkInfrastructureErrors(result.value, operation)
    
    if (errorCheck !== null) {
      return errorCheck  // Критические ошибки найдены
    }
    
    // Только операционные - пробрасываем как есть
    return result
  }
  
  /**
   * Логирует начало выполнения команды
   * 
   * Уровень: INFO
   * 
   * @param commandName - название команды
   * @param context - дополнительный контекст (например, параметры)
   * 
   * @example
   * ```typescript
   * async handle(cmd: CreateResourceCommand): Promise<Validation<Error[], Resource>> {
   *   this.logCommandExecution('CreateResourceCommand', { 
   *     name: cmd.name,
   *     namespace: cmd.namespace
   *   })
   *   
   *   // ...
   * }
   * ```
   */
  protected logCommandExecution(
    commandName: string,
    context?: Record<string, unknown>
  ): void {
    this.logger.info(`Executing command: ${commandName}`, context)
  }
  
  /**
   * Логирует успешное выполнение команды
   * 
   * Уровень: INFO
   * 
   * @param commandName - название команды
   * @param result - результат выполнения (опционально)
   * 
   * @example
   * ```typescript
   * async handle(cmd: CreateResourceCommand): Promise<Validation<Error[], Resource>> {
   *   // ...
   *   
   *   this.logCommandSuccess('CreateResourceCommand', { 
   *     id: resource.id.getValue() 
   *   })
   *   
   *   return valid(resource)
   * }
   * ```
   */
  protected logCommandSuccess(
    commandName: string,
    result?: Record<string, unknown>
  ): void {
    this.logger.info(`Command executed successfully: ${commandName}`, result)
  }
  
  /**
   * Логирует ошибку выполнения команды
   * 
   * Уровень: ERROR (только для infrastructure/unknown)
   * Operational ошибки НЕ логируются как ERROR
   * 
   * @param commandName - название команды
   * @param errors - массив ошибок
   * 
   * @example
   * ```typescript
   * const result = await this.repo.save(resource)
   * 
   * if (result.isLeft()) {
   *   this.logCommandFailure('CreateResourceCommand', result.value)
   *   return result
   * }
   * ```
   */
  protected logCommandFailure(
    commandName: string,
    errors: Error[]
  ): void {
    const errorCheck = ErrorClassifier.check(errors)
    
    // Логируем только infrastructure/unknown как ERROR
    if (errorCheck.hasInfrastructureErrors || errorCheck.hasUnknownErrors) {
      this.logger.error(`Command failed: ${commandName}`, {
        infrastructure: errorCheck.classification.infrastructure,
        unknown: errorCheck.classification.unknown
      })
    }
    
    // Operational логируем как WARN
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
```

---

## 📁 Файл: `src/application/shared/BaseQueryHandler.ts`

### Базовый класс для Query Handlers

#### BaseQueryHandler [#class:BaseQueryHandler|#code]

```typescript
// ==================== src/application/shared/BaseQueryHandler.ts ====================

import { ErrorClassifier } from '@/shared/errors/ErrorClassifier'
import { GenericApplicationError } from '@/application/errors'
import type { Validation } from '@/shared/validation'
import type { ILogger } from '@/application/ports'
import { invalid } from '@sweet-monads/either'

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
 *     this.logQuerySuccess('ListResourcesQuery', { count: result.value.length })
 *     return valid(result.value.map(r => this.toDTO(r)))
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
   * Аналогично BaseCommandHandler.checkInfrastructureErrors()
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
   * Аналогично BaseCommandHandler.handleRepositoryResult()
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
   * 
   * Уровень: INFO
   * 
   * @param queryName - название запроса
   * @param context - дополнительный контекст
   */
  protected logQueryExecution(
    queryName: string,
    context?: Record<string, unknown>
  ): void {
    this.logger.info(`Executing query: ${queryName}`, context)
  }
  
  /**
   * Логирует успешное выполнение запроса
   * 
   * Уровень: INFO
   * 
   * @param queryName - название запроса
   * @param result - результат выполнения (опционально)
   */
  protected logQuerySuccess(
    queryName: string,
    result?: Record<string, unknown>
  ): void {
    this.logger.info(`Query executed successfully: ${queryName}`, result)
  }
  
  /**
   * Логирует ошибку выполнения запроса
   * 
   * Уровень: ERROR (только для infrastructure/unknown)
   * 
   * @param queryName - название запроса
   * @param errors - массив ошибок
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
```

---

## 📊 Паттерны использования

### Паттерн 1: Проверка дубликатов (CREATE)

#### В CreateCommandHandler [#code]

```typescript
export class CreateResourceCommandHandler extends BaseCommandHandler {
  // ...
  
  private async checkDuplicates(
    name: ResourceName
  ): Validation<Error[], null> {
    const existingResult = await this.repo.findByName(name)
    
    if (existingResult.isLeft()) {
      // ✅ Используем helper
      const error = this.checkInfrastructureErrors(
        existingResult.value,
        'verify duplicates'
      )
      if (error !== null) return error
      
      // Только operational (ResourceNotFoundError) - OK для CREATE
      return valid(null)
    }
    
    // Нашли дубликат - ошибка для CREATE
    if (existingResult.value !== null) {
      return invalid([
        new DuplicateResourceError(`Resource "${name.getValue()}" already exists`)
      ])
    }
    
    return valid(null)
  }
}
```

### Паттерн 2: Поиск существующего (UPDATE/DELETE)

#### В UpdateCommandHandler [#code]

```typescript
export class UpdateResourceCommandHandler extends BaseCommandHandler {
  // ...
  
  private async findExistingResource(
    id: ResourceId
  ): Validation<Error[], Resource> {
    const result = await this.repo.findById(id)
    
    if (result.isLeft()) {
      // ✅ Используем helper
      const error = this.checkInfrastructureErrors(result.value, 'find resource')
      if (error !== null) return error
      
      // Только operational - пробрасываем
      return result
    }
    
    // Не нашли - ошибка для UPDATE
    if (result.value === null) {
      return invalid([
        new ResourceNotFoundError(`Resource ${id.getValue()} not found`)
      ])
    }
    
    return valid(result.value)
  }
}
```

### Паттерн 3: Сохранение с обработкой

#### Универсальный паттерн [#code]

```typescript
export class SomeCommandHandler extends BaseCommandHandler {
  async handle(cmd: SomeCommand): Promise<Validation<Error[], Result>> {
    // ... валидация, создание entity ...
    
    // Сохранение
    const saveResult = await this.repo.save(entity)
    
    // ✅ Используем helper - обрабатывает все типы ошибок
    const error = this.handleRepositoryResult(saveResult, 'save entity')
    if (error !== null) return error
    
    return saveResult
  }
}
```

---

## 🧪 Unit тесты

### Тестирование BaseCommandHandler

#### BaseCommandHandler.test.ts [#code]

```typescript
// ==================== src/application/shared/__tests__/BaseCommandHandler.test.ts ====================

import { describe, it, expect, vi } from 'vitest'
import { BaseCommandHandler } from '../BaseCommandHandler'
import { NetworkError } from '@/infrastructure/errors'
import { InvariantViolationError } from '@/domain/shared/errors'
import { invalid, valid } from '@sweet-monads/either'

// Создаем конкретный handler для тестов
class TestCommandHandler extends BaseCommandHandler {
  // Делаем protected методы публичными для тестов
  public testCheckInfrastructureErrors = this.checkInfrastructureErrors
  public testTransformDomainErrors = this.transformDomainErrors
  public testHandleRepositoryResult = this.handleRepositoryResult
}

describe('BaseCommandHandler', () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
  
  let handler: TestCommandHandler
  
  beforeEach(() => {
    handler = new TestCommandHandler(mockLogger)
    vi.clearAllMocks()
  })
  
  describe('checkInfrastructureErrors()', () => {
    it('should return null for operational errors', () => {
      const errors = [new InvariantViolationError('Invalid')]
      
      const result = handler.testCheckInfrastructureErrors(errors, 'test')
      
      expect(result).toBeNull()
      expect(mockLogger.error).not.toHaveBeenCalled()
    })
    
    it('should return error for infrastructure errors', () => {
      const errors = [new NetworkError('Failed')]
      
      const result = handler.testCheckInfrastructureErrors(errors, 'test')
      
      expect(result).not.toBeNull()
      expect(result?.isLeft()).toBe(true)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Infrastructure error: test',
        expect.any(Object)
      )
    })
  })
  
  describe('handleRepositoryResult()', () => {
    it('should return null for success', () => {
      const result = valid('success')
      
      const error = handler.testHandleRepositoryResult(result, 'test')
      
      expect(error).toBeNull()
    })
    
    it('should handle infrastructure errors', () => {
      const result = invalid([new NetworkError('Failed')])
      
      const error = handler.testHandleRepositoryResult(result, 'test')
      
      expect(error).not.toBeNull()
      expect(error?.isLeft()).toBe(true)
    })
    
    it('should return original for operational errors', () => {
      const result = invalid([new InvariantViolationError('Invalid')])
      
      const error = handler.testHandleRepositoryResult(result, 'test')
      
      expect(error).toBe(result)  // Возвращает исходный результат
    })
  })
})
```

---

## 📚 Связанные документы

- [APPLICATION_ERROR_HANDLING.md](./APPLICATION_ERROR_HANDLING.md) - практические примеры
- [ERROR_CLASSIFIER_REFERENCE.md](./ERROR_CLASSIFIER_REFERENCE.md) - ErrorClassifier
- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - иерархия ошибок
