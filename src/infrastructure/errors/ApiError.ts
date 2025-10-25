import type { IError } from '@/shared/errors';
import { GenericApplicationError } from '@/application/errors';

/**
 * Ошибка внешнего API (Infrastructure Layer)
 * 
 * Используется когда:
 * - API вернул 5xx ошибку
 * - Неожиданный формат ответа
 * - API недоступен
 * 
 * Это unexpected (неожиданная) ошибка - скрываем от пользователя
 */
export class ApiError extends Error implements IError {
  private readonly _message: string;
  private readonly _context?: Record<string, unknown>;
  public readonly statusCode?: number;
  readonly cause?: Error;

  constructor(
    message: string,
    statusCode?: number,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this._message = message;
    this.statusCode = statusCode;
    this.cause = cause;
    this._context = { ...context, statusCode };

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ============================================
  // IError interface methods
  // ============================================

  getMessage(): string {
    return `API error: ${this._message} (${this.statusCode})`;
  }

  getCode(): string {
    return 'API_ERROR';
  }

  getContext(): Record<string, unknown> {
    return {
      statusCode: this.statusCode,
      cause: this.cause?.message,
      stack: this.cause?.stack,
      ...this._context,
    };
  }

  isExpected(): boolean {
    return false;
  }

  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'error';
  }

  toUserError(): IError {
    return new GenericApplicationError(
      'External service error. Please try again later.',
      this
    );
  }
}
