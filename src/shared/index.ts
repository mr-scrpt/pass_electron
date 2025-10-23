// src/shared/index.ts - Public API для Shared Utilities

// Validation API (фасад над @sweet-monads/either)
export type { Validation } from './validation'
export { valid, invalid, fromCondition, isTrue, ValidationCombinators } from './validation'

// Specification Pattern (технический интерфейс)
export type { ISpecification } from './specification'

// ValidationError (технический)
export { ValidationError } from './errors'
