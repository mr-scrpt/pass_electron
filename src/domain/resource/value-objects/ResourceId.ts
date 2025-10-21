// src/domain/resource/value-objects/ResourceId.ts
import { Either } from "@sweet-monads/either";
import { InvariantViolationError, UuidInvariant } from "@/domain/shared";

/**
 * Value Object для ID ресурса
 * Инвариант: должен быть валидным UUID v4
 */
export class ResourceId {
  private static readonly ENTITY_TYPE = 'ResourceId';
  private constructor(private readonly _value: string) {}

  static generate(): ResourceId {
    return new ResourceId(crypto.randomUUID());
  }

  static create(value: string): Either<InvariantViolationError, ResourceId> {
    // ✅ Используем переиспользуемый инвариант с Either
    return UuidInvariant.validate(value, ResourceId.ENTITY_TYPE).map(
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
