import type { INotificationManager } from "@/main/composition";
import type { IError } from "@/main/shared/errors";
import { isExpectedErrors } from "./isExpectedErrors";
import { useNotification } from "@/shared/provider/NotificationContext";

export function handleExpectedErrors(error: unknown): void {
  const { notificationManager } = useNotification();

  if (!isExpectedErrors(error)) return;

  error.forEach((err: IError) => {
    notificationManager.notify({
      level: getNotificationLevel(err),
      message: err.getMessage(),
      duration: 5000,
    });
  });
}

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
