/**
 * Composite Specification - композиция спецификаций
 * 
 * Позволяет комбинировать несколько спецификаций в одну
 */

import { Validation, valid, invalid } from '@/shared/validation'
import { ISpecification } from './ISpecification'

/**
 * Композитор спецификаций
 * Предоставляет методы для комбинирования спецификаций
 */
export class CompositeSpecification<T> {
  /**
   * Все спецификации должны пройти (AND)
   * Fail-fast: останавливается на первой ошибке
   * 
   * @param specs - Спецификации для комбинирования
   * @returns Спецификация которая проверяет все условия
   * 
   * @example
   * ```typescript
   * const spec = CompositeSpecification.allOf(
   *   new NotEmptySpec(),
   *   new LengthRangeSpec(2, 50)
   * )
   * ```
   */
  static allOf<T>(...specs: ISpecification<T>[]): ISpecification<T> {
    return {
      isSatisfiedBy: (value: T) => {
        for (const spec of specs) {
          const result = spec.isSatisfiedBy(value)
          // Используем методы Either через Validation
          if (result.isLeft()) return result
        }
        return valid(value)
      }
    }
  }

  /**
   * Накопление ВСЕХ ошибок
   * Для показа всех проблем валидации сразу
   * 
   * @param specs - Спецификации для комбинирования
   * @returns Спецификация которая собирает все ошибки
   * 
   * @example
   * ```typescript
   * const spec = CompositeSpecification.allOfAccumulate(
   *   new NotEmptySpec(),
   *   new LengthRangeSpec(2, 50),
   *   new PatternSpec(/^[a-z]+$/)
   * )
   * // Если все 3 не пройдут - вернет массив из 3 ошибок
   * ```
   */
  static allOfAccumulate<T, E = any>(...specs: ISpecification<T>[]): {
    isSatisfiedBy: (value: T) => Validation<E[], T>
  } {
    return {
      isSatisfiedBy: (value: T) => {
        const errors: E[] = []
        
        for (const spec of specs) {
          const result = spec.isSatisfiedBy(value)
          if (result.isLeft()) {
            errors.push(result.value)
          }
        }
        
        return errors.length > 0 ? invalid(errors) : valid(value)
      }
    }
  }
}
