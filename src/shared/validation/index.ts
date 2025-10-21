/**
 * Validation - Public API
 * 
 * Экспортирует типы и функции для type-safe валидации
 */

export type { Validation, Either } from './Validation'
export { valid, invalid, ValidationCombinators } from './Validation'

// Re-export методов Either для удобства работы с Validation
export { left, right } from '@sweet-monads/either'
