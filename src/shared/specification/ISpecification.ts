import type { Validation } from "../validation";
import { BaseError } from "../errors/BaseError";

export interface ISpecification<T> {
  isSatisfiedBy(value: T): Validation<BaseError, T>;
}
