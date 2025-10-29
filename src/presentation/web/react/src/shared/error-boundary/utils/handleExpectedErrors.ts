import type { INotificationManager } from "@/main/composition";
import type { IError } from "@/main/shared/errors";
import { isExpectedErrors } from "./isExpectedErrors";

/**
 * Глобальный обработчик Expected Errors для TanStack Query
 * 
 * Принимает unknown error из TanStack Query,
 * проверяет что это IError[] через type guard,
 * показывает notifications через INotificationManager.
 * 
 * @pattern Type Guard + Separation of Concerns
 * @layer Presentation
 * 
 * @example
 * const queryClient = new QueryClient({
 *   defaultOptions: {
 *     mutations: {
 *       onError: (error) => handleExpectedErrors(error, notificationManager)
 *     }
 *   }
 * });
 */
export function handleExpectedErrors(
  error: unknown,
  notificationManager: INotificationManager
): void {
  // ✅ Type guard вместо instanceof
  if (!isExpectedErrors(error)) {
    return; // Не наша ошибка - пропускаем
  }

  // ✅ TypeScript знает что error это IError[]
  error.forEach((err: IError) => {
    notificationManager.notify({
      level: getNotificationLevel(err),
      message: err.getMessage(),
      duration: 5000,
    });
  });
}

/**
 * Маппинг уровня логирования ошибки на уровень notification
 */
function getNotificationLevel(err: IError): "error" | "warning" | "info" {
  const logLevel = err.getLogLevel();
  
  switch (logLevel) {
    case "error":
      return "error";
    case "warn":
      return "warning";
    case "info":
    case "debug":
      return "info";
    default:
      return "error";
  }
}
