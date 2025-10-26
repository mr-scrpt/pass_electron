// src/shared/validation/helpers.ts
import type { Validation } from "./Validation";
import { fromCondition } from "./Validation";

class ValidationBuilder<T> {
  constructor(
    private readonly condition: boolean,
    private readonly value: T,
  ) {}

  valid(): ValidBranch<T> {
    return new ValidBranch(this.condition, this.value);
  }
}

class ValidBranch<T> {
  constructor(
    private readonly condition: boolean,
    private readonly value: T,
  ) {}

  invalid<E>(error: E): Validation<E, T> {
    return fromCondition(this.condition, this.value, error);
  }
}

/**
 * Fluent API для условной валидации
 *
 * @example
 * isTrue(value && value.trim().length > 0, value)
 *   .valid()
 *   .invalid(new BaseError('Entity', 'cannot be empty'))
 */
export function isTrue<T>(condition: boolean, value: T): ValidationBuilder<T> {
  return new ValidationBuilder(condition, value);
}
