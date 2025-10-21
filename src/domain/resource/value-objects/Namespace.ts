// src/domain/resource/value-objects/Namespace.ts
import { Either, right, left } from "@sweet-monads/either";
import { InvariantViolationError } from "@/domain/shared";

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

  static create(value: string): Either<InvariantViolationError, Namespace> {
    if (!value) {
      return left(
        new InvariantViolationError(
          Namespace.ENTITY_TYPE,
          "cannot be empty",
        ),
      );
    }

    if (value.length < Namespace.MIN_LENGTH || value.length > Namespace.MAX_LENGTH) {
      return left(
        new InvariantViolationError(
          Namespace.ENTITY_TYPE,
          `must be ${Namespace.MIN_LENGTH}-${Namespace.MAX_LENGTH} characters`,
        ),
      );
    }

    if (!Namespace.PATTERN.test(value)) {
      return left(
        new InvariantViolationError(
          Namespace.ENTITY_TYPE,
          "must contain only lowercase letters, numbers, - and _",
        ),
      );
    }

    return right(new Namespace(value));
  }

  getValue(): string {
    return this._value;
  }

  equals(other: Namespace): boolean {
    return this._value === other._value;
  }
}
