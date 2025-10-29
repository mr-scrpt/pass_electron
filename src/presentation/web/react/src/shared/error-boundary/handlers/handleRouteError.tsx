import { isRouteErrorResponse } from "react-router";
import { valid, invalid, type Validation } from "@/main/shared";
import { HttpErrorView } from "../components/HttpErrorView";

type ErrorHandlerResult = React.ReactNode;

/**
 * Обработчик для React Router HTTP ошибок (404, 500, etc.)
 */
export function handleRouteError(
  error: unknown
): Validation<"not_handled", ErrorHandlerResult> {
  if (isRouteErrorResponse(error)) {
    return valid(
      <HttpErrorView
        status={error.status}
        statusText={error.statusText}
        data={error.data}
      />
    );
  }

  return invalid("not_handled");
}
