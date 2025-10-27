# 🚀 Notification Manager System - Детальный план реализации

**Дата создания:** 2025-10-26  
**Обновлено:** 2025-10-26 (полноценный NotificationManager)  
**Статус:** Готов к реализации  
**Архитектура:** DDD + Clean Architecture + Hexagonal Architecture  
**Паттерн:** Port & Adapter + Dependency Injection + Event-Driven  

---

## 📋 ЭТАП 1: Application Layer - INotificationManager (Port)

### Создаем структуру:
```
src/application/ports/
├── INotificationManager.ts    # Port (интерфейс)
└── types/
    └── Notification.ts         # Типы для нотификаций
```

### Задачи:

#### ✅ 1.1. Создать `src/application/ports/types/Notification.ts`

```typescript
/**
 * Notification - объект уведомления
 * 
 * @layer Application
 */
export interface Notification {
  readonly id: string
  readonly level: NotificationLevel
  readonly message: string
  readonly timestamp: Date
  readonly duration?: number
  readonly action?: NotificationAction
}

export type NotificationLevel = 'success' | 'error' | 'info' | 'warning'

export interface NotificationAction {
  readonly label: string
  readonly onClick: () => void
}

/**
 * Параметры для создания нотификации
 */
export interface CreateNotificationParams {
  readonly level: NotificationLevel
  readonly message: string
  readonly duration?: number
  readonly action?: NotificationAction
}
```

**Файл:** `src/application/ports/types/Notification.ts`

---

#### ✅ 1.2. Создать `src/application/ports/INotificationManager.ts`

```typescript
import type { Notification, CreateNotificationParams } from './types/Notification'

/**
 * Notification Manager Port
 * 
 * Полноценная система управления уведомлениями:
 * - Показ уведомлений с ID
 * - История уведомлений
 * - Управление (dismiss)
 * - Подписка на события
 * 
 * Application Layer НЕ знает о конкретной реализации (Web UI, Console, etc.)
 * 
 * @pattern Port & Adapter (Hexagonal Architecture)
 * @pattern Observer (для подписок)
 * @layer Application
 */
export interface INotificationManager {
  /**
   * Показать уведомление
   * @param params - Параметры уведомления
   * @returns ID созданного уведомления
   * 
   * @example
   * const id = manager.notify({
   *   level: 'success',
   *   message: 'Resource created!',
   *   duration: 4000
   * })
   */
  notify(params: CreateNotificationParams): string

  /**
   * Скрыть конкретное уведомление
   * @param id - ID уведомления
   */
  dismiss(id: string): void

  /**
   * Скрыть все уведомления
   */
  dismissAll(): void

  /**
   * Получить историю всех уведомлений
   * @returns Массив уведомлений, отсортированный по timestamp (новые первыми)
   */
  getHistory(): Notification[]

  /**
   * Очистить историю
   */
  clearHistory(): void

  /**
   * Подписаться на события уведомлений
   * @param handler - Обработчик нового уведомления
   * @returns Функция отписки
   * 
   * @example
   * const unsubscribe = manager.subscribe((notification) => {
   *   console.log('New notification:', notification)
   * })
   * // Позже:
   * unsubscribe()
   */
  subscribe(handler: (notification: Notification) => void): () => void
}
```

**Файл:** `src/application/ports/INotificationManager.ts`

---

#### ✅ 1.3. Обновить `src/application/ports/index.ts`

```typescript
// Добавить экспорты
export type { INotificationManager } from './INotificationManager'
export type { 
  Notification, 
  NotificationLevel, 
  NotificationAction,
  CreateNotificationParams 
} from './types/Notification'
```

**Файл:** `src/application/ports/index.ts`

---

### Проверка этапа 1:
- [ ] Файл `types/Notification.ts` создан
- [ ] Файл `INotificationManager.ts` создан
- [ ] Экспорты добавлены в `index.ts`
- [ ] TypeScript компилируется без ошибок
- [ ] Коммит: `feat: add INotificationManager port with history and events`

---

## 📋 ЭТАП 2: Infrastructure Layer - NotificationManager Adapter

### Создаем структуру:
```
src/infrastructure/notifications/
├── WebNotificationManager.ts      # Web UI adapter (sonner)
├── ConsoleNotificationManager.ts  # Dev/test adapter
└── index.ts                       # Public API
```

### Задачи:

#### ✅ 2.1. Создать `src/infrastructure/notifications/WebNotificationManager.ts`

```typescript
import type { 
  INotificationManager, 
  Notification, 
  CreateNotificationParams 
} from '@/application/ports'
import { toast } from 'sonner'

/**
 * Web Notification Manager - Adapter для Web UI
 * 
 * Реализует INotificationManager через UI библиотеку.
 * Управляет историей, подписками и отображением уведомлений.
 * 
 * @pattern Adapter (Hexagonal Architecture)
 * @pattern Observer (для подписок)
 * @layer Infrastructure
 */
export class WebNotificationManager implements INotificationManager {
  private history: Notification[] = []
  private subscribers: Set<(notification: Notification) => void> = new Set()
  private notificationCounter = 0

  notify(params: CreateNotificationParams): string {
    // Генерируем уникальный ID
    const id = `notification-${Date.now()}-${++this.notificationCounter}`
    
    // Создаем объект Notification
    const notification: Notification = {
      id,
      level: params.level,
      message: params.message,
      timestamp: new Date(),
      duration: params.duration,
      action: params.action
    }
    
    // Добавляем в историю
    this.history.unshift(notification)
    
    // Показываем через UI библиотеку
    switch (params.level) {
      case 'success':
        toast.success(params.message, { id, duration: params.duration })
        break
      case 'error':
        toast.error(params.message, { id, duration: params.duration })
        break
      case 'info':
        toast.info(params.message, { id, duration: params.duration })
        break
      case 'warning':
        toast.warning(params.message, { id, duration: params.duration })
        break
    }
    
    // Уведомляем подписчиков
    this.subscribers.forEach(handler => handler(notification))
    
    return id
  }

  dismiss(id: string): void {
    toast.dismiss(id)
  }

  dismissAll(): void {
    toast.dismiss()
  }

  getHistory(): Notification[] {
    return [...this.history]
  }

  clearHistory(): void {
    this.history = []
  }

  subscribe(handler: (notification: Notification) => void): () => void {
    this.subscribers.add(handler)
    
    // Возвращаем функцию отписки
    return () => {
      this.subscribers.delete(handler)
    }
  }
}
```

**Файл:** `src/infrastructure/notifications/WebNotificationManager.ts`

---

#### ✅ 2.2. Создать `src/infrastructure/notifications/ConsoleNotificationManager.ts`

```typescript
import type { 
  INotificationManager, 
  Notification, 
  CreateNotificationParams 
} from '@/application/ports'

/**
 * Console Notification Manager - Adapter для Dev/Test
 * 
 * Реализует INotificationManager через console.log.
 * Используется для тестирования и разработки.
 * 
 * @pattern Adapter (Hexagonal Architecture)
 * @pattern Observer (для подписок)
 * @layer Infrastructure
 */
export class ConsoleNotificationManager implements INotificationManager {
  private history: Notification[] = []
  private subscribers: Set<(notification: Notification) => void> = new Set()
  private notificationCounter = 0

  notify(params: CreateNotificationParams): string {
    const id = `notification-${Date.now()}-${++this.notificationCounter}`
    
    const notification: Notification = {
      id,
      level: params.level,
      message: params.message,
      timestamp: new Date(),
      duration: params.duration,
      action: params.action
    }
    
    this.history.unshift(notification)
    
    // Выводим в консоль с эмодзи
    const emoji = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    }[params.level]
    
    console.log(`${emoji} [${params.level.toUpperCase()}] ${params.message}`)
    
    this.subscribers.forEach(handler => handler(notification))
    
    return id
  }

  dismiss(id: string): void {
    console.log(`[DISMISS] ${id}`)
  }

  dismissAll(): void {
    console.log('[DISMISS ALL]')
  }

  getHistory(): Notification[] {
    return [...this.history]
  }

  clearHistory(): void {
    this.history = []
    console.log('[HISTORY CLEARED]')
  }

  subscribe(handler: (notification: Notification) => void): () => void {
    this.subscribers.add(handler)
    console.log('[SUBSCRIBED] New subscriber added')
    
    return () => {
      this.subscribers.delete(handler)
      console.log('[UNSUBSCRIBED] Subscriber removed')
    }
  }
}
```

**Файл:** `src/infrastructure/notifications/ConsoleNotificationManager.ts`

---

#### ✅ 2.3. Создать `src/infrastructure/notifications/index.ts`

```typescript
/**
 * Notification Manager Adapters - Public API
 */
export { WebNotificationManager } from './WebNotificationManager'
export { ConsoleNotificationManager } from './ConsoleNotificationManager'
```

**Файл:** `src/infrastructure/notifications/index.ts`

---

#### ✅ 2.4. Обновить `src/infrastructure/index.ts`

```typescript
// Добавить в конец файла:
export * from './notifications'
```

**Файл:** `src/infrastructure/index.ts`

---

### Проверка этапа 2:
- [ ] `WebNotificationManager.ts` создан (с историей, подписками, ID)
- [ ] `ConsoleNotificationManager.ts` создан
- [ ] `index.ts` создан с экспортами
- [ ] Экспорт добавлен в `src/infrastructure/index.ts`
- [ ] TypeScript компилируется без ошибок
- [ ] Коммит: `feat: add notification manager adapters with history and events`

---

## 📋 ЭТАП 3: Composition Layer - DI Integration

### Обновляем:
```
src/composition/ServiceContainer.ts
```

### Задачи:

#### ✅ 3.1. Добавить NotificationManager в ServiceContainer

**Импорты (в начало файла):**
```typescript
import type { INotificationManager } from '@/application/ports'
import { WebNotificationManager } from '@/infrastructure/notifications'
```

**Поле класса (добавить после actionBus):**
```typescript
private static notificationManager: INotificationManager | null = null
```

**Метод initialize (добавить после создания actionBus):**
```typescript
// Notification Manager
const notificationManager = new WebNotificationManager()
this.notificationManager = notificationManager
```

**Getter (добавить после getActionBus):**
```typescript
/**
 * Получить Notification Manager
 * 
 * @returns Validation монада с INotificationManager или ошибкой
 * @example
 * const result = ServiceContainer.getNotificationManager()
 * result
 *   .map(manager => {
 *     const id = manager.notify({ level: 'success', message: 'Hello!' })
 *     return id
 *   })
 *   .mapLeft(errors => console.error('Failed:', errors))
 */
static getNotificationManager(): Validation<IError[], INotificationManager> {
  return isTrue(
    this.notificationManager !== null,
    this.notificationManager!
  )
    .valid()
    .invalid([
      new InfrastructureError(
        'ServiceContainer',
        'Container not initialized. Call initialize() first.'
      )
    ])
}
```

**Файл:** `src/composition/ServiceContainer.ts`

---

#### ✅ 3.2. Обновить метод reset()

```typescript
// Добавить в метод reset():
this.notificationManager = null
```

**Файл:** `src/composition/ServiceContainer.ts`

---

### Проверка этапа 3:
- [ ] Импорты добавлены
- [ ] Поле `notificationManager` объявлено
- [ ] `initialize()` создает WebNotificationManager
- [ ] `getNotificationManager()` реализован с JSDoc
- [ ] `reset()` очищает NotificationManager
- [ ] TypeScript компилируется без ошибок
- [ ] Коммит: `feat: integrate NotificationManager in ServiceContainer`

---

## 📋 ЭТАП 4: Application Layer - ActionContext Update

### Обновляем:
```
src/application/services/keymap/types.ts
```

### Задачи:

#### ✅ 4.1. Добавить notificationManager в ActionContext

**Импорт (добавить в начало):**
```typescript
import type { INotificationManager } from '@/application/ports'
```

**Интерфейс ActionContext (обновить):**
```typescript
export interface ActionContext {
  mode: AppMode
  route: string
  
  // Dependency Injection через context
  actionBus?: IActionBus
  notificationManager?: INotificationManager  // 🆕
}
```

**Файл:** `src/application/services/keymap/types.ts`

---

### Проверка этапа 4:
- [ ] Импорт `INotificationManager` добавлен
- [ ] Поле `notificationManager` добавлено в `ActionContext`
- [ ] TypeScript компилируется без ошибок
- [ ] Коммит: `feat: add notificationManager to ActionContext`

---

## 📋 ЭТАП 5: Keymap Integration - Home Keymap Update

### Обновляем:
```
src/application/services/keymap/keymaps/home.ts
```

### Задачи:

#### ✅ 5.1. Обновить Ctrl+I keymap

**Заменить keymap:**
```typescript
export const homeKeymaps: Keymap[] = [
  {
    id: 'show-random-resource',
    name: 'Show Random Resource',
    binding: { key: 'i', ctrl: true },
    action: async (ctx) => {
      // 🆕 Показываем info нотификацию ДО выполнения
      ctx.notificationManager?.notify({
        level: 'info',
        message: 'Loading random resource...',
        duration: 2000
      })
      
      // Отправляем Action в Action Bus
      await ctx.actionBus?.dispatch(
        new ShowRandomResourceAction()
      )
      
      // Success нотификация будет в Handler
    },
    description: 'Show random resource from list and notify user',
    modes: ['navigation'],
    routes: ['/']
  }
]
```

**Файл:** `src/application/services/keymap/keymaps/home.ts`

---

### Проверка этапа 5:
- [ ] Keymap обновлен с вызовом `notificationManager.notify()`
- [ ] TypeScript компилируется без ошибок
- [ ] Коммит: `feat: add notification to Ctrl+I keymap`

---

## 📋 ЭТАП 6: Presentation Layer - Handler Update

### Обновляем:
```
src/presentation/web/react/src/routes/home.tsx
```

### Задачи:

#### ✅ 6.1. Создать Helper методы (опционально, для удобства)

**Создать файл `src/shared/utils/notificationHelpers.ts` (опционально):**
```typescript
import type { INotificationManager, CreateNotificationParams } from '@/application/ports'

/**
 * Helper функции для упрощения работы с NotificationManager
 */
export function notifySuccess(manager: INotificationManager, message: string, duration = 4000): string {
  return manager.notify({ level: 'success', message, duration })
}

export function notifyError(manager: INotificationManager, message: string, duration = 6000): string {
  return manager.notify({ level: 'error', message, duration })
}

export function notifyInfo(manager: INotificationManager, message: string, duration = 3000): string {
  return manager.notify({ level: 'info', message, duration })
}

export function notifyWarning(manager: INotificationManager, message: string, duration = 5000): string {
  return manager.notify({ level: 'warning', message, duration })
}
```

**Файл:** `src/shared/utils/notificationHelpers.ts` (опционально)

---

#### ✅ 6.2. Обновить ShowRandomResourceHandler

**Класс ShowRandomResourceHandler (заменить):**
```typescript
import { notifySuccess, notifyWarning } from '@/shared/utils/notificationHelpers'

class ShowRandomResourceHandler implements IActionHandler<ShowRandomResourceAction> {
  constructor(
    private resources: ResourceListItemDTO[],
    private setRandomResource: (resource: ResourceListItemDTO | null) => void,
    private notificationManager: INotificationManager  // 🆕 DI через constructor
  ) {}
  
  handle(_action: ShowRandomResourceAction): void {
    if (this.resources.length === 0) {
      console.warn('[ShowRandomResourceHandler] No resources available')
      
      // 🆕 Показываем warning нотификацию
      notifyWarning(this.notificationManager, 'No resources available')
      return
    }
    
    const randomIndex = Math.floor(Math.random() * this.resources.length)
    const randomResource = this.resources[randomIndex]
    
    this.setRandomResource(randomResource)
    
    // 🆕 Показываем success нотификацию с ID
    const notificationId = notifySuccess(
      this.notificationManager,
      `🎲 Random: ${randomResource.namespace}/${randomResource.name}`
    )
    
    console.log('🎲 Random Resource Selected:', {
      id: randomResource.id,
      namespace: randomResource.namespace,
      name: randomResource.name,
      notificationId  // ID уведомления
    })
  }
}
```

**Альтернатива без helpers (прямое использование):**
```typescript
class ShowRandomResourceHandler implements IActionHandler<ShowRandomResourceAction> {
  constructor(
    private resources: ResourceListItemDTO[],
    private setRandomResource: (resource: ResourceListItemDTO | null) => void,
    private notificationManager: INotificationManager  // 🆕 DI
  ) {}
  
  handle(_action: ShowRandomResourceAction): void {
    if (this.resources.length === 0) {
      // Прямое использование notify
      this.notificationManager.notify({
        level: 'warning',
        message: 'No resources available',
        duration: 5000
      })
      return
    }
    
    const randomIndex = Math.floor(Math.random() * this.resources.length)
    const randomResource = this.resources[randomIndex]
    
    this.setRandomResource(randomResource)
    
    // Прямое использование notify
    const id = this.notificationManager.notify({
      level: 'success',
      message: `🎲 Random: ${randomResource.namespace}/${randomResource.name}`,
      duration: 4000
    })
    
    console.log('🎲 Random Resource Selected:', { notificationId: id })
  }
}
```

---

#### ✅ 6.3. Обновить useEffect - получить NotificationManager

**Импорт (добавить если нет):**
```typescript
import type { INotificationManager } from '@/application/ports'
```

**useEffect (заменить):**
```typescript
useEffect(() => {
  const actionBusResult = ServiceContainer.getActionBus()
  const notificationResult = ServiceContainer.getNotificationManager()
  
  // 🆕 Комбинируем обе Validation монады
  const combined = actionBusResult.chain(actionBus =>
    notificationResult.map(notificationManager => ({
      actionBus,
      notificationManager
    }))
  )
  
  return combined
    .map(({ actionBus, notificationManager }) => {
      // Handler получает NotificationManager через constructor DI
      const handler = new ShowRandomResourceHandler(
        resources,
        setRandomResource,
        notificationManager  // 🆕 DI
      )
      
      actionBus.register('ShowRandomResourceAction', handler)
      console.log('[Home] ShowRandomResourceAction handler registered')
      
      // ВРЕМЕННО: Прямой перехват Ctrl+I (до реализации KeymapExecutor)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'i') {
          e.preventDefault()
          console.log('[Home] Ctrl+I pressed, dispatching action...')
          actionBus.dispatch(new ShowRandomResourceAction()).catch(console.error)
        }
      }
      
      window.addEventListener('keydown', handleKeyDown)
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        actionBus.unregister('ShowRandomResourceAction')
        console.log('[Home] ShowRandomResourceAction handler unregistered')
      }
    })
    .mapLeft(errors => {
      console.error('[Home] Failed to get services:', errors)
      return () => {}
    })
    .value
}, [resources])
```

**Файл:** `src/presentation/web/react/src/routes/home.tsx`

---

### Проверка этапа 6:
- [ ] (Опционально) Helper методы созданы
- [ ] ShowRandomResourceHandler обновлен
- [ ] Constructor принимает `INotificationManager`
- [ ] Handler использует `notify()` или helpers
- [ ] useEffect получает NotificationManager из ServiceContainer
- [ ] Handler создается с NotificationManager
- [ ] TypeScript компилируется без ошибок
- [ ] Коммит: `feat: integrate notification manager in ShowRandomResourceHandler`

---

## 📋 ЭТАП 7: Presentation Layer - Toast UI (sonner)

### Структура:
```
src/presentation/web/react/
├── package.json                   # Добавить sonner
├── src/
│   ├── root.tsx                   # Toaster provider
│   └── routes/home.tsx           # Уже обновлен
```

### Задачи:

#### ✅ 7.1. Установить sonner

```bash
cd src/presentation/web/react
pnpm add sonner
```

**Команда:** `cd src/presentation/web/react && pnpm add sonner`

---

#### ✅ 7.2. Найти root component (root.tsx или app.tsx)

**Проверить существование:**
```bash
ls src/presentation/web/react/src/root.tsx
ls src/presentation/web/react/src/app.tsx
```

---

#### ✅ 7.3. Добавить Toaster provider

**Если файл существует, обновить его. Если нет - создать:**

**Вариант 1: root.tsx существует (обновить)**
```typescript
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { Toaster } from 'sonner'  // 🆕

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Toaster 
          position="top-right"
          richColors
          theme="dark"
          expand={false}
          duration={4000}
        />  {/* 🆕 */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
```

**Файл:** `src/presentation/web/react/src/root.tsx`

---

#### ✅ 7.4. Проверить WebNotificationManager - использует sonner

**WebNotificationManager** уже создан в Этапе 2 и использует sonner.

Убедиться что в `src/infrastructure/notifications/WebNotificationManager.ts`:
- ✅ Импорт `import { toast } from 'sonner'`
- ✅ Вызовы `toast.success()`, `toast.error()`, etc.
- ✅ Передача `id` и `duration` в toast

**Файл:** `src/infrastructure/notifications/WebNotificationManager.ts` (уже готов)

---

### Проверка этапа 7:
- [ ] `sonner` установлен (`package.json` обновлен)
- [ ] `Toaster` добавлен в root component
- [ ] `ToastNotificationService` использует `toast` из sonner
- [ ] TypeScript компилируется без ошибок
- [ ] Коммит: `feat: integrate sonner toast library`

---

## 📋 ЭТАП 8: Testing & Verification

### Задачи:

#### ✅ 8.1. TypeScript компиляция

```bash
cd src/presentation/web/react
pnpm tsc --noEmit
```

**Ожидается:** No errors

---

#### ✅ 8.2. ESLint проверка

```bash
pnpm eslint src/ --fix
```

**Ожидается:** No errors

---

#### ✅ 8.3. Запустить dev сервер

```bash
cd src/presentation/web/react
pnpm dev
```

**Открыть:** http://localhost:5173/

---

#### ✅ 8.4. Протестировать Ctrl+I

**Сценарий 1: Есть ресурсы**
1. Открыть страницу `/`
2. Должны быть видны 3 ресурса
3. Нажать `Ctrl+I`
4. **Ожидается:**
   - ℹ️ Blue toast: "Loading random resource..."
   - ✅ Green toast: "🎲 Random: [social]/facebook"
   - Желтый блок вверху с выбранным ресурсом
   - Ресурс подсвечен в списке

**Сценарий 2: Нет ресурсов**
1. Очистить mock данные (временно)
2. Нажать `Ctrl+I`
3. **Ожидается:**
   - ⚠️ Orange toast: "No resources available"

---

#### ✅ 8.5. Проверить cleanup

**Сценарий:**
1. Открыть страницу `/`
2. Нажать `Ctrl+I` (должно работать)
3. Перейти на другую страницу
4. Вернуться на `/`
5. Нажать `Ctrl+I` (должно работать)

**Ожидается:** Handler корректно регистрируется/отменяется

---

### Проверка этапа 8:
- [ ] TypeScript компилируется без ошибок
- [ ] ESLint не выдает ошибок
- [ ] Dev сервер запускается
- [ ] Info toast показывается
- [ ] Success toast показывается
- [ ] Warning toast показывается (если нет ресурсов)
- [ ] Cleanup работает корректно
- [ ] Нет ошибок в console.log браузера
- [ ] Коммит: `test: verify notification system integration`

---

## 📋 ЭТАП 9: Documentation

### Задачи:

#### ✅ 9.1. Создать `docs/NOTIFICATION_SYSTEM.md`

**Содержание:**
- Архитектура (Port & Adapter)
- INotificationService интерфейс
- Примеры использования
- DI через ActionContext
- Адаптеры (Toast, Console)
- Тестирование
- Будущие улучшения (Mode Status, Rich Notifications)

**Файл:** `docs/NOTIFICATION_SYSTEM.md`

---

#### ✅ 9.2. Обновить `docs/ACTION_BUS_GUIDE.md`

**Добавить:**
- Пример использования NotificationService в Action Handler
- Обновить ActionContext с notificationService полем
- Пример интеграции в Keymap

**Файл:** `docs/ACTION_BUS_GUIDE.md`

---

#### ✅ 9.3. Обновить `docs/COMPOSITION_LAYER.md`

**Добавить:**
- NotificationService в список сервисов ServiceContainer
- Пример инициализации
- Пример получения через getter

**Файл:** `docs/COMPOSITION_LAYER.md`

---

### Проверка этапа 9:
- [ ] `NOTIFICATION_SYSTEM.md` создан
- [ ] `ACTION_BUS_GUIDE.md` обновлен
- [ ] `COMPOSITION_LAYER.md` обновлен
- [ ] Все примеры кода работают
- [ ] Коммит: `docs: add notification system documentation`

---

## 🎯 Порядок выполнения

```
Этап 1 → Commit: feat: add INotificationManager port with history and events
Этап 2 → Commit: feat: add notification manager adapters (WebNotificationManager, Console)
Этап 3 → Commit: feat: integrate NotificationManager in ServiceContainer
Этап 4 → Commit: feat: add notificationManager to ActionContext
Этап 5 → Commit: feat: add notifications to Ctrl+I keymap
Этап 6 → Commit: feat: integrate notification manager in handlers with helpers
Этап 7 → Commit: feat: integrate sonner toast library
Этап 8 → Commit: test: verify notification manager system
Этап 9 → Commit: docs: add notification manager documentation
```

---

## ⏱️ Оценка времени

| Этап | Время | Сложность | Особенности |
|------|-------|-----------|-------------|
| 1. Port + Types | 10 мин | Средне | Notification interface + CreateParams |
| 2. Adapters | 30 мин | Средне | WebNotificationManager с историей, подписками |
| 3. DI | 10 мин | Средне | ServiceContainer integration |
| 4. Context | 5 мин | Легко | ActionContext update |
| 5. Keymap | 5 мин | Легко | notify() в keymap |
| 6. Handler + Helpers | 20 мин | Средне | Helpers + handler update |
| 7. sonner UI | 20 мин | Средне | Toaster provider |
| 8. Testing | 20 мин | Средне | Проверка истории, подписок, dismiss |
| 9. Docs | 30 мин | Средне | Обновление 3 файлов |
| **ИТОГО** | **~2.5 часа** | | |

---

## 🎨 Ожидаемый результат

### При нажатии Ctrl+I:

**1. Info toast (синий, top-right, 2 сек):**
```
ℹ️  Loading random resource...
```
- **ID вернут**: `notification-1730000000-1`
- **В истории**: добавлено

**2. Success toast (зеленый, top-right, 4 сек):**
```
✅ 🎲 Random: [social]/facebook
```
- **ID вернут**: `notification-1730000001-2`
- **В истории**: добавлено
- **Подписчики**: уведомлены

**3. UI обновляется:**
- Желтый блок с выбранным ресурсом
- Ресурс подсвечен в списке

**4. История доступна:**
```typescript
manager.getHistory()  
// [
//   { id: 'notification-1730000001-2', level: 'success', message: '🎲 Random...', timestamp: ... },
//   { id: 'notification-1730000000-1', level: 'info', message: 'Loading...', timestamp: ... }
// ]
```

### Если нет ресурсов:

**Warning toast (оранжевый, top-right, 5 сек):**
```
⚠️  No resources available
```

### Можно dismiss:
```typescript
const id = manager.notify({ level: 'info', message: 'Test' })
manager.dismiss(id)  // Скрыть конкретное уведомление
manager.dismissAll() // Скрыть все
```

### Можно подписаться:
```typescript
const unsubscribe = manager.subscribe((notification) => {
  console.log('New notification:', notification)
})
// Позже:
unsubscribe()
```

---

## 🔮 Уже реализовано в базовом варианте

✅ **Notification History** - getHistory(), clearHistory()  
✅ **Event System** - subscribe/unsubscribe  
✅ **Dismiss** - dismiss(id), dismissAll()  
✅ **ID возврат** - notify() возвращает ID  
✅ **Observer Pattern** - подписчики уведомляются  

## 🔮 Будущие улучшения

1. **Mode Status Notifications** - sticky notifications для режимов (navigation/editing)
2. **Rich Notifications с Actions** - кнопки действий в уведомлениях
3. **Notification Queue** - приоритеты, ограничение количества одновременных
4. **User Preferences** - настройки позиции, длительности, звука
5. **Offline Support** - очередь при отсутствии соединения
6. **Notification Grouping** - группировка похожих уведомлений
7. **Animation Customization** - кастомные анимации появления/исчезновения

---

## ✅ Критерии готовности

- [x] План создан (полноценный NotificationManager)
- [ ] Этап 1 завершен (Port + Types)
- [ ] Этап 2 завершен (WebNotificationManager + Console)
- [ ] Этап 3 завершен (DI Integration)
- [ ] Этап 4 завершен (ActionContext)
- [ ] Этап 5 завершен (Keymap)
- [ ] Этап 6 завершен (Handler + Helpers)
- [ ] Этап 7 завершен (sonner UI)
- [ ] Этап 8 завершен (Testing: history, subscribe, dismiss)
- [ ] Этап 9 завершен (Documentation)
- [ ] История работает (getHistory())
- [ ] Подписки работают (subscribe/unsubscribe)
- [ ] Dismiss работает (dismiss, dismissAll)
- [ ] ID возвращаются корректно
- [ ] Все тесты проходят
- [ ] Документация обновлена

---

**Статус:** ✅ Готов к началу реализации (полноценный NotificationManager)  
**Тип системы:** NotificationManager с историей, событиями и управлением  
**Архитектура:** Port & Adapter + Event-Driven + Observer Pattern  
**Следующий шаг:** Этап 1 - Создание INotificationManager Port + Notification types  
**Последнее обновление:** 2025-10-26 (обновлен на полноценный Manager)
