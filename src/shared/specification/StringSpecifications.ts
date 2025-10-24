/**
 * String Specifications - переиспользуемые спецификации для строк
 * Singleton Factory Pattern - экземпляры кэшируются по entityType
 */

import { Validation, isTrue } from '@/shared/validation'
import { ISpecification } from '@/shared/specification'
import { BaseError } from '@/shared/errors'

/**
 * Проверка на пустую строку
 */
export class NotEmptySpec implements ISpecification<string> {
  private static readonly _instances = new Map<string, NotEmptySpec>();
  
  private constructor(private readonly entityType: string) {}
  
  static for(entityType: string): NotEmptySpec {
    if (!NotEmptySpec._instances.has(entityType)) {
      NotEmptySpec._instances.set(entityType, new NotEmptySpec(entityType));
    }
    return NotEmptySpec._instances.get(entityType)!;
  }
  
  isSatisfiedBy(value: string): Validation<BaseError, string> {
    return isTrue(!!(value && value.trim()), value)
      .valid()
      .invalid(new BaseError(this.entityType, "cannot be empty"))
  }
}

/**
 * Проверка диапазона длины
 */
export class LengthRangeSpec implements ISpecification<string> {
  private static readonly _instances = new Map<string, LengthRangeSpec>();
  
  private constructor(
    private readonly min: number,
    private readonly max: number,
    private readonly entityType: string
  ) {}
  
  static for(entityType: string, min: number, max: number): LengthRangeSpec {
    const key = `${entityType}:${min}:${max}`;
    if (!LengthRangeSpec._instances.has(key)) {
      LengthRangeSpec._instances.set(key, new LengthRangeSpec(min, max, entityType));
    }
    return LengthRangeSpec._instances.get(key)!;
  }
  
  isSatisfiedBy(value: string): Validation<BaseError, string> {
    return isTrue(value.length >= this.min && value.length <= this.max, value)
      .valid()
      .invalid(new BaseError(
          this.entityType,
          `must be ${this.min}-${this.max} characters`
        ))
  }
}

/**
 * Проверка по регулярному выражению
 */
export class PatternSpec implements ISpecification<string> {
  private static readonly _instances = new Map<string, PatternSpec>();
  
  private constructor(
    private readonly pattern: RegExp,
    private readonly message: string,
    private readonly entityType: string
  ) {}
  
  static for(entityType: string, pattern: RegExp, message: string): PatternSpec {
    const key = `${entityType}:${pattern.source}:${message}`;
    if (!PatternSpec._instances.has(key)) {
      PatternSpec._instances.set(key, new PatternSpec(pattern, message, entityType));
    }
    return PatternSpec._instances.get(key)!;
  }
  
  isSatisfiedBy(value: string): Validation<BaseError, string> {
    return isTrue(this.pattern.test(value), value)
      .valid()
      .invalid(new BaseError(this.entityType, this.message))
  }
}

/**
 * Проверка на lowercase
 */
export class LowercaseSpec implements ISpecification<string> {
  private static readonly _instances = new Map<string, LowercaseSpec>();
  
  private constructor(private readonly entityType: string) {}
  
  static for(entityType: string): LowercaseSpec {
    if (!LowercaseSpec._instances.has(entityType)) {
      LowercaseSpec._instances.set(entityType, new LowercaseSpec(entityType));
    }
    return LowercaseSpec._instances.get(entityType)!;
  }
  
  isSatisfiedBy(value: string): Validation<BaseError, string> {
    return isTrue(value === value.toLowerCase(), value)
      .valid()
      .invalid(new BaseError(this.entityType, "must be lowercase"))
  }
}
