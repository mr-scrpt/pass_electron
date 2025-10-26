import { BaseError } from '@/shared/errors/BaseError'
import type { IError } from '@/shared/errors'

/**
 * Generic ошибка Application Layer
 * 
 * Используется когда нужно вернуть пользователю общее сообщение
 * без детализации infrastructure проблем
 * 
 * Примеры:
 * - "Service temporarily unavailable" (для Infrastructure errors)
 * - "Cannot load resources" (для общих ошибок)
 * 
 * Это expected (ожидаемая) ошибка - показываем пользователю
 */
export class GenericApplicationError extends BaseError {
  constructor(
    message: string,
    cause?: Error | IError,
    context?: Record<string, unknown>
  ) {
    super({
      entityType: 'Application',
      message,
      code: 'APPLICATION_ERROR',
      context,
      cause: cause as Error
    })
    this.name = 'GenericApplicationError'
  }

  /**
   * Application errors - логируем как warn
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'warn'
  }

  // isExpected() = true унаследовано от BaseError
  // toUserError() = this унаследовано от BaseError
}
