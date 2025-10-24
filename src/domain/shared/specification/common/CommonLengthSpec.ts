import { Validation, isTrue } from "@/shared/validation";
import { ISpecification } from "@/shared/specification";
import { BaseError } from "@/shared/errors";

export interface LengthConfig {
  readonly entityType: string;
  readonly minLength: number;
  readonly maxLength: number;
}

export class CommonLengthSpec implements ISpecification<string> {
  private static readonly _instances = new Map<string, CommonLengthSpec>();

  private constructor(private readonly config: LengthConfig) {}

  static for(config: LengthConfig): CommonLengthSpec {
    const key = `${config.entityType}:${config.minLength}:${config.maxLength}`;

    if (!CommonLengthSpec._instances.has(key)) {
      CommonLengthSpec._instances.set(key, new CommonLengthSpec(config));
    }

    return CommonLengthSpec._instances.get(key)!;
  }

  isSatisfiedBy(value: string): Validation<BaseError, string> {
    return isTrue(
      value.length >= this.config.minLength &&
        value.length <= this.config.maxLength,
      value,
    )
      .valid()
      .invalid(
        new BaseError(
          this.config.entityType,
          `must be ${this.config.minLength}-${this.config.maxLength} characters`,
        ),
      );
  }
}
