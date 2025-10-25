import type { IError } from '@/shared/errors';

/**
 * Ошибка валидации команды (v2.0 - implements IError)
 * 
 * Используется когда Domain/Application валидация не прошла
 * 
 * Пример:
 * "Failed to create resource: Name is too short"
 * "Failed to update resource: Invalid namespace format"
 */
export class CommandValidationError extends Error implements IError {
  private readonly _message: string;
  private readonly _context: Record<string, unknown>;
  
  constructor(
    message: string,
    public readonly validationErrors: string[],
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CommandValidationError';
    this._message = message;
    this._context = { ...context, validationErrors };
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ============================================
  // IError interface methods
  // ============================================

  getMessage(): string {
    return this._message;
  }

  getCode(): string {
    return 'COMMAND_VALIDATION_ERROR';
  }

  getContext(): Record<string, unknown> {
    return this._context;
  }

  /**
   * CommandValidationError - expected (показываем пользователю)
   */
  isExpected(): boolean {
    return true;
  }

  /**
   * Validation errors - логируем как warn
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'warn';
  }

  /**
   * Показываем как есть (валидация для пользователя)
   */
  toUserError(): IError {
    return this;
  }
}
