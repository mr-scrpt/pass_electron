/**
 * Базовый тип для всех ошибок приложения с классификацией
 * 
 * Позволяет различать типы ошибок БЕЗ instanceof:
 * - isOperational: true → показываем пользователю (бизнес-ошибки)
 * - isOperational: false → логируем, не показываем (инфраструктурные)
 * 
 * severity:
 * - low: информационные (например, кеш промахнулся)
 * - medium: обычные бизнес-ошибки (валидация, not found)
 * - high: критичные ошибки (дубликаты, конфликты)
 */
export interface AppError extends Error {
  /** Код ошибки для идентификации типа */
  readonly code: string
  
  /** Операционная ошибка (бизнес-логика) или инфраструктурная */
  readonly isOperational: boolean
  
  /** Уровень критичности ошибки */
  readonly severity: 'low' | 'medium' | 'high'
  
  /** Дополнительный контекст */
  readonly context?: Record<string, unknown>
  
  /** Причина (вложенная ошибка) */
  readonly cause?: Error
}
