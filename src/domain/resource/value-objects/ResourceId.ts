// src/domain/resource/value-objects/ResourceId.ts
import { Validation } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";  // ✅ Явный импорт технического типа
import { UuidInvariant } from "@/domain/shared";

/**
 * Value Object для ID ресурса
 * Инвариант: должен быть валидным UUID v4
 */
export class ResourceId {
  private static readonly ENTITY_TYPE = "ResourceId";
  private constructor(private readonly _value: string) {}

  static generate(): ResourceId {
    return new ResourceId(crypto.randomUUID());
  }

  static create(
    value: string,
  ): Validation<ValidationError[], ResourceId> {
    // ✅ Используем переиспользуемый инвариант (Singleton)
    // Возвращает массив ошибок (пустота + формат) или валидный ResourceId
    return UuidInvariant.instance.validate(value, ResourceId.ENTITY_TYPE).map(
      (validValue: string) => new ResourceId(validValue),
    );
  }

  getValue(): string {
    return this._value;
  }

  equals(other: ResourceId): boolean {
    return this._value === other._value;
  }
}
