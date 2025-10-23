export class ValidationError extends Error {
  constructor(
    public readonly entityType: string,
    public readonly message: string,
  ) {
    super(`${entityType}: ${message}`);
    this.name = "ValidationError";
  }
}
