// src/presentation/web/react/src/entry.client.tsx
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// ✅ Глобальный обработчик ошибок (только логирование)
const handleGlobalError = (error: unknown, errorInfo?: React.ErrorInfo) => {
  console.error("[Global Unhandled Error]", {
    error,
    componentStack: errorInfo?.componentStack ?? undefined,
    timestamp: new Date().toISOString(),
  });

  // В продакшене - отправка в Sentry/LogRocket
  if (!import.meta.env.DEV) {
    // sendToSentry(error, errorInfo);
  }
};

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter unstable_onError={handleGlobalError} />
    </StrictMode>
  );
});
