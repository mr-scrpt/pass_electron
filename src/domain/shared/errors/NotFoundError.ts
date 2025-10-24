import { BaseError } from '@/shared/errors'

/**
 * Сущность не найдена
 * 
 * Используется когда запрашиваемая сущность отсутствует в системе
 * 
 * Примеры:
 * - Resource с указанным ID не существует
 * - Namespace не найден
 * - CustomField с таким ID отсутствует
 */
export class NotFoundError extends BaseError {
  constructor(
    entityType: string,
    message: string,
    public readonly searchCriteria?: Record<string, unknown>
  ) {
    super(entityType, message, 'NOT_FOUND', searchCriteria)
    this.name = 'NotFoundError'
  }
}
