import { BaseError } from '@/shared/errors'

/**
 * Недопустимая операция (бизнес-правило нарушено)
 * 
 * Используется когда операция не может быть выполнена
 * из-за текущего состояния Aggregate или бизнес-правил
 * 
 * Примеры:
 * - Попытка добавить > 20 CustomField в Resource
 * - Попытка удалить последний обязательный элемент
 * - Операция недоступна в текущем статусе
 */
export class InvalidOperationError extends BaseError {
  constructor(
    entityType: string,
    message: string,
    public readonly operation?: string,
    context?: Record<string, unknown>
  ) {
    super(entityType, message, 'INVALID_OPERATION', context)
    this.name = 'InvalidOperationError'
  }
}
