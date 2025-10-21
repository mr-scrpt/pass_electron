// src/domain/resource/value-objects/ResourceName.ts
import { Result, ok, err } from "neverthrow";
import { InvariantViolationError } from "@/domain/shared";

/**
 * Value Object для имени ресурса
 * Инвариант: 1-100 символов
 */
export class ResourceName {
  private static readonly ENTITY_TYPE = "ResourceName";
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;

  private constructor(private readonly _value: string) {}

  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value) {
      return err(
        new InvariantViolationError(
          ResourceName.ENTITY_TYPE,
          "cannot be empty",
        ),
      );
    }

    if (
      value.length < ResourceName.MIN_LENGTH ||
      value.length > ResourceName.MAX_LENGTH
    ) {
      return err(
        new InvariantViolationError(
          ResourceName.ENTITY_TYPE,
          `must be ${ResourceName.MIN_LENGTH}-${ResourceName.MAX_LENGTH} characters`,
        ),
      );
    }

    return ok(new ResourceName(value));
  }

  getValue(): string {
    return this._value;
  }

  equals(other: ResourceName): boolean {
    return this._value === other._value;
  }
}
