import { Validation } from "../validation";
import { ValidationError } from "../errors/ValidationError";

export interface ISpecification<T> {
  isSatisfiedBy(value: T): Validation<ValidationError, T>;
}
