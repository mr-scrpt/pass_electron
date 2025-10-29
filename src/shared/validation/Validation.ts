import type { Either } from "@sweet-monads/either";
import { left, right } from "@sweet-monads/either";

export type Validation<E, T> = Either<E, T>;

export const valid = <T>(value: T): Validation<never, T> => right(value);

export const invalid = <E>(error: E): Validation<E, never> => left(error);

export const fromCondition = <E, T>(
  condition: boolean,
  value: T,
  error: E,
): Validation<E, T> => {
  return condition ? valid(value) : invalid(error);
};

/**
 * Выполняет side effect на левом значении (ошибке) и возвращает исходную монаду
 * Используется для логирования ошибок
 */
export const tapLeft = <E, T>(
  fn: (error: E) => void,
) => (validation: Validation<E, T>): Validation<E, T> => {
  if (validation.isLeft()) {
    fn(validation.value);
  }
  return validation;
};

/**
 * Выполняет side effect на правом значении (успехе) и возвращает исходную монаду
 */
export const tapRight = <E, T>(
  fn: (value: T) => void,
) => (validation: Validation<E, T>): Validation<E, T> => {
  if (validation.isRight()) {
    fn(validation.value);
  }
  return validation;
};

/**
 * Проверка на null/undefined с возвратом Validation
 */
export const fromNullable = <E, T>(
  value: T | null | undefined,
  error: E,
): Validation<E, T> => {
  return value != null ? valid(value) : invalid(error);
};

/**
 * Возвращает fallback Validation если исходная Left
 * Используется для цепочки обработчиков с fallback
 * 
 * @example
 * const result = validation
 *   .pipe(orElse(() => fallbackValidation))
 *   .pipe(orElse(() => anotherFallback))
 */
export const orElse = <E, T>(
  fallback: () => Validation<E, T>
) => (validation: Validation<E, T>): Validation<E, T> => {
  return validation.isRight() ? validation : fallback();
};
