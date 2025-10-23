import { mergeInMany } from "@sweet-monads/either";
import { Validation } from "./Validation";

export class ValidationCombinators {
  static accumulate<E, T>(
    validations: Validation<E, T>[],
  ): Validation<E[], T[]> {
    return mergeInMany(validations);
  }

  static sequence<E, T, U>(
    validations: Validation<E, T>[],
    fn: (values: T[]) => U,
  ): Validation<E[], U> {
    return mergeInMany(validations).map(fn);
  }
}
