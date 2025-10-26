import type { Validation } from "@/shared/validation";
import { ValidationCombinators } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import { CommonNotEmptySpec, CommonPatternSpec } from "../specification";
import type { IInvariant } from "./IInvariant";

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
    // Получаем ошибки от Specifications (BaseError[])
    const specResult = ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for({ entityType }).isSatisfiedBy(value),
        CommonPatternSpec.for({
          entityType,
          pattern: UuidInvariant.UUID_V4_REGEX,
          message: "must be a valid UUID v4",
        }).isSatisfiedBy(value),
      ],
      () => value,
    );
    
    // Преобразуем BaseError[] -> ValidationError[]
    return specResult.mapLeft((errors) =>
      errors.map((err) => new ValidationError(entityType, [err.message], { cause: err }))
    );
  }

  isValidUuid(value: string): boolean {
    return UuidInvariant.UUID_V4_REGEX.test(value);
  }
}
