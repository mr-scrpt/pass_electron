import type { IError } from '@/shared/errors';
import { GenericApplicationError } from '@/application/errors';

/**
 * Ошибка хранилища (Infrastructure Layer)
 * 
 * Используется когда:
 * - Нет доступа к БД/файловой системе
 * - Ошибка записи/чтения
 * - Превышена квота
 * 
 * Это unexpected (неожиданная) ошибка - скрываем от пользователя
 */
export class StorageError extends Error implements IError {
  private readonly _message: string;
  private readonly _context?: Record<string, unknown>;
  readonly cause?: Error;

  constructor(
    message: string,
    cause?: Error,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'StorageError';
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
    return `Storage error: ${this._message}`;
  }

  getCode(): string {
    return 'STORAGE_ERROR';
  }

  getContext(): Record<string, unknown> {
    return {
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
      'Data access problem. Please try again.',
      this
    );
  }
}
