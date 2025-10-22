/**
 * Specification Pattern - базовый интерфейс
 * 
 * Спецификация инкапсулирует бизнес-правило в переиспользуемый объект
 */

import { Validation } from '@/shared/validation'

/**
 * Спецификация для валидации
 * Возвращает Validation вместо boolean для обработки ошибок
 * 
 * @template T - Тип значения для валидации
 * 
 * @example
 * ```typescript
 * class NotEmptySpec implements ISpecification<string> {
 *   isSatisfiedBy(value: string): Validation<Error, string> {
 *     return value.length > 0 
 *       ? valid(value) 
 *       : invalid(new Error('Cannot be empty'))
 *   }
 * }
 * ```
 */
export interface ISpecification<T> {
  /**
   * Проверить удовлетворяет ли значение спецификации
   * 
   * @param value - Значение для проверки
   * @returns Validation с ошибкой или валидным значением
   */
  isSatisfiedBy(value: T): Validation<any, T>
}
