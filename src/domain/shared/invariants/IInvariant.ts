// src/domain/shared/invariants/IInvariant.ts
import type { Validation } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'

/**
 * Интерфейс для инвариантов
 * Инварианты валидируют данные через Specification Pattern
 * 
 * @template T - тип валидируемого значения
 * 
 * ⚠️ Возвращает ValidationError[] (не BaseError[])
 */
export interface IInvariant<T> {
  /**
   * Валидация значения
   * 
   * @param value - значение для валидации
   * @param entityType - тип сущности (для сообщений об ошибках)
   * @returns Validation с ValidationError[] или валидным значением
   */
  validate(value: T, entityType: string): Validation<ValidationError[], T>
}
