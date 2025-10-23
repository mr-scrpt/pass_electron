import { Either, left, right } from "@sweet-monads/either";

export type Validation<E, T> = Either<E, T>;

export const valid = <T>(value: T): Validation<never, T> => right(value);

export const invalid = <E>(error: E): Validation<E, never> => left(error);
