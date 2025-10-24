import type { AppError } from '@/shared/errors/AppError'

/**
 * Ошибка валидации команды
 * 
 * Используется когда Domain/Application валидация не прошла
 * 
 * Пример:
 * "Failed to create resource: Name is too short"
 * "Failed to update resource: Invalid namespace format"
 */
export class CommandValidationError extends Error implements AppError {
  readonly code = 'COMMAND_VALIDATION_ERROR'
  readonly isOperational = true  // Показываем пользователю
  readonly severity = 'medium' as const
  readonly cause?: Error
  readonly context?: Record<string, unknown>
  
  constructor(
    message: string,
    public readonly validationErrors: string[],
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'CommandValidationError'
    this.context = { ...context, validationErrors }
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
