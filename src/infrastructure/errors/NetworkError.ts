import type { IError } from '@/shared/errors';
import { GenericApplicationError } from '@/application/errors';

/**
 * Сетевая ошибка (Infrastructure Layer)
 * 
 * Используется когда:
 * - Нет подключения к серверу
 * - Timeout запроса
 * - DNS не резолвится
 * 
 * Это unexpected (неожиданная) ошибка - скрываем от пользователя
 */
export class NetworkError extends Error implements IError {
  private readonly _message: string;
  private readonly _context?: Record<string, unknown>;
  readonly cause?: Error;

  constructor(
    message: string,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'NetworkError';
    this._message = message;
    this.cause = cause;
    this._context = context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ============================================
  // IError interface methods
  // ============================================

  getMessage(): string {
    return `Network error: ${this._message}`;
  }

  getCode(): string {
    return 'NETWORK_ERROR';
  }

  getContext(): Record<string, unknown> {
    return {
      cause: this.cause?.message,
      stack: this.cause?.stack,
      ...this._context,
    };
  }

  /**
   * Infrastructure errors - неожиданные (unexpected)
   */
  isExpected(): boolean {
    return false;
  }

  /**
   * Infrastructure errors - логируем как error
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'error';
  }

  /**
   * Infrastructure errors - заменяем на generic message
   */
  toUserError(): IError {
    return new GenericApplicationError(
      'Service temporarily unavailable',
      this
    );
  }
}
