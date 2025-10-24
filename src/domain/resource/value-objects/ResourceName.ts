// src/domain/resource/value-objects/ResourceName.ts
import { Validation } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { ResourceNameInvariant } from "../invariants";

/**
 * Value Object для имени ресурса
 * Инвариант: 1-100 символов
 */
export class ResourceName {
  private static readonly ENTITY_TYPE = "ResourceName";

  private constructor(private readonly _value: string) {}

  static create(value: string): Validation<ValidationError[], ResourceName> {
    // ✅ Используем ResourceNameInvariant (Singleton)
    // Правила валидации ВНУТРИ инварианта
    return ResourceNameInvariant.instance
      .validate(value, ResourceName.ENTITY_TYPE)
      .map((validValue: string) => new ResourceName(validValue));
  }

  getValue(): string {
    return this._value;
  }

  equals(other: ResourceName): boolean {
    return this._value === other._value;
  }
}
