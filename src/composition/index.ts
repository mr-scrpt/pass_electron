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

import { ServiceContainer as ServiceContainerClass } from './ServiceContainer'

// Public API для Composition Layer

export { ServiceContainer } from './ServiceContainer'
export { ConsoleLogger } from './ConsoleLogger'
export { BaseModule } from './modules/BaseModule'
export { ResourceModule } from './modules/ResourceModule'
export { SystemModule } from './modules/SystemModule'
export { QueryFacade } from './queries'
export { CommandFacade } from './commands'

/**
 * Получить queries facade
 * 
 * ⚠️ ServiceContainer должен быть инициализирован!
 * Бросает ошибку если контейнер не инициализирован.
 * 
 * @throws Error если контейнер не инициализирован
 */
export function getQueries() {
  const result = ServiceContainerClass.getQueries()
  
  if (result.isLeft()) {
    throw new Error('ServiceContainer not initialized')
  }
  
  return result.value
}

/**
 * Получить commands facade
 * 
 * ⚠️ ServiceContainer должен быть инициализирован!
 * Бросает ошибку если контейнер не инициализирован.
 * 
 * @throws Error если контейнер не инициализирован
 */
export function getCommands() {
  const result = ServiceContainerClass.getCommands()
  
  if (result.isLeft()) {
    throw new Error('ServiceContainer not initialized')
  }
  
  return result.value
}

// Создаем прокси-объекты для удобного импорта
// Эти экспорты будут работать ТОЛЬКО после инициализации ServiceContainer
export const queries = {
  list: () => getQueries().list(),
}

export const commands = {
  createResource: (params: { namespace: string; name: string; secret: string }) => 
    getCommands().createResource(params),
}
