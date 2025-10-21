/**
 * UUID Specifications - спецификации для UUID
 */

import { Validation, valid, invalid } from '@/shared/validation'
import { ISpecification } from './ISpecification'
import { ValidationError } from './StringSpecifications'

/**
 * Проверка UUID v4
 */
export class UuidV4Spec implements ISpecification<string> {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return UuidV4Spec.UUID_V4_REGEX.test(value)
      ? valid(value)
      : invalid(new ValidationError(
          this.entityType,
          `Invalid UUID format: ${value}`
        ))
  }
}
