import { valid, invalid, type Validation } from "@/main/shared";
import type { ILogger } from "@/main/composition";
import { PlatformError } from "@/platform";
import { ErrorView } from "../components/ErrorView";

type ErrorHandlerResult = React.ReactNode;

/**
 * Обработчик для Platform ошибок (DI, Adapters)
 */
export function handlePlatformError(
  error: unknown,
  logger: ILogger
): Validation<"not_handled", ErrorHandlerResult> {
  if (error instanceof PlatformError) {
    // Логируем с полным контекстом
    const logLevel = error.getLogLevel();
    const logData = {
      message: error.getMessage(),
      underlyingErrors: error.getUnderlyingErrors().map((e) => ({
        message: e.getMessage(),
        code: e.getCode(),
        context: e.getContext(),
      })),
      context: error.getContext(),
    };
    
    // Используем соответствующий метод logger
    if (logLevel === "error") {
      logger.error("[ErrorBoundary] Platform error", logData);
    } else if (logLevel === "warn") {
      logger.warn("[ErrorBoundary] Platform error", logData);
    } else {
      logger.info("[ErrorBoundary] Platform error", logData);
    }

    // Показываем generic сообщение (toUserError)
    const userError = error.toUserError();

    return valid(
      <ErrorView
        message={userError.getMessage()}
        showDetails={import.meta.env.DEV}
        details={error.stack}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return invalid("not_handled");
}
