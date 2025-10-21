import { Result, ok, err } from "neverthrow";
import { InvariantViolationError } from "../errors/InvariantViolationError";

/**
 * Инварианты для UUID
 */
export class UuidInvariant {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  /**
   * Валидация UUID v4 через Result
   */
  static validate(
    value: string,
    entityType: string,
  ): Result<string, InvariantViolationError> {
    if (!value) {
      return err(
        new InvariantViolationError(entityType, "UUID cannot be empty"),
      );
    }

    if (!this.UUID_V4_REGEX.test(value)) {
      return err(
        new InvariantViolationError(
          entityType,
          `Invalid UUID format: ${value}`,
        ),
      );
    }

    return ok(value);
  }

  /**
   * Type guard (не бросает)
   */
  static isValidUuid(value: string): boolean {
    return !!value && this.UUID_V4_REGEX.test(value);
  }
}
