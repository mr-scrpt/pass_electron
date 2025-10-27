/**
 * Platform Configuration - Web Entry Point
 * 
 * Реэкспорт из platform-configs package.
 * 
 * ⚠️ ЭТОТ ФАЙЛ ПОДМЕНЯЕТСЯ Electron build script!
 * 
 * - Web standalone: реэкспортирует @password-manager/platform-configs/web
 * - Electron build: скрипт подменяет на electron версию
 * 
 * React НЕ знает какая платформа используется.
 * React просто импортирует createPlatformDependencies и получает готовые зависимости.
 * 
 * @layer Presentation (Web/React)
 */
export * from '@password-manager/platform-configs/web'
