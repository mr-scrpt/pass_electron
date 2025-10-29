import { valid, invalid, type Validation } from "@/main/shared";
import type { ILogger } from "@/main/composition";
import { PlatformError } from "@/platform";
import { ErrorView } from "../components/ErrorView";

type ErrorHandlerResult = React.ReactNode;

/**
 * Обработчик для JavaScript/библиотечных ошибок
 */
export function handleJavaScriptError(
  error: unknown,
  logger: ILogger
): Validation<"not_handled", ErrorHandlerResult> {
  if (error instanceof Error) {
    // Оборачиваем в PlatformError для единообразия
    const platformError = new PlatformError(
      "UnhandledError",
      "Unexpected error occurred",
      [],
      {
        originalError: error.message,
        stack: error.stack,
        name: error.name,
      }
    );

    // Логируем с полным стеком
    logger.error("[ErrorBoundary] JavaScript error", {
      ...platformError.toJSON(),
      originalError: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });

    return valid(
      <ErrorView
        message="Something went wrong"
        showDetails={import.meta.env.DEV}
        details={error.stack}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return invalid("not_handled");
}
