/**
 * Composition Layer - Public API
 * 
 * Единственная точка входа для Presentation Layer
 * Предоставляет готовые фасады queries и commands
 * 
 * @example
 * ```typescript
 * // В routes
 * import { queries, commands } from '@/composition'
 * 
 * // Query
 * const resources = await queries.list()
 * 
 * // Command
 * await commands.createResource({ namespace, name })
 * ```
 */

// Public API для Composition Layer

export { ServiceContainer } from './ServiceContainer'
export { ConsoleLogger } from './ConsoleLogger'
export { BaseModule } from './modules/BaseModule'
export { ResourceModule } from './modules/ResourceModule'
export { SystemModule } from './modules/SystemModule'
export { CommandFacade } from './commands'
