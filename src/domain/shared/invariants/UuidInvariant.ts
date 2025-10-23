// src/domain/shared/invariants/UuidInvariant.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { ValidationError } from '@/shared/errors'  // ✅ Явный импорт технического типа
import { UUID_NOT_EMPTY_SPEC, UUID_FORMAT_SPEC } from '../specification/UuidSpecs'

/**
 * Инварианты для UUID
 * Использует Specification Pattern - единообразно с Value Objects
 */
export class UuidInvariant {
  /**
   * Валидация UUID v4 через спецификации
   * Накапливает ВСЕ ошибки (пустота + формат)
   * 
   * ✅ Единообразно с Namespace.create() и ResourceName.create()
   */
  static validate(
    value: string,
    entityType: string
  ): Validation<ValidationError[], string> {
    return ValidationCombinators.sequence(
      [
        UUID_NOT_EMPTY_SPEC.isSatisfiedBy(value),
        UUID_FORMAT_SPEC.isSatisfiedBy(value)
      ],
      () => value
    )
  }
  
  /**
   * Type guard (не бросает)
   */
  static isValidUuid(value: string): boolean {
    return UUID_FORMAT_SPEC.isSatisfiedBy(value).isRight()
  }
}
