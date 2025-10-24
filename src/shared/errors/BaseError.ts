/**
 * Базовый класс для ВСЕХ ошибок приложения
 *
 * Используется как основа для:
 * - Domain errors (InvariantViolationError, NotFoundError, etc.)
 * - Application errors (CommandError, QueryError, etc.)
 * - Infrastructure errors (NetworkError, FileSystemError, etc.)
 * - Unexpected errors (системные, непредвиденные)
 *
 * @property entityType - тип сущности или компонента где произошла ошибка
 * @property message - человекочитаемое описание ошибки
 * @property code - опциональный код ошибки (для категоризации)
 * @property context - опциональный контекст (дополнительные данные)
 * @property cause - опциональная причина (вложенная ошибка)
 */
export class BaseError extends Error {
  public readonly timestamp: Date;

  constructor(
    public readonly entityType: string,
    message: string,
    public readonly code?: string,
    public readonly context?: Record<string, unknown>,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "BaseError";
    this.timestamp = new Date();

    // Сохраняем stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Сохраняем причину (для цепочки ошибок)
    if (cause && "cause" in Error.prototype) {
      this.cause = cause;
    }
  }

  /**
   * Получить полное описание ошибки включая контекст
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      entityType: this.entityType,
      message: this.message,
      code: this.code,
      context: this.context,
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
    const parts = [this.name, `[${this.entityType}]`, this.message];
    if (this.code) parts.push(`(${this.code})`);
    return parts.join(" ");
  }
}
