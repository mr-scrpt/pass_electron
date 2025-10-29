import { BaseError } from '@/main/shared/errors/BaseError';
import { GenericApplicationError } from '@/main/application/errors';
import type { IError } from '@/main/shared/errors';

/**
 * Platform Error - ошибка Platform Layer
 * 
 * Используется для проблем на уровне платформы:
 * - DI initialization failures
 * - Platform-specific resource errors
 * - Adapter initialization errors
 * 
 * Это unexpected (неожиданная) ошибка - скрываем от пользователя
 */
export class PlatformError extends BaseError {
  constructor(
    entityType: string,
    message: string,
    public readonly underlyingErrors: IError[],
    context?: Record<string, unknown>
  ) {
    super({
      entityType,
      message,
      code: 'PLATFORM_ERROR',
      context: {
        ...context,
        underlyingErrorsCount: underlyingErrors.length,
      },
    });
    this.name = 'PlatformError';
  }

  /**
   * Platform errors = unexpected (скрываем от пользователя)
   */
  isExpected(): boolean {
    return false;
  }

  /**
   * Platform errors логируем как error
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'error';
  }

  /**
   * Platform errors заменяем на generic message
   */
  toUserError(): IError {
    return new GenericApplicationError(
      'Application initialization failed',
      this
    );
  }

  /**
   * Получить список underlying ошибок
   */
  getUnderlyingErrors(): IError[] {
    return this.underlyingErrors;
  }

  /**
   * Расширенный toJSON с underlying errors
   */
  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      underlyingErrors: this.underlyingErrors.map(err => {
        if ('toJSON' in err && typeof err.toJSON === 'function') {
          return err.toJSON() as Record<string, unknown>;
        }
        return { message: err.getMessage() };
      }),
    };
  }
}
