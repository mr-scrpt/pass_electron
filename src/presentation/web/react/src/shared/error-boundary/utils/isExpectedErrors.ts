import type { IError } from "@/main/shared/errors";

/**
 * Type guard для Expected Errors (IError[])
 * 
 * Использует duck typing вместо instanceof
 * @pattern Type Guard (функциональный подход)
 */
export function isExpectedErrors(error: unknown): error is IError[] {
  return (
    Array.isArray(error) &&
    error.length > 0 &&
    isIError(error[0])
  );
}

/**
 * Type guard для одного IError
 */
function isIError(value: unknown): value is IError {
  return (
    typeof value === "object" &&
    value !== null &&
    "getMessage" in value &&
    "getCode" in value &&
    "isExpected" in value &&
    typeof (value as IError).getMessage === "function" &&
    typeof (value as IError).getCode === "function" &&
    typeof (value as IError).isExpected === "function"
  );
}
