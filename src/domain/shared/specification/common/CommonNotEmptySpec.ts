import { Validation, isTrue } from "@/shared/validation";
import { ISpecification } from "@/shared/specification";
import { ValidationError } from "@/shared/errors";

export class CommonNotEmptySpec implements ISpecification<string> {
  constructor(private readonly entityType: string) {}

  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return isTrue(!!(value && value.trim().length > 0), value)
      .valid()
      .invalid(new ValidationError(this.entityType, "cannot be empty"));
  }
}
