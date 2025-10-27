import type { ILogger } from '@/application/ports'

/**
 * Common Platform Dependencies
 * 
 * Базовые PLATFORM-SPECIFIC зависимости для ВСЕХ платформ.
 * 
 * ⚠️ ВАЖНО: Здесь ТОЛЬКО platform-specific зависимости!
 * - Logger (console, файловый, remote)
 * - Другие platform-specific сервисы
 * 
 * ❌ НЕ включаем бизнес-слой зависимости:
 * - Repository - управляется Composition Layer (ServiceContainer)
 * - Handlers - управляются Composition Layer
 * 
 * @layer Platform Configs (Common)
 */
export interface CommonDependencies {
  logger: ILogger
}

/**
 * Create Common Dependencies
 * 
 * Создает базовые platform-specific зависимости:
 * - ConsoleLogger (дефолтный для всех платформ)
 * 
 * Platform-specific конфиги могут ПЕРЕОПРЕДЕЛИТЬ logger,
 * например, Electron может заменить на файловый.
 */
export function createCommonDependencies(): CommonDependencies {
  console.log('[Platform Config] 📦 Loading COMMON dependencies')
  
  // Logger: Console (дефолтный для всех, можно переопределить)
  const logger = createConsoleLogger()
  
  return { logger }
}

function createConsoleLogger(): ILogger {
  return {
    info: (msg: string) => console.log(`[INFO] ${msg}`),
    warn: (msg: string) => console.warn(`[WARN] ${msg}`),
    error: (msg: string) => console.error(`[ERROR] ${msg}`),
    debug: (msg: string) => console.debug(`[DEBUG] ${msg}`),
  };
}
