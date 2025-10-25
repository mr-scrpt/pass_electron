import { BaseError } from './BaseError';

/**
 * Ошибка дублирования сущности
 * 
 * Используется когда попытка создания сущности с уже существующим уникальным полем
 */
export class DuplicateError extends BaseError {
  constructor(
    entityType: string,
    public readonly duplicateValue: string,
    context?: Record<string, unknown>
  ) {
    super({
      entityType,
      message: `${entityType} with this value already exists: ${duplicateValue}`,
      code: 'DUPLICATE_ERROR',
      context: { ...context, duplicateValue },
    });
    this.name = 'DuplicateError';
  }
}
