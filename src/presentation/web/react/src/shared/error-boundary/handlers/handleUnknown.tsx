import { valid, type Validation } from "@/main/shared";
import type { ILogger } from "@/main/composition";
import { PlatformError } from "@/platform";
import { ErrorView } from "../ui/ErrorView";

type ErrorHandlerResult = React.ReactNode;

/**
 * Fallback обработчик для неизвестных типов ошибок
 * Всегда возвращает valid (последняя линия обороны)
 */
export function handleUnknown(
  error: unknown,
  logger: ILogger,
): Validation<"not_handled", ErrorHandlerResult> {
  // Оборачиваем в PlatformError
  const unknownError = new PlatformError(
    "UnknownError",
    "Unknown error type",
    [],
    { error: String(error), type: typeof error },
  );

  // Логируем для отладки
  logger.error("[ErrorBoundary] Unknown error", unknownError.toJSON());

  // Всегда возвращаем valid (fallback)
  return valid(<ErrorView message="An unexpected error occurred" />);
}
