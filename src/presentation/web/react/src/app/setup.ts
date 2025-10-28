// src/presentation/web/react/src/app/setup.ts

/**
 * Глобальная инициализация приложения
 * 
 * Этот модуль выполняется один раз при загрузке (module-level):
 * - На сервере: при старте dev server / build
 * - На клиенте: при первой загрузке страницы
 * 
 * Singleton pattern гарантирует, что DI контейнер создается только один раз.
 */

import { initializeContainer } from "@/main/composition";
import { createWebDependencies } from "@/platform/web";

// ✅ Инициализация DI контейнера
console.log("[Setup] Initializing ServiceContainer...");
initializeContainer(createWebDependencies());
console.log("[Setup] ✅ ServiceContainer initialized");

// ✅ Глобальный error handler для React
export const handleGlobalError = (error: unknown, errorInfo?: React.ErrorInfo) => {
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
