import { BaseError } from '@/shared/errors/BaseError'

/**
 * Ошибка валидации команды
 * 
 * Используется когда Domain/Application валидация не прошла
 * 
 * Пример:
 * "Failed to create resource: Name is too short"
 * "Failed to update resource: Invalid namespace format"
 */
export class CommandValidationError extends BaseError {
  constructor(
    message: string,
    public readonly validationErrors: string[],
    context?: Record<string, unknown>
  ) {
    super({
      entityType: 'Command',
      message,
      code: 'COMMAND_VALIDATION_ERROR',
      context: { ...context, validationErrors }
    })
    this.name = 'CommandValidationError'
  }

  /**
   * Validation errors - логируем как warn
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'warn'
  }

  // isExpected() = true унаследовано от BaseError
  // toUserError() = this унаследовано от BaseError
}
