// src/domain/resource/value-objects/ResourceId.ts
import { Result } from "neverthrow";
import { InvariantViolationError, UuidInvariant } from "@/domain/shared";

/**
 * Value Object для ID ресурса
 * Инвариант: должен быть валидным UUID v4
 */
export class ResourceId {
  private constructor(private readonly _value: string) {}

  static generate(): ResourceId {
    return new ResourceId(crypto.randomUUID());
  }

  static create(value: string): Result<ResourceId, InvariantViolationError> {
    // ✅ Используем переиспользуемый инвариант с Result
    return UuidInvariant.validate(value, "ResourceId").map(
      (validValue) => new ResourceId(validValue),
    );
  }

  getValue(): string {
    return this._value;
  }

  equals(other: ResourceId): boolean {
    return this._value === other._value;
  }
}
