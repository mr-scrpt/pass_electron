import { BaseError } from '@/shared/errors'

/**
 * Нарушение инварианта (правила валидации)
 * 
 * Используется когда Value Object или Entity не может быть создан
 * из-за нарушения бизнес-правил валидации
 * 
 * Примеры:
 * - Невалидный UUID формат
 * - Слишком короткий Namespace
 * - Недопустимые символы в имени
 */
export class InvariantViolationError extends BaseError {
  constructor(
    entityType: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    super({
      entityType,
      message,
      code: 'INVARIANT_VIOLATION',
      context,
    });
    this.name = 'InvariantViolationError';
  }
}
