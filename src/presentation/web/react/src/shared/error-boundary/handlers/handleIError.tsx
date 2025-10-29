import { valid, invalid, type Validation } from "@/main/shared";
import type { ILogger } from "@/main/composition";
import { isIError } from "../utils/isIError";
import { ErrorView } from "../components/ErrorView";

type ErrorHandlerResult = React.ReactNode;

/**
 * Обработчик для DDD системы ошибок (IError)
 */
export function handleIError(
  error: unknown,
  logger: ILogger
): Validation<"not_handled", ErrorHandlerResult> {
  if (isIError(error)) {
    const level = error.getLogLevel();

    // Логируем с контекстом
    const logData = {
      message: error.getMessage(),
      code: error.getCode(),
      context: error.getContext(),
      expected: error.isExpected(),
    };
    
    // Используем соответствующий метод logger
    if (level === "error") {
      logger.error("[ErrorBoundary] IError", logData);
    } else if (level === "warn") {
      logger.warn("[ErrorBoundary] IError", logData);
    } else if (level === "debug") {
      logger.debug("[ErrorBoundary] IError", logData);
    } else {
      logger.info("[ErrorBoundary] IError", logData);
    }

    // Expected - показываем как есть (но это странно - должно быть обработано в action)
    if (error.isExpected()) {
      return valid(<ErrorView message={error.getMessage()} />);
    }

    // Unexpected - скрываем детали
    const userError = error.toUserError();
    return valid(
      <ErrorView
        message={userError.getMessage()}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return invalid("not_handled");
}
