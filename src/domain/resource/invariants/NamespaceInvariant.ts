import { Validation, ValidationCombinators } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import {
  CommonNotEmptySpec,
  CommonLengthSpec,
  CommonPatternSpec,
} from "@/domain/shared/specification";
import { IInvariant } from "@/domain/shared/invariants";

export class NamespaceInvariant implements IInvariant<string> {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;
  private static readonly PATTERN = /^[a-z0-9-_]+$/;
  private static readonly PATTERN_MESSAGE =
    "must contain only lowercase letters, numbers, - and _";

  private static readonly _instance = new NamespaceInvariant();

  private constructor() {}

  static get instance(): NamespaceInvariant {
    return NamespaceInvariant._instance;
  }

  validate(value: string, entityType: string): Validation<ValidationError[], string> {
    // Получаем ошибки от Specifications (BaseError[])
    const specResult = ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for({ entityType }).isSatisfiedBy(value),
        CommonLengthSpec.for({
          entityType,
          minLength: NamespaceInvariant.MIN_LENGTH,
          maxLength: NamespaceInvariant.MAX_LENGTH,
        }).isSatisfiedBy(value),
        CommonPatternSpec.for({
          entityType,
          pattern: NamespaceInvariant.PATTERN,
          message: NamespaceInvariant.PATTERN_MESSAGE,
        }).isSatisfiedBy(value),
      ],
      () => value,
    );
    
    // Преобразуем BaseError[] -> ValidationError[]
    return specResult.mapLeft((errors) =>
      errors.map((err) => new ValidationError(entityType, [err.message], { cause: err }))
    );
  }
}
