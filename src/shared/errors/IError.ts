/**
 * Минимальный интерфейс для всех ошибок в приложении
 * Технические методы без Application концепций
 */
export interface IError {
  /**
   * Техническое сообщение об ошибке
   */
  getMessage(): string;

  /**
   * Уникальный код ошибки для категоризации
   */
  getCode(): string;

  /**
   * Контекст ошибки для отладки
   */
  getContext(): Record<string, unknown>;

  /**
   * Является ли ошибка ожидаемой (expected) или неожиданной (unexpected)
   * - true: Domain errors, Validation errors (показываем пользователю)
   * - false: Infrastructure errors, Bugs (скрываем, логируем)
   */
  isExpected(): boolean;

  /**
   * Уровень логирования для этой ошибки
   */
  getLogLevel(): 'info' | 'warn' | 'error' | 'debug';

  /**
   * Трансформация ошибки для показа пользователю
   * Expected errors возвращают себя
   * Unexpected errors возвращают generic ошибку
   */
  toUserError(): IError;
}
