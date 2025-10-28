import type { ILogger } from "@/application/ports";

export class ConsoleLogger implements ILogger {
  info(message: string, context?: Record<string, unknown>): void {
    console.log(`ℹ️ [INFO] ${message}`, context || "");
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`⚠️ [WARN] ${message}`, context || "");
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(`❌ [ERROR] ${message}`, context || "");
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`🐛 [DEBUG] ${message}`, context || "");
    }
  }
}
