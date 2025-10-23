import { Validation, isTrue } from "@/shared/validation";
import { ISpecification } from "@/shared/specification";
import { ValidationError } from "@/shared/errors";

export class CommonPatternSpec implements ISpecification<string> {
  constructor(
    private readonly entityType: string,
    private readonly pattern: RegExp,
    private readonly message: string,
  ) {}

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(this.pattern.test(value), value)
      .valid()
      .invalid(new ValidationError(this.entityType, this.message));
  }
}
