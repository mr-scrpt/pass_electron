export interface AppError extends Error {
  readonly code: string;

  readonly isOperational: boolean;

  readonly severity: "low" | "medium" | "high";

  readonly context?: Record<string, unknown>;

  readonly cause?: Error;
}
