import { BaseError } from './BaseError';

/**
 * Ошибка отсутствия сущности
 * 
 * Используется когда сущность не найдена по ID
 */
export class NotFoundError extends BaseError {
  constructor(
    entityType: string,
    public readonly id: string,
    context?: Record<string, unknown>
  ) {
    super({
      entityType,
      message: `${entityType} not found with id: ${id}`,
      code: 'NOT_FOUND_ERROR',
      context: { ...context, id },
    });
    this.name = 'NotFoundError';
  }
}
