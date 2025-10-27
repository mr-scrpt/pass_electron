# Notification System - Система уведомлений

Документ описывает систему уведомлений, построенную на принципах DDD, Hexagonal Architecture и функционального программирования с использованием монад для обработки ошибок.

## Содержание

1. [Зачем нужна Notification System](#зачем-нужна-notification-system)
2. [DDD и Hexagonal Architecture](#ddd-и-hexagonal-architecture)
3. [Архитектура](#архитектура)
4. [Реализация](#реализация)
5. [Монадический подход к ошибкам](#монадический-подход-к-ошибкам)
6. [Использование](#использование)
7. [Best Practices](#best-practices)

---

## Зачем нужна Notification System

### Проблема без Notification System

#### Антипаттерн [#code|#structure:path]

```typescript
// ❌ ПРОБЛЕМА: Application Layer зависит от UI библиотеки
// src/application/actions/handlers/ShowRandomResourceHandler.ts

import { toast } from 'sonner'  // ❌ Прямая зависимость от UI

export class ShowRandomResourceHandler {
  handle(action: ShowRandomResourceAction): void {
    const resource = this.selectRandom()
    
    // ❌ Application Layer знает о конкретной UI библиотеке
    toast.success(`Random: ${resource.name}`)
  }
}
```

**Что не так:**
- 🚫 Application Layer зависит от Infrastructure (toast библиотека)
- 🚫 Нарушается Dependency Rule (зависимости идут наружу)
- 🚫 Невозможно заменить UI библиотеку без изменения Application Layer
- 🚫 Сложно тестировать (нужна DOM среда)
- 🚫 Невозможно использовать в CLI/Mobile/Desktop без изменений

### Решение: Notification Service

**INotificationService** - это Port (интерфейс), который:
- ✅ Изолирует Application Layer от конкретной UI реализации
- ✅ Предоставляет type-safe контракт для уведомлений
- ✅ Легко тестируется (mock service)
- ✅ Соответствует DDD и Hexagonal Architecture
- ✅ Позволяет менять реализацию без изменения бизнес-логики

---

## DDD и Hexagonal Architecture

### Notification Service в DDD

**Notification** - это технический концерн (Technical Concern), НЕ бизнес-логика.

**Почему Port в Application Layer?**

Согласно Martin Fowler и Eric Evans:
> "Application Layer координирует выполнение доменной логики и внешние концерны, такие как уведомления"

**INotificationService** - это **Application Service** (в терминологии DDD):
- Координирует взаимодействие между Domain и Infrastructure
- Определяет ЧТО нужно (порт), но НЕ КАК (реализация)
- Часть Use Case, но НЕ часть Domain Logic

### Notification Service в Hexagonal Architecture

```
┌─────────────────────────────────────────┐
│  Application Core (Hexagon)             │
│                                         │
│  Port (интерфейс):                      │
│  INotificationService ✅                │
│    - success(message: string): void     │
│    - error(message: string): void       │
│                                         │
│  Use Case:                              │
│  ShowRandomResourceHandler              │
│    - использует INotificationService    │
└──────────────┬──────────────────────────┘
               │ implements
    ┌──────────┴──────────┐
    │                     │
┌───▼──────────┐   ┌──────▼─────────┐
│  Adapter 1   │   │  Adapter 2     │
│  Toast       │   │  Console       │
│  (Web UI)    │   │  (CLI/Test)    │
└──────────────┘   └────────────────┘
```

**Ключевые принципы:**
1. **Port принадлежит Application Core** - определяет контракт
2. **Adapter реализует Port** - конкретная реализация в Infrastructure
3. **Легко заменить Adapter** - без изменения Application Core

---

## Архитектура

### Слои системы

```
┌─────────────────────────────────────────┐
│  Presentation Layer                     │
│  - React Components                     │
│  - Action Handlers                      │
│  - Использует INotificationService      │
└──────────────┬──────────────────────────┘
               │ uses
┌──────────────▼──────────────────────────┐
│  Composition Layer                      │
│  - ServiceContainer                     │
│  - DI: new ToastNotificationService()   │
└──────────────┬──────────────────────────┘
               │ provides
┌──────────────▼──────────────────────────┐
│  Application Layer                      │
│  - INotificationService (Port) ✅       │
│  - ActionContext { notificationService }│
└──────────────┬──────────────────────────┘
               │ implements
┌──────────────▼──────────────────────────┐
│  Infrastructure Layer                   │
│  - ToastNotificationService (Adapter)   │
│  - ConsoleNotificationService (Adapter) │
└─────────────────────────────────────────┘
```

### Поток данных

```
1. ServiceContainer.initialize()
   ↓
2. new ToastNotificationService() → INotificationService
   ↓
3. ActionContext { notificationService: INotificationService }
   ↓
4. Keymap.action(ctx) → ctx.notificationService.info('...')
   ↓
5. ShowRandomResourceHandler(notificationService) → constructor DI
   ↓
6. handler.handle() → notificationService.success('...')
   ↓
7. ToastNotificationService → toast.success('...')
   ↓
8. UI показывает toast
```

---

## Реализация

### 1. Application Layer - INotificationService (Port)

#### Port интерфейс [#interface:INotificationService|#code|#structure:path]

```typescript
// src/application/ports/INotificationService.ts

/**
 * Notification Service Port
 * 
 * Определяет контракт для системы уведомлений.
 * Application Layer НЕ знает о конкретной реализации (Toast, Console, etc.)
 * 
 * @pattern Port & Adapter (Hexagonal Architecture)
 * @layer Application
 */
export interface INotificationService {
  /**
   * Показать success уведомление
   * @param message - Текст сообщения
   * @example notificationService.success('Resource created!')
   */
  success(message: string): void

  /**
   * Показать error уведомление
   * @param message - Текст сообщения об ошибке
   * @example notificationService.error('Failed to save resource')
   */
  error(message: string): void

  /**
   * Показать info уведомление
   * @param message - Информационное сообщение
   * @example notificationService.info('Loading data...')
   */
  info(message: string): void

  /**
   * Показать warning уведомление
   * @param message - Предупреждение
   * @example notificationService.warning('Unsaved changes')
   */
  warning(message: string): void
}
```

**Почему void, а не Result?**

```typescript
// ❌ НЕ ТАК:
success(message: string): Result<void, NotificationError>

// ✅ ТАК:
success(message: string): void
```

**Причины:**
1. **Fire-and-forget** - уведомление не должно блокировать выполнение
2. **Side Effect** - показ уведомления это чистый side-effect
3. **Не критично** - если уведомление не показалось, приложение продолжает работать
4. **Простота** - не нужно обрабатывать Result в каждом месте

---

### 2. Infrastructure Layer - Adapters

#### ToastNotificationService Adapter [#class:ToastNotificationService|#code|#structure:path]

```typescript
// src/infrastructure/notifications/ToastNotificationService.ts

import type { INotificationService } from '@/application/ports'
import { toast } from 'sonner'

/**
 * Toast Notification Service - Adapter для Web UI
 * 
 * Реализует INotificationService через sonner toast library.
 * Используется в production для web приложения.
 * 
 * @pattern Adapter (Hexagonal Architecture)
 * @layer Infrastructure
 */
export class ToastNotificationService implements INotificationService {
  success(message: string): void {
    toast.success(message)
  }

  error(message: string): void {
    toast.error(message)
  }

  info(message: string): void {
    toast.info(message)
  }

  warning(message: string): void {
    toast.warning(message)
  }
}
```

#### ConsoleNotificationService Adapter [#class:ConsoleNotificationService|#code|#structure:path]

```typescript
// src/infrastructure/notifications/ConsoleNotificationService.ts

import type { INotificationService } from '@/application/ports'

/**
 * Console Notification Service - Adapter для Dev/Test
 * 
 * Реализует INotificationService через console.log.
 * Используется для тестирования и разработки.
 * 
 * @pattern Adapter (Hexagonal Architecture)
 * @layer Infrastructure
 */
export class ConsoleNotificationService implements INotificationService {
  success(message: string): void {
    console.log('✅ SUCCESS:', message)
  }

  error(message: string): void {
    console.error('❌ ERROR:', message)
  }

  info(message: string): void {
    console.info('ℹ️  INFO:', message)
  }

  warning(message: string): void {
    console.warn('⚠️  WARNING:', message)
  }
}
```

---

### 3. Composition Layer - ServiceContainer

#### DI интеграция [#class:ServiceContainer|#code|#structure:path]

```typescript
// src/composition/ServiceContainer.ts

import type { INotificationService } from '@/application/ports'
import { ToastNotificationService } from '@/infrastructure/notifications'
import type { IError } from '@/shared/errors'
import { Validation } from '@/shared/validation'

export class ServiceContainer {
  private static notificationService: INotificationService | null = null
  
  static initialize(config: {
    repository: IResourceRepository
    logger: ILogger
  }): void {
    // ... другие сервисы
    
    // Notification Service
    const notificationService = new ToastNotificationService()
    this.notificationService = notificationService
  }
  
  /**
   * Получить Notification Service
   * 
   * @returns Validation монада с INotificationService или ошибкой
   * @example
   * const result = ServiceContainer.getNotificationService()
   * result
   *   .map(service => service.success('Hello!'))
   *   .mapLeft(errors => console.error('Failed to get service:', errors))
   */
  static getNotificationService(): Validation<IError[], INotificationService> {
    return isTrue(
      this.notificationService !== null,
      this.notificationService!
    )
      .valid()
      .invalid([
        new InfrastructureError(
          'ServiceContainer',
          'Container not initialized. Call initialize() first.'
        )
      ])
  }
  
  static reset(): void {
    // ... другие сервисы
    this.notificationService = null
  }
}
```

---

## Монадический подход к ошибкам

### Проблема: Try-Catch Hell

```typescript
// ❌ НЕ ТАК: Императивный подход с try-catch
try {
  const actionBus = ServiceContainer.getActionBus()
  if (!actionBus) throw new Error('ActionBus not initialized')
  
  try {
    const notificationService = ServiceContainer.getNotificationService()
    if (!notificationService) throw new Error('NotificationService not initialized')
    
    // Используем сервисы
    const handler = new ShowRandomResourceHandler(
      resources,
      setRandomResource,
      notificationService
    )
    actionBus.register('ShowRandomResourceAction', handler)
  } catch (error) {
    console.error('Failed to get NotificationService:', error)
  }
} catch (error) {
  console.error('Failed to get ActionBus:', error)
}
```

**Проблемы:**
- 🚫 Вложенные try-catch блоки
- 🚫 Дублирование error handling
- 🚫 Не type-safe (error имеет тип unknown)
- 🚫 Сложно композировать несколько операций

---

### Решение: Validation монада

**Validation** - это монада из функционального программирования для работы с ошибками.

```typescript
// src/shared/validation/Validation.ts

export class Validation<E, T> {
  // Функтор: map трансформирует успешное значение
  map<U>(fn: (value: T) => U): Validation<E, U>
  
  // Монада: chain композирует операции с Validation
  chain<U>(fn: (value: T) => Validation<E, U>): Validation<E, U>
  
  // Трансформация ошибки
  mapLeft<F>(fn: (error: E) => F): Validation<F, T>
  
  // Pattern matching
  fold<U>(onError: (error: E) => U, onSuccess: (value: T) => U): U
}
```

---

### Композиция сервисов через chain

```typescript
// ✅ ТАК: Функциональный подход с Validation монадой
useEffect(() => {
  const actionBusResult = ServiceContainer.getActionBus()
  const notificationResult = ServiceContainer.getNotificationService()
  
  // 🎯 Композиция монад через chain
  const cleanup = actionBusResult
    .chain(actionBus =>
      notificationResult.map(notificationService => ({
        actionBus,
        notificationService
      }))
    )
    .map(({ actionBus, notificationService }) => {
      // ✅ Оба сервиса доступны, типы известны
      const handler = new ShowRandomResourceHandler(
        resources,
        setRandomResource,
        notificationService
      )
      
      actionBus.register('ShowRandomResourceAction', handler)
      
      // Cleanup функция
      return () => {
        actionBus.unregister('ShowRandomResourceAction')
      }
    })
    .mapLeft(errors => {
      // ✅ Одно место для обработки всех ошибок
      console.error('[Home] Failed to get services:', errors)
      return () => {} // noop cleanup
    })
    .value  // Извлекаем значение из монады
  
  return cleanup
}, [resources])
```

**Преимущества монадического подхода:**
- ✅ **Type-safe** - типы известны на каждом шаге
- ✅ **Композиция** - легко комбинировать несколько операций
- ✅ **Одна точка обработки ошибок** - в mapLeft
- ✅ **Декларативный стиль** - читается как pipeline
- ✅ **Railway-oriented programming** - ошибки автоматически "проваливаются" вниз

---

### Альтернатива: ValidationCombinators.combine

Если есть helper для комбинации Validation монад:

```typescript
import { ValidationCombinators } from '@/shared/validation'

// ✅ Еще проще: combine объединяет несколько Validation
const cleanup = ValidationCombinators.combine(
  actionBusResult,
  notificationResult
)
  .map(([actionBus, notificationService]) => {
    // ✅ Tuple с обоими сервисами
    const handler = new ShowRandomResourceHandler(
      resources,
      setRandomResource,
      notificationService
    )
    
    actionBus.register('ShowRandomResourceAction', handler)
    
    return () => {
      actionBus.unregister('ShowRandomResourceAction')
    }
  })
  .mapLeft(errors => {
    console.error('[Home] Failed to get services:', errors)
    return () => {}
  })
  .value
```

---

## Использование

### 1. В Action Handlers (Presentation Layer)

#### Constructor DI [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/home.tsx

import type { IActionHandler } from '@/application/actions'
import { ShowRandomResourceAction } from '@/application/actions'
import type { INotificationService } from '@/application/ports'

class ShowRandomResourceHandler implements IActionHandler<ShowRandomResourceAction> {
  constructor(
    private resources: ResourceListItemDTO[],
    private setRandomResource: (resource: ResourceListItemDTO | null) => void,
    private notificationService: INotificationService  // ✅ Constructor DI
  ) {}
  
  handle(_action: ShowRandomResourceAction): void {
    if (this.resources.length === 0) {
      // ⚠️ Warning если нет ресурсов
      this.notificationService.warning('No resources available')
      return
    }
    
    const randomIndex = Math.floor(Math.random() * this.resources.length)
    const randomResource = this.resources[randomIndex]
    
    this.setRandomResource(randomResource)
    
    // ✅ Success нотификация
    this.notificationService.success(
      `🎲 Random: ${randomResource.namespace}/${randomResource.name}`
    )
  }
}
```

---

### 2. В Keymaps (Application Layer)

#### Context DI [#code|#structure:path]

```typescript
// src/application/services/keymap/keymaps/home.ts

import type { Keymap } from '../types'
import { ShowRandomResourceAction } from '@/application/actions'

export const homeKeymaps: Keymap[] = [
  {
    id: 'show-random-resource',
    name: 'Show Random Resource',
    binding: { key: 'i', ctrl: true },
    action: async (ctx) => {
      // ℹ️ Info нотификация ДО выполнения
      ctx.notificationService?.info('Loading random resource...')
      
      // Dispatch Action
      await ctx.actionBus?.dispatch(
        new ShowRandomResourceAction()
      )
      
      // ✅ Success нотификация будет в Handler
    },
    description: 'Show random resource from list',
    modes: ['navigation'],
    routes: ['/']
  }
]
```

**ActionContext с INotificationService:**

```typescript
// src/application/services/keymap/types.ts

import type { IActionBus } from '@/application/actions'
import type { INotificationService } from '@/application/ports'

export interface ActionContext {
  mode: AppMode
  route: string
  
  // DI через context
  actionBus?: IActionBus
  notificationService?: INotificationService  // ✅
}
```

---

### 3. В Command Handlers (Application Layer)

#### Уведомление об ошибках с Result монадой [#code|#structure:path]

```typescript
// src/application/commands/handlers/CreateResourceHandler.ts

import { ok, err, type Result } from 'neverthrow'
import type { ICommandHandler } from '@/application/commands'
import type { INotificationService } from '@/application/ports'

export class CreateResourceHandler implements ICommandHandler<CreateResourceCommand> {
  constructor(
    private repository: IResourceRepository,
    private notificationService: INotificationService  // ✅ DI
  ) {}
  
  async handle(command: CreateResourceCommand): Promise<Result<void, DomainError>> {
    // Валидация через Domain
    const resourceResult = Resource.create({
      namespace: command.namespace,
      name: command.name
    })
    
    // ✅ Монадический подход: обработка Result через match
    return resourceResult
      .asyncAndThen(async resource => {
        // Сохранение в репозиторий
        await this.repository.save(resource)
        
        // ✅ Success нотификация
        this.notificationService.success(
          `Resource "${resource.getName()}" created successfully`
        )
        
        return ok(undefined)
      })
      .mapErr(error => {
        // ❌ Error нотификация
        this.notificationService.error(
          `Failed to create resource: ${error.message}`
        )
        
        return error
      })
  }
}
```

**Монадический flow:**
```
1. Resource.create() → Result<Resource, DomainError>
   ↓
2. asyncAndThen → сохранение в DB (если Ok)
   ↓
3. notificationService.success() → side effect
   ↓
4. mapErr → обработка ошибки (если Err)
   ↓
5. notificationService.error() → side effect
   ↓
6. return Result<void, DomainError>
```

---

### 4. В Query Handlers (Application Layer)

```typescript
// src/application/queries/handlers/GetResourceByIdHandler.ts

import { ok, err, type Result } from 'neverthrow'
import type { INotificationService } from '@/application/ports'

export class GetResourceByIdHandler {
  constructor(
    private repository: IResourceRepository,
    private notificationService: INotificationService  // ✅ DI
  ) {}
  
  async handle(query: GetResourceByIdQuery): Promise<Result<ResourceDTO, QueryError>> {
    const resourceId = ResourceId.create(query.id)
    
    return resourceId
      .asyncAndThen(async id => {
        const resource = await this.repository.findById(id)
        
        if (!resource) {
          // ⚠️ Warning нотификация
          this.notificationService.warning('Resource not found')
          
          return err(new NotFoundError('Resource', query.id))
        }
        
        return ok(ResourceMapper.toDTO(resource))
      })
      .mapErr(error => {
        // ❌ Error нотификация при валидации ID
        this.notificationService.error(`Invalid resource ID: ${error.message}`)
        
        return new QueryError(error)
      })
  }
}
```

---

## Best Practices

### 1. Используйте монады для композиции

```typescript
// ✅ ХОРОШО: Монадическая композиция
const result = ServiceContainer.getNotificationService()
  .map(service => {
    service.success('Hello!')
    return service
  })
  .mapLeft(errors => {
    console.error('Failed:', errors)
    return null
  })

// ❌ ПЛОХО: Императивный стиль
const service = ServiceContainer.getNotificationService()
if (service.isValid()) {
  const s = service.value
  s.success('Hello!')
} else {
  console.error('Failed:', service.errors)
}
```

---

### 2. INotificationService всегда через DI

```typescript
// ✅ ХОРОШО: DI через constructor
class Handler {
  constructor(
    private notificationService: INotificationService
  ) {}
}

// ❌ ПЛОХО: Прямое создание
class Handler {
  handle() {
    const service = new ToastNotificationService()  // ❌ Нарушение DI
    service.success('...')
  }
}
```

---

### 3. Не используйте Result для notifications

```typescript
// ✅ ХОРОШО: void для fire-and-forget
interface INotificationService {
  success(message: string): void
}

// ❌ ПЛОХО: Result избыточен
interface INotificationService {
  success(message: string): Result<void, NotificationError>
}
```

**Почему:**
- Уведомления - side effects, не критичны для бизнес-логики
- Не нужно обрабатывать ошибки показа уведомлений
- Упрощает API

---

### 4. Нотификации для пользователя, логи для разработчика

```typescript
// ✅ ХОРОШО: Разделение concerns
handle(action: ShowRandomResourceAction): void {
  const resource = this.selectRandom()
  
  // Для пользователя - уведомление
  this.notificationService.success(`Random: ${resource.name}`)
  
  // Для разработчика - логи
  console.log('[Handler] Resource selected:', {
    id: resource.id,
    namespace: resource.namespace,
    name: resource.name
  })
}

// ❌ ПЛОХО: Логи вместо уведомлений
handle(action: ShowRandomResourceAction): void {
  const resource = this.selectRandom()
  console.log('Random resource selected')  // ❌ Пользователь не увидит
}
```

---

### 5. Используйте уведомления в точке взаимодействия с пользователем

```typescript
// ✅ ХОРОШО: Уведомление в Handler (близко к пользователю)
class CreateResourceHandler {
  async handle(command: CreateResourceCommand) {
    return Resource.create(command.data)
      .asyncAndThen(resource => this.repository.save(resource))
      .map(resource => {
        this.notificationService.success('Resource created!')  // ✅ Здесь
        return resource
      })
  }
}

// ❌ ПЛОХО: Уведомление в Domain (слишком глубоко)
class Resource {
  static create(data: ResourceData) {
    // ❌ Domain не должен знать о notifications
    notificationService.info('Creating resource...')
    return ok(new Resource(data))
  }
}
```

---

### 6. Композиция монад для обработки нескольких ошибок

```typescript
// ✅ ХОРОШО: Все ошибки обрабатываются в одном месте
const cleanup = actionBusResult
  .chain(actionBus =>
    notificationResult
      .chain(notificationService =>
        loggerResult.map(logger => ({
          actionBus,
          notificationService,
          logger
        }))
      )
  )
  .map(({ actionBus, notificationService, logger }) => {
    // Все сервисы доступны
  })
  .mapLeft(errors => {
    // ✅ Одна точка обработки всех ошибок
    notificationService?.error('Failed to initialize services')
    console.error('Errors:', errors)
  })
```

---

## Будущие улучшения

### 1. Mode Status Notifications

Для модальной системы (navigation/editing режимы):

```typescript
interface INotificationService {
  // ... существующие методы
  
  // 🆕 Для отображения статуса режима
  showModeStatus(status: ModeStatus): void
  clearModeStatus(): void
}

interface ModeStatus {
  mode: 'navigation' | 'editing'
  route?: string
  message?: string
}
```

**Пример использования:**
```typescript
// При переключении режима
ctx.notificationService?.showModeStatus({
  mode: 'editing',
  route: '/resources/123',
  message: 'Press Esc to exit editing mode'
})
```

---

### 2. Rich Notifications

```typescript
interface NotificationOptions {
  icon?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface INotificationService {
  success(message: string, options?: NotificationOptions): void
  // ...
}
```

**Пример:**
```typescript
notificationService.success('Resource deleted', {
  icon: '🗑️',
  duration: 5000,
  action: {
    label: 'Undo',
    onClick: () => restoreResource()
  }
})
```

---

### 3. Notification History

```typescript
interface INotificationService {
  // ... существующие методы
  
  getHistory(): Notification[]
  clearHistory(): void
}

interface Notification {
  id: string
  level: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: Date
  read: boolean
}
```

---

## Связанные документы

- **[Action Bus Guide](./ACTION_BUS_GUIDE.md)** - интеграция с Action Bus
- **[Command Bus](./COMMAND_BUS.md)** - использование в Command Handlers
- **[Composition Layer](./COMPOSITION_LAYER.md)** - DI через ServiceContainer
- **[Error Handling](./error-handling/ERROR_HANDLING.md)** - обработка ошибок
- **[Error Escalation](./error-handling/ERROR_ESCALATION.md)** - Result монады и neverthrow

---

## Заключение

**Notification System** - это пример правильного применения:
1. **DDD** - технический концерн изолирован через Port
2. **Hexagonal Architecture** - Port & Adapter паттерн
3. **Clean Architecture** - зависимости к центру (Application → Infrastructure)
4. **Functional Programming** - Validation монады для композиции
5. **Dependency Injection** - ServiceContainer управляет зависимостями

Система легко расширяется, тестируется и позволяет менять UI библиотеку без изменения бизнес-логики.
