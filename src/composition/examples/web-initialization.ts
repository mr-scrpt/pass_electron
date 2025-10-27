/**
 * Пример инициализации ServiceContainer для Web UI
 * 
 * Этот файл показывает как правильно инициализировать контейнер
 * в entry point приложения
 */

import { ServiceContainer } from '../ServiceContainer'
import { MockResourceRepository } from '@/infrastructure/repositories'
import { ConsoleLogger } from '../ConsoleLogger'
import { WebNotificationManager } from '@/infrastructure/notifications'
import { ConsoleNotificationManager } from '@/infrastructure/notifications'

/**
 * Инициализация для Web приложения
 * Вызывается ОДИН РАЗ в entry point (init.ts)
 * 
 * ⚠️ Для реального Web приложения нужно создать SonnerNotificationDisplay
 * из Presentation Layer. Этот пример использует ConsoleNotificationManager.
 */
export function initializeWebContainer(): void {
  ServiceContainer.initialize({
    repository: new MockResourceRepository(),
    logger: new ConsoleLogger(),
    notificationManager: new ConsoleNotificationManager()
  })
}

/**
 * Использование в React Router routes:
 * 
 * ```typescript
 * // src/presentation/web/react/src/routes/_index.tsx
 * import { ServiceContainer } from '@/composition'
 * 
 * export async function loader() {
 *   const queries = ServiceContainer.getQueries()
 *   const result = await queries.list()
 *   
 *   return result
 *     .map((resources) => ({ resources }))
 *     .mapLeft((errors) => ({ errors }))
 *     .value
 * }
 * ```
 * 
 * Использование в Actions:
 * 
 * ```typescript
 * // src/presentation/web/react/src/routes/create.tsx
 * import { ServiceContainer } from '@/composition'
 * 
 * export async function action({ request }: ActionFunctionArgs) {
 *   const formData = await request.formData()
 *   const commands = ServiceContainer.getCommands()
 *   
 *   const result = await commands.createResource({
 *     namespace: formData.get('namespace') as string,
 *     name: formData.get('name') as string,
 *     secret: formData.get('secret') as string
 *   })
 *   
 *   return result
 *     .map(() => redirect('/'))
 *     .mapLeft((errors) => ({ errors }))
 *     .value
 * }
 * ```
 */
