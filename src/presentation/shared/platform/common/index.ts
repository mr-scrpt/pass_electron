import type { ILogger } from "@/main/composition";

export interface CommonDependencies {
  logger: ILogger;
}

export function createCommonDependencies(): CommonDependencies {
  console.log("[Platform Config] 📦 Loading COMMON dependencies");

  const logger = createConsoleLogger();

  return { logger };
}

function createConsoleLogger(): ILogger {
  return {
    info: (msg: string) => console.log(`[INFO] ${msg}`),
    warn: (msg: string) => console.warn(`[WARN] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`),
    debug: (msg: string) => console.debug(`[DEBUG] ${msg}`),
  };
}
