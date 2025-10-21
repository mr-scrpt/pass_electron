/**
 * Specification Pattern - Public API
 * 
 * Экспортирует все спецификации для использования в проекте
 */

export type { ISpecification } from './ISpecification'
export { CompositeSpecification } from './CompositeSpecification'
export {
  ValidationError,
  NotEmptySpec,
  LengthRangeSpec,
  PatternSpec,
  LowercaseSpec
} from './StringSpecifications'
export { UuidV4Spec } from './UuidSpecifications'
