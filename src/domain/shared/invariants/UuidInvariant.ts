import { Validation, ValidationCombinators } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { CommonNotEmptySpec, CommonPatternSpec } from "../specification";
import { IInvariant } from "./IInvariant";

export class UuidInvariant implements IInvariant<string> {
  private static readonly UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private static readonly _instance = new UuidInvariant();

  private constructor() {}

  static get instance(): UuidInvariant {
    return UuidInvariant._instance;
  }

  validate(
    value: string,
    entityType: string,
  ): Validation<ValidationError[], string> {
    return ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for(entityType).isSatisfiedBy(value),
        CommonPatternSpec.for(
          entityType,
          UuidInvariant.UUID_V4_REGEX,
          "must be a valid UUID v4",
        ).isSatisfiedBy(value),
      ],
      () => value,
    );
  }

  isValidUuid(value: string): boolean {
    return UuidInvariant.UUID_V4_REGEX.test(value);
  }
}
