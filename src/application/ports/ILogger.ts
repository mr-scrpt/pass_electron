/**
 * Интерфейс Logger (Port)
 * 
 * Определяет контракт для логирования в Application Layer
 * Реализации в Infrastructure Layer
 * 
 * Примеры реализаций:
 * - ConsoleLogger (для разработки)
 * - WinstonLogger (для production)
 * - ElectronLogger (для Electron приложений)
 */
export interface ILogger {
  /**
   * Информационные сообщения (normal flow)
   */
  info(message: string, context?: Record<string, unknown>): void
  
  /**
   * Предупреждения (потенциальные проблемы)
   */
  warn(message: string, context?: Record<string, unknown>): void
  
  /**
   * Ошибки (требуют внимания)
   */
  error(message: string, context?: Record<string, unknown>): void
  
  /**
   * Debug информация (только для разработки)
   */
  debug(message: string, context?: Record<string, unknown>): void
}
