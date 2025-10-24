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
  hasInfrastructureErrors: boolean
  hasOperationalErrors: boolean
  hasUnknownErrors: boolean
  hasAnyErrors: boolean
  classification: ErrorClassification
}

/**
 * Утилита для классификации и работы с ошибками БЕЗ instanceof
 * 
 * Основные методы:
 * - classify() - разделяет ошибки по типам
 * - check() - проверяет наличие + классификация
 * - hasInfrastructureErrors() - быстрая проверка
 * - getUserMessage() - generic сообщение для пользователя
 * - log() - логирование с правильными уровнями
 */
export class ErrorClassifier {
  /**
   * Классифицирует ошибки по типам БЕЗ instanceof
   */
  static classify(errors: Error[]): ErrorClassification {
    const operational: AppError[] = []
    const infrastructure: AppError[] = []
    const unknown: Error[] = []
    
    for (const error of errors) {
      if (this.isAppError(error)) {
        if (error.isOperational) {
          operational.push(error)
        } else {
          infrastructure.push(error)
        }
      } else {
        unknown.push(error)
      }
    }
    
    return { operational, infrastructure, unknown }
  }
  
  /**
   * Проверяет наличие ошибок и возвращает удобный объект
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
   * Проверяет, есть ли инфраструктурные ошибки (быстрая проверка)
   */
  static hasInfrastructureErrors(errors: Error[]): boolean {
    return errors.some(e => this.isAppError(e) && !e.isOperational)
  }
  
  /**
   * Проверяет, есть ли операционные ошибки (быстрая проверка)
   */
  static hasOperationalErrors(errors: Error[]): boolean {
    return errors.some(e => this.isAppError(e) && e.isOperational)
  }
  
  /**
   * Создает generic сообщение об ошибке для пользователя
   */
  static getUserMessage(errors: Error[]): string {
    const { operational, infrastructure, unknown } = this.classify(errors)
    
    if (operational.length > 0) {
      return operational.map(e => e.message).join('; ')
    }
    
    if (infrastructure.length > 0) {
      return 'Service temporarily unavailable. Please try again later.'
    }
    
    if (unknown.length > 0) {
      return 'An unexpected error occurred. Please contact support.'
    }
    
    return 'Unknown error'
  }
  
  /**
   * Логирует ошибки с правильными уровнями
   */
  static log(
    errors: Error[],
    logger: ILogger,
    context: string
  ): void {
    const { operational, infrastructure, unknown } = this.classify(errors)
    
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
   * Проверяет, нужно ли продолжать выполнение операции
   */
  static canContinue(errors: Error[]): boolean {
    const errorCheck = this.check(errors)
    return !errorCheck.hasInfrastructureErrors && !errorCheck.hasUnknownErrors
  }
}
