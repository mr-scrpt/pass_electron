import { BaseError } from './BaseError';

/**
 * Ошибка валидации (Shared Layer)
 * 
 * Используется в Domain Layer для инвариантов
 * Содержит массив сообщений об ошибках валидации
 */
export class ValidationError extends BaseError {
  constructor(
    entityType: string,
    public readonly errors: string[],
    context?: Record<string, unknown>
  ) {
    super(
      entityType,
      errors.join('; '),
      'VALIDATION_ERROR',
      { ...context, errors }
    );
    this.name = 'ValidationError';
  }
}
