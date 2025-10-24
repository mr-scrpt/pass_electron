// src/domain/shared/invariants/IInvariant.ts
import { Validation } from '@/shared/validation'
import { BaseError } from '@/shared/errors'

/**
 * Интерфейс для инвариантов
 * Инварианты валидируют данные через Specification Pattern
 * 
 * @template T - тип валидируемого значения
 */
export interface IInvariant<T> {
  /**
   * Валидация значения
   * 
   * @param value - значение для валидации
   * @param entityType - тип сущности (для сообщений об ошибках)
   * @returns Validation с массивом ошибок или валидным значением
   */
  validate(value: T, entityType: string): Validation<BaseError[], T>
}
