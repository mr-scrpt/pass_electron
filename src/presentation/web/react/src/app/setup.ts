import { initializeContainer } from "@/main/composition";
import { createWebDependencies } from "@/platform/web";

console.log("[Setup] Initializing ServiceContainer...");
initializeContainer(createWebDependencies());
console.log("[Setup] ✅ ServiceContainer initialized");

export const handleGlobalError = (
  error: unknown,
  errorInfo?: React.ErrorInfo,
) => {
  console.error("[Global Unhandled Error]", {
    error,
    componentStack: errorInfo?.componentStack ?? undefined,
    timestamp: new Date().toISOString(),
  });

  // if (!import.meta.env.DEV) {
  // }
};
