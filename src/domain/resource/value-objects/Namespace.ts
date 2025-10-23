// src/domain/resource/value-objects/Namespace.ts
import { Validation } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { StringInvariant } from "@/domain/shared";

/**
 * Value Object для namespace ресурса
 * Инвариант: 2-50 символов, lowercase, буквы/цифры/-/_
 */
export class Namespace {
  private static readonly ENTITY_TYPE = "Namespace";
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;
  private static readonly PATTERN = /^[a-z0-9-_]+$/;

  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError[], Namespace> {
    // Используем StringInvariant (Singleton)
    return StringInvariant.instance
      .validate(value, {
        entityType: Namespace.ENTITY_TYPE,
        minLength: Namespace.MIN_LENGTH,
        maxLength: Namespace.MAX_LENGTH,
        pattern: Namespace.PATTERN,
        patternMessage: "must contain only lowercase letters, numbers, - and _",
      })
      .map(() => new Namespace(value));
  }

  getValue(): string {
    return this._value;
  }

  equals(other: Namespace): boolean {
    return this._value === other._value;
  }
}
