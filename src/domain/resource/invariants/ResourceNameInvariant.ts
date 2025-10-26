import type { Validation } from "@/shared/validation";
import { ValidationCombinators } from "@/shared/validation";
import { ValidationError } from "@/shared/errors";
import {
  CommonNotEmptySpec,
  CommonLengthSpec,
} from "@/domain/shared/specification";
import type { IInvariant } from "@/domain/shared/invariants";

export class ResourceNameInvariant implements IInvariant<string> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100;

  private static readonly _instance = new ResourceNameInvariant();

  private constructor() {}

  static get instance(): ResourceNameInvariant {
    return ResourceNameInvariant._instance;
  }

  validate(value: string, entityType: string): Validation<ValidationError[], string> {
    // Получаем ошибки от Specifications (BaseError[])
    const specResult = ValidationCombinators.sequence(
      [
        CommonNotEmptySpec.for({ entityType }).isSatisfiedBy(value),
        CommonLengthSpec.for({
          entityType,
          minLength: ResourceNameInvariant.MIN_LENGTH,
          maxLength: ResourceNameInvariant.MAX_LENGTH,
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
