import { Either, right, left } from "@sweet-monads/either";
import { InvariantViolationError } from "../errors/InvariantViolationError";

/**
 * Инварианты для UUID
 */
export class UuidInvariant {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  /**
   * Валидация UUID v4 через Either
   */
  static validate(
    value: string,
    entityType: string,
  ): Either<InvariantViolationError, string> {
    if (!value) {
      return left(
        new InvariantViolationError(entityType, "UUID cannot be empty"),
      );
    }

    if (!this.UUID_V4_REGEX.test(value)) {
      return left(
        new InvariantViolationError(
          entityType,
          `Invalid UUID format: ${value}`,
        ),
      );
    }

    return right(value);
  }

  /**
   * Type guard (не бросает)
   */
  static isValidUuid(value: string): boolean {
    return !!value && this.UUID_V4_REGEX.test(value);
  }
}
