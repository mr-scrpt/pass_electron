import type { IError } from '@/shared/errors';

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
export class GenericApplicationError extends Error implements IError {
  private readonly _message: string;
  private readonly _context?: Record<string, unknown>;
  readonly cause?: Error;
  
  constructor(
    message: string,
    cause?: Error | IError,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GenericApplicationError';
    this._message = message;
    this.cause = cause as Error;
    this._context = context;
    
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
    return 'APPLICATION_ERROR';
  }

  getContext(): Record<string, unknown> {
    return {
      cause: this.cause?.message,
      ...this._context,
    };
  }

  /**
   * GenericApplicationError - expected (показываем пользователю)
   */
  isExpected(): boolean {
    return true;
  }

  /**
   * Application errors - логируем как warn
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'warn';
  }

  /**
   * Показываем как есть (уже generic message)
   */
  toUserError(): IError {
    return this;
  }
}
