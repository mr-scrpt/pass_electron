import { useRouteError } from "react-router";
import { orElse } from "@/main/shared";
import { useLogger } from "@/platform";
import {
  handleIError,
  handleJavaScriptError,
  handlePlatformError,
  handleRouteError,
  handleUnknown,
} from "@/shared/error-boundary";

/**
 * Глобальный Error Boundary для приложения
 * Обрабатывает различные типы ошибок с приоритетом
 * @layer Presentation/Root
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const logger = useLogger();

  const component = orElse(() => handlePlatformError(error, logger))(
    orElse(() => handleIError(error, logger))(
      orElse(() => handleJavaScriptError(error, logger))(
        orElse(() => handleUnknown(error, logger))(handleRouteError(error)),
      ),
    ),
  ).value;

  return <>{component}</>;
}
