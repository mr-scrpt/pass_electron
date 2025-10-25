import type { IError } from './IError';

/**
 * Параметры для создания BaseError
 * Используем именованные поля для предотвращения ошибок с порядком параметров
 */
export interface BaseErrorProps {
  readonly entityType: string;
  readonly message: string;
  readonly code: string;
  readonly context?: Record<string, unknown>;
  readonly cause?: Error;
}

/**
 * Базовый класс для ошибок приложения
 *
 * Используется как основа для Domain errors
 * Infrastructure errors НЕ используют BaseError (имплементируют IError напрямую)
 *
 * @property entityType - тип сущности или компонента где произошла ошибка
 * @property message - человекочитаемое описание ошибки
 * @property code - код ошибки (для категоризации)
 * @property context - контекст (дополнительные данные)
 * @property cause - причина (вложенная ошибка)
 */
export class BaseError extends Error implements IError {
  public readonly timestamp: Date;
  public readonly entityType: string;
  private readonly _message: string;
  private readonly _code: string;
  private readonly _context?: Record<string, unknown>;
  public readonly cause?: Error;

  constructor(props: BaseErrorProps) {
    super(props.message);
    this.name = "BaseError";
    this.timestamp = new Date();
    this.entityType = props.entityType;
    this._message = props.message;
    this._code = props.code;
    this._context = props.context;
    this.cause = props.cause;

    // Сохраняем stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Сохраняем причину (для цепочки ошибок)
    if (props.cause && "cause" in Error.prototype) {
      this.cause = props.cause;
    }
  }

  // ============================================
  // IError interface methods
  // ============================================

  getMessage(): string {
    return `[${this.entityType}] ${this._message}`;
  }

  getCode(): string {
    return this._code;
  }

  getContext(): Record<string, unknown> {
    return {
      entityType: this.entityType,
      timestamp: this.timestamp.toISOString(),
      ...this._context,
    };
  }

  /**
   * BaseError используется для Domain errors
   * Domain errors всегда ожидаемые (expected)
   */
  isExpected(): boolean {
    return true;
  }

  /**
   * Domain errors логируем как info
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug' {
    return 'info';
  }

  /**
   * Domain errors показываем пользователю как есть
   */
  toUserError(): IError {
    return this;
  }

  // ============================================
  // Utility methods
  // ============================================

  /**
   * Для обратной совместимости
   */
  get code(): string {
    return this._code;
  }

  get context(): Record<string, unknown> | undefined {
    return this._context;
  }

  /**
   * Получить полное описание ошибки включая контекст
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      entityType: this.entityType,
      message: this._message,
      code: this._code,
      context: this._context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause:
        this.cause instanceof BaseError
          ? this.cause.toJSON()
          : this.cause?.message,
    };
  }

  /**
   * Краткое представление для логов
   */
  toString(): string {
    const parts = [this.name, `[${this.entityType}]`, this._message];
    if (this._code) parts.push(`(${this._code})`);
    return parts.join(" ");
  }
}
