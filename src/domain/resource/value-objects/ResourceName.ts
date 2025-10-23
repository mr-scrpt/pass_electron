// src/domain/resource/value-objects/ResourceName.ts
import { Validation } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { StringInvariant } from "@/domain/shared";

/**
 * Value Object для имени ресурса
 * Инвариант: 1-100 символов
 */
export class ResourceName {
  private static readonly ENTITY_TYPE = "ResourceName";
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;

  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError[], ResourceName> {
    // Используем StringInvariant (Singleton)
    return StringInvariant.instance
      .validateLength(
        value,
        ResourceName.ENTITY_TYPE,
        ResourceName.MIN_LENGTH,
        ResourceName.MAX_LENGTH,
      )
      .map(() => new ResourceName(value));
  }

  getValue(): string {
    return this._value;
  }

  equals(other: ResourceName): boolean {
    return this._value === other._value;
  }
}
