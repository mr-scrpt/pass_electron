# ErrorClassifier - Reference Implementation

Полная реализация утилиты для классификации ошибок БЕЗ instanceof.

> 📖 **Использование:** См. [APPLICATION_ERROR_HANDLING.md](./APPLICATION_ERROR_HANDLING.md) для практических примеров

---

## 📁 Файл: `src/shared/errors/ErrorClassifier.ts`

### Полная реализация

#### ErrorClassifier [#class:ErrorClassifier|#code]

```typescript
// ==================== src/shared/errors/ErrorClassifier.ts ====================

import type { AppError } from './AppError'
import type { ILogger } from '@/application/ports'

/**
 * Результат классификации ошибок
 */
export type ErrorClassification = {
  /** Операционные ошибки (показываем пользователю) */
  operational: AppError[]
  
  /** Инфраструктурные ошибки (логируем, не показываем) */
  infrastructure: AppError[]
  
  /** Неизвестные ошибки (баги, логируем с stack trace) */
  unknown: Error[]
}

/**
 * Результат быстрой проверки наличия ошибок
 */
export type ErrorCheckResult = {
  /** Есть ли инфраструктурные ошибки */
  hasInfrastructureErrors: boolean
  
  /** Есть ли операционные ошибки */
  hasOperationalErrors: boolean
  
  /** Есть ли неизвестные ошибки */
  hasUnknownErrors: boolean
  
  /** Есть ли ЛЮБЫЕ ошибки */
  hasAnyErrors: boolean
  
  /** Полная классификация */
  classification: ErrorClassification
}

/**
 * Утилита для классификации и работы с ошибками
 * 
 * Основные методы:
 * - classify() - разделяет ошибки по типам БЕЗ instanceof
 * - check() - проверяет наличие + классификация
 * - hasInfrastructureErrors() - быстрая проверка
 * - getUserMessage() - generic сообщение для пользователя
 * - log() - логирование с правильными уровнями
 * 
 * Использование:
 * ```typescript
 * const result = await repo.findByName(name)
 * 
 * if (result.isLeft()) {
 *   const errorCheck = ErrorClassifier.check(result.value)
 *   
 *   if (errorCheck.hasInfrastructureErrors) {
 *     ErrorClassifier.log(result.value, logger, 'find resource')
 *     return invalid([new ApplicationError('Service error')])
 *   }
 * }
 * ```
 */
export class ErrorClassifier {
  /**
   * Классифицирует ошибки по типам БЕЗ instanceof
   * 
   * Разделяет массив ошибок на:
   * - operational (isOperational = true) - показываем пользователю
   * - infrastructure (isOperational = false) - логируем, не показываем
   * - unknown (не AppError) - баги, логируем с stack trace
   * 
   * @param errors - массив ошибок для классификации
   * @returns объект с разделенными ошибками
   * 
   * @example
   * ```typescript
   * const errors = [
   *   new NetworkError('Connection failed'),
   *   new InvariantViolationError('Invalid value'),
   *   new Error('Unknown bug')
   * ]
   * 
   * const { operational, infrastructure, unknown } = ErrorClassifier.classify(errors)
   * 
   * console.log(operational.length)      // 1 - InvariantViolationError
   * console.log(infrastructure.length)   // 1 - NetworkError
   * console.log(unknown.length)          // 1 - Error
   * ```
   */
  static classify(errors: Error[]): ErrorClassification {
    const operational: AppError[] = []
    const infrastructure: AppError[] = []
    const unknown: Error[] = []
    
    for (const error of errors) {
      if (this.isAppError(error)) {
        // Разделяем по isOperational БЕЗ instanceof!
        if (error.isOperational) {
          operational.push(error)
        } else {
          infrastructure.push(error)
        }
      } else {
        // Не AppError - это баг!
        unknown.push(error)
      }
    }
    
    return { operational, infrastructure, unknown }
  }
  
  /**
   * Проверяет наличие ошибок и возвращает удобный объект
   * 
   * Комбинирует classify() + быстрые флаги для проверки
   * 
   * @param errors - массив ошибок
   * @returns объект с флагами + классификация
   * 
   * @example
   * ```typescript
   * const result = await repo.save(resource)
   * 
   * if (result.isLeft()) {
   *   const errorCheck = ErrorClassifier.check(result.value)
   *   
   *   if (errorCheck.hasInfrastructureErrors) {
   *     // Не можем продолжать - сервис недоступен
   *     return invalid([new ApplicationError('Service error')])
   *   }
   *   
   *   if (errorCheck.hasOperationalErrors) {
   *     // Бизнес-ошибки - показываем пользователю
   *     return result
   *   }
   * }
   * ```
   */
  static check(errors: Error[]): ErrorCheckResult {
    const classification = this.classify(errors)
    
    return {
      hasInfrastructureErrors: classification.infrastructure.length > 0,
      hasOperationalErrors: classification.operational.length > 0,
      hasUnknownErrors: classification.unknown.length > 0,
      hasAnyErrors: errors.length > 0,
      classification
    }
  }
  
  /**
   * Извлекает только инфраструктурные ошибки
   * 
   * @param errors - массив ошибок
   * @returns только infrastructure ошибки
   * 
   * @example
   * ```typescript
   * const infrastructure = ErrorClassifier.getInfrastructure(errors)
   * logger.error('Infrastructure errors:', { errors: infrastructure })
   * ```
   */
  static getInfrastructure(errors: Error[]): AppError[] {
    return this.classify(errors).infrastructure
  }
  
  /**
   * Извлекает только операционные ошибки
   * 
   * @param errors - массив ошибок
   * @returns только operational ошибки
   * 
   * @example
   * ```typescript
   * const operational = ErrorClassifier.getOperational(errors)
   * return json({ 
   *   errors: operational.map(e => ({ code: e.code, message: e.message })) 
   * })
   * ```
   */
  static getOperational(errors: Error[]): AppError[] {
    return this.classify(errors).operational
  }
  
  /**
   * Проверяет, есть ли инфраструктурные ошибки (быстрая проверка)
   * 
   * Использует Array.some для early exit - быстрее чем classify()
   * 
   * @param errors - массив ошибок
   * @returns true если есть хотя бы одна infrastructure ошибка
   * 
   * @example
   * ```typescript
   * if (ErrorClassifier.hasInfrastructureErrors(errors)) {
   *   return invalid([new ApplicationError('Service temporarily unavailable')])
   * }
   * ```
   */
  static hasInfrastructureErrors(errors: Error[]): boolean {
    return errors.some(e => this.isAppError(e) && !e.isOperational)
  }
  
  /**
   * Проверяет, есть ли операционные ошибки (быстрая проверка)
   * 
   * @param errors - массив ошибок
   * @returns true если есть хотя бы одна operational ошибка
   * 
   * @example
   * ```typescript
   * if (ErrorClassifier.hasOperationalErrors(errors)) {
   *   // Показываем детали пользователю
   *   return json({ errors: errors.map(e => e.message) })
   * }
   * ```
   */
  static hasOperationalErrors(errors: Error[]): boolean {
    return errors.some(e => this.isAppError(e) && e.isOperational)
  }
  
  /**
   * Создает generic сообщение об ошибке для пользователя
   * 
   * Логика:
   * - Операционные - детальные сообщения (через ; )
   * - Инфраструктурные - "Service temporarily unavailable"
   * - Неизвестные - "An unexpected error occurred"
   * 
   * @param errors - массив ошибок
   * @returns сообщение для показа пользователю
   * 
   * @example
   * ```typescript
   * const result = await commands.create(cmd)
   * 
   * if (result.isLeft()) {
   *   const message = ErrorClassifier.getUserMessage(result.value)
   *   return json({ error: message })
   * }
   * ```
   */
  static getUserMessage(errors: Error[]): string {
    const { operational, infrastructure, unknown } = this.classify(errors)
    
    if (operational.length > 0) {
      // Операционные - показываем детали
      return operational.map(e => e.message).join('; ')
    }
    
    if (infrastructure.length > 0) {
      // Инфраструктурные - generic
      return 'Service temporarily unavailable. Please try again later.'
    }
    
    if (unknown.length > 0) {
      // Неизвестные - самый generic
      return 'An unexpected error occurred. Please contact support.'
    }
    
    return 'Unknown error'
  }
  
  /**
   * Логирует ошибки с правильными уровнями
   * 
   * Уровни логирования:
   * - Operational (low severity) - INFO
   * - Operational (medium/high severity) - WARN
   * - Infrastructure - ERROR с деталями
   * - Unknown - ERROR с stack trace
   * 
   * @param errors - массив ошибок
   * @param logger - инстанс логгера
   * @param context - контекст операции (для сообщения)
   * 
   * @example
   * ```typescript
   * const result = await repo.save(resource)
   * 
   * if (result.isLeft()) {
   *   ErrorClassifier.log(result.value, this.logger, 'save resource')
   *   // Автоматически логирует с правильными уровнями
   * }
   * ```
   */
  static log(
    errors: Error[],
    logger: ILogger,
    context: string
  ): void {
    const { operational, infrastructure, unknown } = this.classify(errors)
    
    // Операционные - INFO/WARN в зависимости от severity
    if (operational.length > 0) {
      operational.forEach(e => {
        if (e.severity === 'high') {
          logger.warn(`${context}: ${e.message}`, { 
            code: e.code,
            severity: e.severity
          })
        } else {
          logger.info(`${context}: ${e.message}`, { 
            code: e.code,
            severity: e.severity
          })
        }
      })
    }
    
    // Инфраструктурные - ERROR
    if (infrastructure.length > 0) {
      logger.error(`${context}: Infrastructure errors`, {
        errors: infrastructure.map(e => ({
          code: e.code,
          message: e.message,
          severity: e.severity,
          cause: e.cause
        }))
      })
    }
    
    // Неизвестные - ERROR с stack
    if (unknown.length > 0) {
      logger.error(`${context}: Unknown errors`, {
        errors: unknown.map(e => ({
          name: e.name,
          message: e.message,
          stack: e.stack
        }))
      })
    }
  }
  
  /**
   * Type guard для проверки что ошибка - это AppError
   * 
   * Проверяет наличие обязательных полей вместо instanceof
   * 
   * @param error - ошибка для проверки
   * @returns true если это AppError
   * 
   * @private
   */
  private static isAppError(error: Error): error is AppError {
    return (
      'code' in error &&
      'isOperational' in error &&
      'severity' in error &&
      typeof (error as AppError).code === 'string' &&
      typeof (error as AppError).isOperational === 'boolean' &&
      (
        (error as AppError).severity === 'low' ||
        (error as AppError).severity === 'medium' ||
        (error as AppError).severity === 'high'
      )
    )
  }
  
  /**
   * Форматирует ошибки для API response
   * 
   * @param errors - массив ошибок
   * @returns массив объектов для JSON response
   * 
   * @example
   * ```typescript
   * if (result.isLeft()) {
   *   const formatted = ErrorClassifier.formatForResponse(result.value)
   *   return json({ errors: formatted }, { status: 400 })
   * }
   * ```
   */
  static formatForResponse(errors: Error[]): Array<{ code: string; message: string }> {
    const operational = this.getOperational(errors)
    
    return operational.map(e => ({
      code: e.code,
      message: e.message
    }))
  }
  
  /**
   * Проверяет, нужно ли продолжать выполнение операции
   * 
   * Возвращает false если есть infrastructure или unknown ошибки
   * (то есть если есть критические ошибки, которые блокируют операцию)
   * 
   * @param errors - массив ошибок
   * @returns true если можно продолжать (только operational ошибки или нет ошибок)
   * 
   * @example
   * ```typescript
   * const duplicateCheck = await repo.findByName(name)
   * 
   * if (duplicateCheck.isLeft()) {
   *   if (!ErrorClassifier.canContinue(duplicateCheck.value)) {
   *     // Критические ошибки - нельзя продолжать
   *     return invalid([new ApplicationError('Cannot verify duplicates')])
   *   }
   *   
   *   // Только operational - можем продолжать
   * }
   * ```
   */
  static canContinue(errors: Error[]): boolean {
    const errorCheck = this.check(errors)
    return !errorCheck.hasInfrastructureErrors && !errorCheck.hasUnknownErrors
  }
}
```

---

## 📊 Сравнение производительности

### Array.some vs classify

```typescript
// ✅ Быстро - early exit
ErrorClassifier.hasInfrastructureErrors(errors)  // Array.some

// ⚠️ Медленнее - проходит весь массив
const { infrastructure } = ErrorClassifier.classify(errors)
if (infrastructure.length > 0) { }
```

**Когда использовать:**
- `hasInfrastructureErrors()` - когда нужна только проверка
- `classify()` - когда нужны сами ошибки для обработки

---

## 🧪 Unit тесты

### Пример полного тестирования

#### ErrorClassifier.test.ts [#code]

```typescript
// ==================== src/shared/errors/__tests__/ErrorClassifier.test.ts ====================

import { describe, it, expect, vi } from 'vitest'
import { ErrorClassifier } from '../ErrorClassifier'
import { InvariantViolationError } from '@/domain/shared/errors'
import { NetworkError, DatabaseError } from '@/infrastructure/errors'

describe('ErrorClassifier', () => {
  describe('classify()', () => {
    it('should classify operational errors', () => {
      const errors = [
        new InvariantViolationError('Invalid value'),
        new Error('Unknown error')
      ]
      
      const result = ErrorClassifier.classify(errors)
      
      expect(result.operational).toHaveLength(1)
      expect(result.operational[0]).toBeInstanceOf(InvariantViolationError)
      expect(result.infrastructure).toHaveLength(0)
      expect(result.unknown).toHaveLength(1)
    })
    
    it('should classify infrastructure errors', () => {
      const errors = [
        new NetworkError('Connection failed'),
        new DatabaseError('Query timeout')
      ]
      
      const result = ErrorClassifier.classify(errors)
      
      expect(result.operational).toHaveLength(0)
      expect(result.infrastructure).toHaveLength(2)
      expect(result.unknown).toHaveLength(0)
    })
    
    it('should handle mixed errors', () => {
      const errors = [
        new InvariantViolationError('Invalid'),
        new NetworkError('Network failed'),
        new Error('Bug')
      ]
      
      const result = ErrorClassifier.classify(errors)
      
      expect(result.operational).toHaveLength(1)
      expect(result.infrastructure).toHaveLength(1)
      expect(result.unknown).toHaveLength(1)
    })
  })
  
  describe('check()', () => {
    it('should return correct flags', () => {
      const errors = [
        new NetworkError('Connection failed'),
        new InvariantViolationError('Invalid')
      ]
      
      const result = ErrorClassifier.check(errors)
      
      expect(result.hasInfrastructureErrors).toBe(true)
      expect(result.hasOperationalErrors).toBe(true)
      expect(result.hasUnknownErrors).toBe(false)
      expect(result.hasAnyErrors).toBe(true)
    })
    
    it('should handle empty array', () => {
      const result = ErrorClassifier.check([])
      
      expect(result.hasAnyErrors).toBe(false)
    })
  })
  
  describe('getUserMessage()', () => {
    it('should return operational messages', () => {
      const errors = [
        new InvariantViolationError('Invalid value'),
        new InvariantViolationError('Too short')
      ]
      
      const message = ErrorClassifier.getUserMessage(errors)
      
      expect(message).toBe('Invalid value; Too short')
    })
    
    it('should return generic for infrastructure', () => {
      const errors = [new NetworkError('Connection failed')]
      
      const message = ErrorClassifier.getUserMessage(errors)
      
      expect(message).toBe('Service temporarily unavailable. Please try again later.')
    })
    
    it('should return generic for unknown', () => {
      const errors = [new Error('Bug')]
      
      const message = ErrorClassifier.getUserMessage(errors)
      
      expect(message).toBe('An unexpected error occurred. Please contact support.')
    })
  })
  
  describe('log()', () => {
    it('should log with correct levels', () => {
      const logger = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      }
      
      const errors = [
        new InvariantViolationError('Invalid'),  // INFO
        new NetworkError('Network failed')        // ERROR
      ]
      
      ErrorClassifier.log(errors, logger, 'test operation')
      
      expect(logger.info).toHaveBeenCalled()
      expect(logger.error).toHaveBeenCalled()
    })
  })
  
  describe('canContinue()', () => {
    it('should return false for infrastructure errors', () => {
      const errors = [new NetworkError('Failed')]
      
      expect(ErrorClassifier.canContinue(errors)).toBe(false)
    })
    
    it('should return true for operational errors', () => {
      const errors = [new InvariantViolationError('Invalid')]
      
      expect(ErrorClassifier.canContinue(errors)).toBe(true)
    })
  })
})
```

---

## 📚 Связанные документы

- [APPLICATION_ERROR_HANDLING.md](./APPLICATION_ERROR_HANDLING.md) - практические примеры
- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - иерархия ошибок
- [BASE_HANDLERS_REFERENCE.md](./BASE_HANDLERS_REFERENCE.md) - BaseCommandHandler
