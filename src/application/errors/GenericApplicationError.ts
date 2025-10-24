import type { AppError } from '@/shared/errors/AppError'

/**
 * Generic ошибка Application Layer
 * 
 * Используется когда нужно вернуть пользователю общее сообщение
 * без детализации infrastructure проблем
 * 
 * Пример:
 * "Service temporarily unavailable"
 * "Cannot load resources"
 */
export class GenericApplicationError extends Error implements AppError {
  readonly code = 'APPLICATION_ERROR'
  readonly isOperational = true  // Показываем пользователю
  readonly severity = 'medium' as const
  readonly cause?: Error
  readonly context?: Record<string, unknown>
  
  constructor(
    message: string,
    cause?: Error | Error[],
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'GenericApplicationError'
    this.cause = Array.isArray(cause) ? cause[0] : cause
    this.context = context
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
