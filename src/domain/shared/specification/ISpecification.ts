import { Validation } from "@/shared/validation";
import { ValidationError } from "./ValidationError";

export interface ISpecification<T> {
  isSatisfiedBy(value: T): Validation<ValidationError, T>;
}
