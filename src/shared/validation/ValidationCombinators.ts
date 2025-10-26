import { mergeInMany } from "@sweet-monads/either";
import type { Validation } from "./Validation";

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

  /**
   * Комбинирует две Validation с разными типами значений
   * Аккумулирует ошибки из обеих
   */
  static combine<E, T1, T2>(
    v1: Validation<E[], T1>,
    v2: Validation<E[], T2>,
  ): Validation<E[], [T1, T2]> {
    return mergeInMany([v1, v2]) as Validation<E[], [T1, T2]>;
  }
}
