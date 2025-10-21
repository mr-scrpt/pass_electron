/**
 * Validation - обертка над Either для изоляции библиотеки
 * 
 * Этот модуль предоставляет type-safe обработку результатов валидации
 * без прямой зависимости от @sweet-monads/either в Domain Layer
 */

import { Either, left, right, merge, mergeInMany } from '@sweet-monads/either'

/**
 * Результат валидации
 * Обертка над Either для изоляции библиотеки @sweet-monads/either
 * 
 * @template E - Тип ошибки валидации
 * @template T - Тип успешного значения
 * 
 * @example
 * ```typescript
 * function validateName(name: string): Validation<Error, string> {
 *   return name.length > 0 ? valid(name) : invalid(new Error('Empty name'))
 * }
 * ```
 */
export type Validation<E, T> = Either<E, T>

/**
 * Создать успешный результат валидации
 * 
 * @param value - Валидное значение
 * @returns Validation с успешным результатом
 * 
 * @example
 * ```typescript
 * const result = valid('hello')  // Validation<never, string>
 * ```
 */
export const valid = <T>(value: T): Validation<never, T> => right(value)

/**
 * Создать неудачный результат валидации
 * 
 * @param error - Ошибка валидации
 * @returns Validation с ошибкой
 * 
 * @example
 * ```typescript
 * const result = invalid(new Error('Invalid'))  // Validation<Error, never>
 * ```
 */
export const invalid = <E>(error: E): Validation<E, never> => left(error)

/**
 * Комбинаторы для работы с валидацией
 */
export const ValidationCombinators = {
  /**
   * Комбинировать валидации (fail-fast)
   * Останавливается на первой ошибке
   * 
   * @param validations - Массив валидаций для комбинирования
   * @returns Validation с массивом успешных значений или первой ошибкой
   * 
   * @example
   * ```typescript
   * const results = [valid(1), valid(2), invalid(new Error())]
   * const combined = ValidationCombinators.combine(results)
   * // Вернет invalid(new Error()) - первую ошибку
   * ```
   */
  combine<E, T>(validations: Validation<E, T>[]): Validation<E, T[]> {
    return merge(validations) as Validation<E, T[]>
  },

  /**
   * Комбинировать валидации (accumulate)
   * Собирает ВСЕ ошибки
   * 
   * @param validations - Массив валидаций для комбинирования
   * @returns Validation с массивом успешных значений или массивом всех ошибок
   * 
   * @example
   * ```typescript
   * const results = [invalid(err1), valid(2), invalid(err2)]
   * const combined = ValidationCombinators.combineAll(results)
   * // Вернет invalid([err1, err2]) - ВСЕ ошибки
   * ```
   */
  combineAll<E, T>(validations: Validation<E, T>[]): Validation<E[], T[]> {
    return mergeInMany(validations) as Validation<E[], T[]>
  }
}

/**
 * Re-export типа Either для совместимости
 * Позволяет использовать методы Either (map, chain, fold) с Validation
 */
export type { Either } from '@sweet-monads/either'
