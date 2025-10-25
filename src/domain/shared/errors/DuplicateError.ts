import { BaseError } from '@/shared/errors'

/**
 * Дубликат сущности (нарушение уникальности)
 * 
 * Используется когда попытка создания сущности нарушает
 * правило уникальности (unique constraint)
 * 
 * Примеры:
 * - Resource с таким namespace + name уже существует
 * - CustomField с такой меткой уже есть в Resource
 * - Email уже зарегистрирован
 */
export class DuplicateError extends BaseError {
  constructor(
    entityType: string,
    message: string,
    public readonly conflictingData?: Record<string, unknown>
  ) {
    super({
      entityType,
      message,
      code: 'DUPLICATE',
      context: conflictingData,
    });
    this.name = 'DuplicateError';
  }
}
