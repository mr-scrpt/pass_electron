import { BaseError } from './BaseError'
import { GenericApplicationError } from '@/application/errors'
import type { IError } from './IError'

/**
 * Infrastructure Error - unexpected ошибка
 * 
 * Используется для всех технических проблем:
 * - API errors (5xx, timeout)
 * - Network errors (нет соединения, DNS)
 * - Storage errors (quota, permission)
 * 
 * Это unexpected (неожиданная) ошибка - скрываем от пользователя
 */
export class InfrastructureError extends BaseError {
  constructor(
    entityType: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super({
      entityType,
      message,
      code: 'INFRASTRUCTURE_ERROR',
      context
    })
    this.name = 'InfrastructureError'
  }

  /**
   * Infrastructure errors = unexpected (скрываем от пользователя)
   */
  isExpected(): boolean {
    return false
  }

  /**
   * Infrastructure errors логируем как error
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'error'
  }

  /**
   * Infrastructure errors заменяем на generic message
   */
  toUserError(): IError {
    return new GenericApplicationError(
      'Service temporarily unavailable',
      this
    )
  }
}
