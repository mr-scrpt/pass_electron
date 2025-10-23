import { Validation, isTrue } from "@/shared/validation";
import { ISpecification } from "@/shared/specification";
import { ValidationError } from "@/shared/errors";

export class CommonLengthSpec implements ISpecification<string> {
  constructor(
    private readonly entityType: string,
    private readonly minLength: number,
    private readonly maxLength: number,
  ) {}

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(
      value.length >= this.minLength && value.length <= this.maxLength,
      value,
    )
      .valid()
      .invalid(
        new ValidationError(
          this.entityType,
          `must be ${this.minLength}-${this.maxLength} characters`,
        ),
      );
  }
}
