/**
 * String Specifications - переиспользуемые спецификации для строк
 */

import { Validation, valid, invalid } from '@/shared/validation'
import { ISpecification } from './ISpecification'

/**
 * Базовая ошибка валидации
 * Используется когда нет специфичной Domain ошибки
 */
export class ValidationError extends Error {
  constructor(
    public readonly entityType: string,
    message: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Проверка на пустую строку
 */
export class NotEmptySpec implements ISpecification<string> {
  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return value && value.trim()
      ? valid(value)
      : invalid(new ValidationError(this.entityType, "cannot be empty"))
  }
}

/**
 * Проверка диапазона длины
 */
export class LengthRangeSpec implements ISpecification<string> {
  constructor(
    private min: number,
    private max: number,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return value.length >= this.min && value.length <= this.max
      ? valid(value)
      : invalid(new ValidationError(
          this.entityType,
          `must be ${this.min}-${this.max} characters`
        ))
  }
}

/**
 * Проверка по регулярному выражению
 */
export class PatternSpec implements ISpecification<string> {
  constructor(
    private pattern: RegExp,
    private message: string,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return this.pattern.test(value)
      ? valid(value)
      : invalid(new ValidationError(this.entityType, this.message))
  }
}

/**
 * Проверка на lowercase
 */
export class LowercaseSpec implements ISpecification<string> {
  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return value === value.toLowerCase()
      ? valid(value)
      : invalid(new ValidationError(this.entityType, "must be lowercase"))
  }
}
