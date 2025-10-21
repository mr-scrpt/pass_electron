// src/domain/shared/errors/InvariantViolationError.ts
export class InvariantViolationError extends Error {
  readonly code = "INVARIANT_VIOLATION";

  constructor(
    readonly entityType: string,
    readonly invariant: string,
  ) {
    super(`${entityType}: ${invariant}`);
    this.name = "InvariantViolationError";
  }
}
