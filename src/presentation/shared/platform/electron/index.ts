// import { SonnerNotificationDisplay } from '../web/adapters/SonnerNotificationDisplay'
// import { ElectronNotificationDecorator } from '@/presentation/electron/adapters/ElectronNotificationDecorator'
// import { WebNotificationManager } from '@/infrastructure/notifications'
// import { createCommonDependencies } from '../common'
// import type { PlatformDependencies } from '../web'
// import type { ILogger } from '@/application/ports'
//
// /**
//  * Electron Platform Configuration
//  *
//  * РАСШИРЯЕТ common конфиг через Decorator Pattern:
//  * - Базовые зависимости (repository) из common
//  * - Notification: SonnerDisplay + ElectronNotificationDecorator (OS notifications)
//  * - Logger: ПЕРЕОПРЕДЕЛЯЕТ на ElectronLogger (файловый лог)
//  *
//  * Ключевой принцип: Базу берем из common, добавляем/переопределяем специфику.
//  *
//  * @layer Platform Configs (Electron)
//  */
// export function createPlatformDependencies(): PlatformDependencies {
//   console.log('[Platform Config] ⚡ Loading ELECTRON configuration')
//
//   // ✅ Получаем базовые зависимости из common
//   const common = createCommonDependencies()
//
//   // ✅ Добавляем Electron-специфичные: Notification system
//   // 1️⃣ Переиспользуем Web адаптер
//   const webDisplay = new SonnerNotificationDisplay()
//
//   // 2️⃣ РАСШИРЯЕМ через Decorator (добавляет OS notifications)
//   const electronDisplay = new ElectronNotificationDecorator(webDisplay)
//   const notificationManager = new WebNotificationManager(electronDisplay)
//
//   // ✅ ПЕРЕОПРЕДЕЛЯЕМ logger на Electron-specific (файловый лог)
//   const logger = createElectronLogger()
//
//   return {
//     ...common,  // repository из common
//     notificationManager,  // Electron-specific
//     logger  // ПЕРЕОПРЕДЕЛЯЕМ дефолтный ConsoleLogger
//   }
// }
//
// /**
//  * Electron Logger
//  *
//  * Логирует в файл + console.
//  *
//  * TODO: Реализовать файловый лог через electron-log или winston
//  */
// function createElectronLogger(): ILogger {
//   return {
//     info: (msg: string) => {
//       console.log(`[Electron INFO] ${msg}`)
//       // TODO: записать в файл
//     },
//     warn: (msg: string) => {
//       console.warn(`[Electron WARN] ${msg}`)
//       // TODO: записать в файл
//     },
//     error: (msg: string) => {
//       console.error(`[Electron ERROR] ${msg}`)
//       // TODO: записать в файл
//     },
//     debug: (msg: string) => {
//       console.debug(`[Electron DEBUG] ${msg}`)
//       // TODO: записать в файл
//     }
//   }
// }
