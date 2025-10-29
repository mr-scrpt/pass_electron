import type { IError } from "@/main/shared/errors";

/**
 * Type guard для проверки что объект реализует IError интерфейс
 */
export function isIError(error: unknown): error is IError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isExpected" in error &&
    "getLogLevel" in error &&
    "getMessage" in error &&
    "getContext" in error &&
    "toUserError" in error &&
    typeof (error as IError).isExpected === "function" &&
    typeof (error as IError).getLogLevel === "function" &&
    typeof (error as IError).getMessage === "function" &&
    typeof (error as IError).getContext === "function" &&
    typeof (error as IError).toUserError === "function"
  );
}
