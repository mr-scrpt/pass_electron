// Public API для shared utilities Application Layer
export { BaseCommandHandler } from './BaseCommandHandler'
export { BaseQueryHandler } from './BaseQueryHandler'

// Application-specific Pipeline Context Types (CQRS)
export type {
  CreateContext,
  UpdateContext,
  DeleteContext,
} from './ApplicationPipelineContext'
