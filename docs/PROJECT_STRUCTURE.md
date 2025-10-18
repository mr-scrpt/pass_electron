# Project Structure - Структура проекта

Детальное описание структуры проекта Password Manager с архитектурными границами и правилами импорта.

## Содержание

1. [Общая структура](#общая-структура)
2. [Архитектурные слои](#архитектурные-слои)
3. [Архитектурные границы](#архитектурные-границы)
4. [Public API модулей](#public-api-модулей)
5. [Правила импорта](#правила-импорта)
6. [Примеры правильного использования](#примеры-правильного-использования)

---

## Общая структура

```
password-manager/
├── package.json                   # Root: общие зависимости для DDD слоев
├── tsconfig.json                  # TypeScript для ВСЕГО проекта
├── pnpm-workspace.yaml           # pnpm workspaces configuration
│
├── docs/                          # Документация
│   ├── concepts/                  # Концептуальные документы
│   ├── contracts/                 # Типы и контракты
│   ├── error-handling/            # Документация по обработке ошибок
│   ├── GETTING_STARTED.md
│   ├── README.md
│   └── PROJECT_STRUCTURE.md      # ← Этот файл
│
├── electron/                      # Electron (packaging layer, вне архитектуры)
│   ├── main.ts
│   └── preload.ts
│
└── src/                           # Application code
    │
    ├── domain/                    # Domain Layer (DDD)
    │   ├── resource/
    │   └── shared/
    │
    ├── application/               # Application Layer (DDD)
    │   ├── queries/
    │   ├── commands/
    │   ├── ports/
    │   └── services/
    │
    ├── infrastructure/            # Infrastructure Layer (DDD)
    │   ├── persistence/
    │   ├── services/
    │   └── event-bus/
    │
    ├── composition/                # Composition Root (DI Container)
    │   ├── ServiceContainer.ts
    │   ├── modules/
    │   ├── queries/               # Query Facades
    │   └── commands/              # Command Facades
    │
    ├── shared/                    # Shared utilities (framework-agnostic)
    │   └── types/
    │
    └── presentation/              # Presentation Layer (DDD)
        │
        └── web/                   # Web presentations
            └── react/             # React Router implementation
                ├── package.json   # Web-specific dependencies
                ├── vite.config.ts # Vite build tool config
                ├── tailwind.config.js
                ├── postcss.config.js
                │
                └── src/           # React Router code
                    ├── routes/
                    ├── components/
                    ├── hooks/
                    ├── styles/
                    ├── root.tsx
                    └── entry.client.tsx
```

---

## Архитектурные слои

### 0. Composition Root (`src/composition/`)

**Назначение**: Единая точка управления зависимостями (DI Container).

```
src/composition/
├── ServiceContainer.ts    # DI Container для всех сервисов
├── modules/
│   └── ResourceModule.ts
├── queries/                # Query Facades
│   └── ResourceQueries.ts
├── commands/               # Command Facades
│   └── ResourceCommands.ts
└── index.ts               # Public API
```

**Характеристики**:
- Знает обо ВСЕХ слоях приложения
- Создает и связывает зависимости
- Не является частью ни одного слоя
- Единственное место где слои пересекаются
- Переключение Mock ↔ Real через конфигурацию

### 1. Domain Layer (`src/domain/`)

**Назначение**: Бизнес-логика, независимая от фреймворков и внешних систем.

```
src/domain/
├── shared/                # Shared Kernel (переиспользуемые компоненты)
│   ├── errors/            # Domain Errors
│   │   ├── DomainError.ts
│   │   ├── InvariantViolationError.ts
│   │   ├── NotFoundError.ts
│   │   ├── DuplicateError.ts
│   │   ├── InvalidOperationError.ts
│   │   └── index.ts
│   ├── invariants/        # Переиспользуемые инварианты
│   │   ├── UuidInvariant.ts
│   │   ├── StringInvariant.ts          # Атомарные операции
│   │   ├── EmailInvariant.ts
│   │   ├── IdentifierInvariant.ts      # Композитные правила
│   │   └── index.ts
│   └── index.ts
├── resource/              # Resource Aggregate
│   ├── Resource.ts        # Aggregate Root
│   ├── SecretField.ts     # Entity
│   ├── CustomField.ts     # Entity
│   ├── ResourceName.ts    # Value Object
│   ├── Namespace.ts       # Value Object
│   ├── errors/            # Aggregate-specific errors
│   │   ├── ResourceLockedError.ts
│   │   ├── DuplicateFieldLabelError.ts
│   │   └── index.ts
│   └── index.ts
├── repositories/          # Repository Interfaces
│   ├── IResourceRepository.ts
│   └── INamespaceRepository.ts
└── events/                # Domain Events
    ├── ResourceCreated.ts
    ├── ResourceUpdated.ts
    └── index.ts
```

**Характеристики**:
- НЕ зависит ни от какого другого слоя
- Определяет интерфейсы для Infrastructure
- Содержит бизнес-инварианты
- Публикует Domain Events
- Содержит Shared Kernel с переиспользуемыми компонентами (errors, invariants)

### 2. Application Layer (`src/application/`)

**Назначение**: Оркестрация бизнес-логики через CQRS (Query/Command Handlers).

```
src/application/
├── queries/               # Queries (CQRS - Read)
│   ├── QueryTypes.ts      # Константы типов Query
│   ├── IQuery.ts          # Базовый интерфейс Query
│   ├── IQueryHandler.ts   # Интерфейс обработчика
│   ├── IQueryBus.ts       # Query Bus интерфейс
│   ├── ListResourcesQuery.ts
│   ├── GetResourceByIdQuery.ts
│   ├── handlers/          # Query Handlers
│   │   ├── ListResourcesQueryHandler.ts
│   │   └── GetResourceByIdQueryHandler.ts
│   ├── dtos/              # Data Transfer Objects для UI
│   │   └── ResourceListItemDTO.ts
│   └── index.ts
├── commands/              # Commands (CQRS - Write)
│   ├── CommandTypes.ts    # Константы типов команд
│   ├── ICommand.ts        # Базовый интерфейс команды
│   ├── ICommandHandler.ts # Интерфейс обработчика
│   ├── ICommandBus.ts     # Command Bus интерфейс
│   ├── CreateResourceCommand.ts
│   ├── UpdateResourceCommand.ts
│   ├── DeleteResourceCommand.ts
│   ├── handlers/
│   │   ├── CreateResourceCommandHandler.ts
│   │   ├── UpdateResourceCommandHandler.ts
│   │   └── DeleteResourceCommandHandler.ts
│   └── index.ts
├── ports/                 # Ports (Hexagonal Architecture)
│   ├── IRequestParser.ts  # Парсинг платформо-специфичных запросов
│   ├── IClipboardService.ts
│   ├── IStorageService.ts
│   └── index.ts
├── errors/                # Application Errors
│   ├── ValidationError.ts
│   ├── CommandError.ts
│   ├── QueryError.ts
│   └── index.ts
└── index.ts               # Public API
```

**Характеристики**:
- Зависит только от Domain Layer
- **Queries** - чтение данных (CQRS - Read)
- **Commands** - запись данных (CQRS - Write)
- **Query/Command Handlers** - содержат бизнес-логику операций
- **Ports** - интерфейсы для адаптеров (Hexagonal Architecture)
- Реализует CQRS (Command Query Responsibility Segregation)
- Предоставляет высокоуровневый API для Presentation Layer через Facades

### 3. Application Services (`src/application/services/`)

**Назначение**: Основные системы приложения (Modal, Keymap, Focus, Notification).

```
src/application/services/
├── modal/                 # Система модальности
│   ├── ModalManager.ts    # Application Service
│   ├── IModalManager.ts   # Interface
│   ├── types.ts           # Типы
│   └── index.ts           # Public API
├── keymap/                # Система кеймапов
│   ├── KeymapRegistry.ts  # Application Service
│   ├── KeymapExecutor.ts  # Application Service
│   ├── IKeymapRegistry.ts # Interface
│   ├── types.ts
│   └── index.ts           # Public API
├── focus/                 # Система фокуса
│   ├── FocusManager.ts
│   ├── IFocusManager.ts
│   ├── types.ts
│   └── index.ts           # Public API
└── notification/          # Система уведомлений
    ├── NotificationManager.ts
    ├── INotificationManager.ts
    ├── types.ts
    └── index.ts           # Public API
```

**Характеристики**:
- Каждая система изолирована
- Общаются через Event Bus
- Имеют четкий Public API
- React Context для UI находится в Presentation Layer

### 4. Infrastructure Layer (`src/infrastructure/`)

**Назначение**: Реализация интерфейсов Domain Layer, работа с внешними системами.

```
src/infrastructure/
├── commands/              # Command Bus (Adapters)
│   ├── InMemoryCommandBus.ts  # Adapter: CommandBus реализация
│   └── index.ts
├── queries/               # Query Bus (Adapters)
│   ├── InMemoryQueryBus.ts    # Adapter: QueryBus реализация
│   └── index.ts
├── api/                   # API Client
│   ├── client.ts          # HTTP Client
│   ├── ResourceApiClient.ts
│   ├── NamespaceApiClient.ts
│   └── index.ts           # Public API
├── repositories/          # Repository Implementations
│   ├── MockResourceRepository.ts
│   ├── ApiResourceRepository.ts
│   └── index.ts
├── mocks/                 # Mock Data
│   ├── resources.mock.ts
│   └── index.ts
├── event-bus/             # Event Bus Implementation
│   ├── EventBus.ts
│   └── index.ts
├── storage/               # Local Storage
│   ├── LocalStorage.ts
│   └── index.ts
├── clipboard/             # Clipboard Service
│   ├── ClipboardService.ts
│   └── index.ts
└── errors/                # Infrastructure Errors
    ├── NetworkError.ts
    ├── ApiError.ts
    ├── StorageError.ts
    └── index.ts
```

**Характеристики**:
- Реализует интерфейсы из Domain Layer
- НЕ содержит бизнес-логику
- Адаптирует внешние системы
- НЕ знает о Application Layer (зависит только от Domain)

### 5. Presentation Layer (`src/presentation/`)

**Назначение**: UI фреймворки и компоненты.

```
src/presentation/
└── web/                   # Web presentations
    └── react/             # React Router implementation
        ├── package.json   # ✅ Web-specific dependencies (react, react-router, vite)
        ├── vite.config.ts # ✅ Vite build tool (ONLY for web)
        ├── tailwind.config.js  # ✅ Tailwind CSS config
        ├── postcss.config.js   # ✅ PostCSS config
        │
        └── src/           # React Router code
            ├── routes/    # React Router file-based routing
            │   ├── _index.tsx         # GET /
            │   ├── resources.$id.tsx  # GET /resources/:id
            │   ├── resources.new.tsx  # GET /resources/new
            │   └── generator.tsx      # GET /generator
            │
            ├── components/   # React components
            │   ├── ResourceList/
            │   │   ├── ResourceList.tsx
            │   │   ├── ResourceListItem.tsx
            │   │   └── index.ts
            │   ├── ResourceDetail/
            │   └── PasswordGenerator/
            │
            ├── hooks/        # React hooks
            │   ├── useModal.ts
            │   ├── useKeymap.ts
            │   ├── useFocus.ts
            │   ├── useNotification.ts
            │   └── index.ts
            │
            ├── styles/       # Global styles
            │   └── tailwind.css
            │
            ├── root.tsx      # React Router root layout
            └── entry.client.tsx  # React Router client entry
```

**Характеристики**:
- ✅ **UI фреймворк изолирован** - все React Router/Vite конфиги здесь
- ✅ **Собственные зависимости** - package.json только для web UI
- ✅ **Build tool здесь** - vite.config.ts рядом с кодом
- ✅ **Легко добавить другие UI** - CLI, Mobile, Next.js, etc.
- НЕ содержит бизнес-логику
- Использует hooks для доступа к Application Services
- Вызывает Queries/Commands через Composition Facades
- Импортирует Domain типы через алиасы (~domain/*)

---

## Архитектурные границы

### Правило зависимостей

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (routes, components, hooks)        │
└────────────┬────────────────────────┘
             ↓ МОЖЕТ использовать
┌────────────┴────────────────────────┐
│      Application Layer              │
│  (query/command handlers)           │
└────────────┴────────────────────────┘
             ↓ МОЖЕТ использовать
┌────────────┴────────────────────────┐
│         Domain Layer                │
│  (entities, value objects, events)  │
└────────────┬────────────────────────┘
             ↑ РЕАЛИЗУЕТ интерфейсы
┌────────────┴────────────────────────┐
│     Infrastructure Layer            │
│  (api, repositories, storage)       │
└─────────────────────────────────────┘
```

**Главный принцип**: Зависимости направлены ТОЛЬКО внутрь (к Domain Layer).

### ✅ Разрешенные зависимости

| Слой | Может импортировать из |
|------|------------------------|
| **Composition Root** | ВСЕ слои (это единственное исключение) |
| **Presentation** | Composition, Application, Domain, Core, Hooks |
| **Application** | Domain |
| **Core Systems** | Domain, Infrastructure (только Event Bus) |
| **Domain** | НИЧЕГО (полностью изолирован) |
| **Infrastructure** | Domain (только интерфейсы) |
| **Hooks** | Core, Application, Domain |

### ❌ Запрещенные зависимости

**Domain Layer НЕ МОЖЕТ**:
- Импортировать из других слоев
- Зависеть от React
- Зависеть от Remix
- Зависеть от HTTP библиотек
- Знать о UI

**Application Layer НЕ МОЖЕТ**:
- Импортировать из Presentation
- Импортировать из Infrastructure (кроме типов)
- Зависеть от React напрямую

**Core Systems НЕ МОГУТ**:
- Импортировать друг друга напрямую
- Импортировать из Application Handlers
- Импортировать из Presentation

**Infrastructure Layer НЕ МОЖЕТ**:
- Импортировать из Application
- Импортировать из Presentation
- Содержать бизнес-логику

---

## Public API модулей

Каждый модуль экспортирует свой Public API через `index.ts`.

### Composition Root

```typescript
// src/composition/index.ts
export { queries } from './queries'  // Facade для Loaders
export { getResourceService, getCommandBus, getQueryBus } from './ServiceContainer'
export { resetContainer } from './ServiceContainer'
```

### Domain Layer

```typescript
// src/domain/index.ts
export * from './shared'
export * from './resource'
export * from './repositories'
export * from './events'
```

```typescript
// src/domain/shared/index.ts
export * from './errors'
export * from './invariants'
```

```typescript
// src/domain/shared/errors/index.ts
export { DomainError } from './DomainError'
export { InvariantViolationError } from './InvariantViolationError'
export { NotFoundError } from './NotFoundError'
export { DuplicateError } from './DuplicateError'
export { InvalidOperationError } from './InvalidOperationError'
```

```typescript
// src/domain/shared/invariants/index.ts
export { UuidInvariant } from './UuidInvariant'
export { StringInvariant } from './StringInvariant'        // Атомарные операции
export { EmailInvariant } from './EmailInvariant'
export { IdentifierInvariant } from './IdentifierInvariant'  // Композитные правила
```

```typescript
// src/domain/resource/index.ts
export { Resource } from './Resource'
export { ResourceName } from './ResourceName'
export { Namespace } from './Namespace'
export { SecretField } from './SecretField'
export { CustomField } from './CustomField'
export * from './errors'
export type { ResourceId, FieldId } from './types'
```

```typescript
// src/domain/resource/errors/index.ts
export { ResourceLockedError } from './ResourceLockedError'
export { DuplicateFieldLabelError } from './DuplicateFieldLabelError'
```

### Core Systems

```typescript
// src/application/services/modal/index.ts
export { ModalManager, modalManager } from './ModalManager'
export { ModalProvider, useModalContext } from './ModalContext'
export type { AppMode, ModeContext, EditingState } from './types'
```

```typescript
// src/application/services/keymap/index.ts
export { KeymapRegistry, keymapRegistry } from './KeymapRegistry'
export { KeymapExecutor } from './KeymapExecutor'
export { KeymapProvider, useKeymapContext } from './KeymapContext'
export { registerAllKeymaps } from './keymaps'
export type { Keymap, KeyBinding, ActionContext } from './types'
```

```typescript
// src/application/services/focus/index.ts
export { FocusManager, focusManager } from './FocusManager'
export { FocusProvider, useFocusContext } from './FocusContext'
export type { FocusableElement, FocusableMetadata } from './types'
```

```typescript
// src/application/services/notification/index.ts
export { NotificationManager, notificationManager } from './NotificationManager'
export { NotificationProvider, useNotificationContext } from './NotificationContext'
export type { Notification, NotificationType } from './types'
```

### Application Layer

```typescript
// src/application/commands/index.ts
export type { ICommand } from './ICommand'
export type { ICommandHandler } from './ICommandHandler'
export type { ICommandBus } from './ICommandBus'
export * from './UICommands'
```

```typescript
// src/application/queries/index.ts
export type { IQuery, IQueryHandler, QueryResult } from './IQueryHandler'
export type { IQueryBus } from './IQueryBus'
export * from './ResourceQueries'
```

```typescript
// app/application/commands/index.ts
export { CommandTypes } from './CommandTypes'
export type { ICommand } from './ICommand'
export type { ICommandHandler } from './ICommandHandler'
export type { ICommandBus } from './ICommandBus'
export { CreateResourceCommand } from './CreateResourceCommand'
export { CreateResourceCommandHandler } from './handlers/CreateResourceCommandHandler'
```

### Infrastructure Layer

```typescript
// src/infrastructure/index.ts
export * from './api'
export * from './repositories'
export * from './commands'
export * from './queries'
export * from './event-bus'
export * from './storage'
export * from './clipboard'
```

```typescript
// src/infrastructure/commands/index.ts
export { InMemoryCommandBus } from './InMemoryCommandBus'
```

```typescript
// src/infrastructure/queries/index.ts
export { InMemoryQueryBus } from './InMemoryQueryBus'
```

```typescript
// src/infrastructure/repositories/index.ts
export { MockResourceRepository } from './MockResourceRepository'
export { ApiResourceRepository } from './ApiResourceRepository'
```

### Components

```typescript
// src/presentation/web/react/src/components/ResourceList/index.ts
export { ResourceList } from './ResourceList'
export { ResourceListItem } from './ResourceListItem'
export { ResourceSearch } from './ResourceSearch'
```

### Hooks

```typescript
// src/presentation/web/react/src/hooks/index.ts
export { useModal } from './useModal'
export { useKeymap } from './useKeymap'
export { useFocus } from './useFocus'
export { useFocusable } from './useFocusable'
export { useNotification } from './useNotification'
```

---

## Правила импорта

### 1. Всегда импортировать через Public API

❌ **НЕ ДЕЛАТЬ ТАК**:
```typescript
import { ModalManager } from '~/core/modal/ModalManager'
import { KeymapRegistry } from '~/core/keymap/KeymapRegistry'
```

✅ **ДЕЛАТЬ ТАК**:
```typescript
import { ModalManager } from '~application/services/modal'
import { KeymapRegistry } from '~application/services/keymap'
```

### 2. Core Systems не импортируют друг друга

❌ **НЕ ДЕЛАТЬ ТАК**:
```typescript
// В KeymapExecutor.ts
import { focusManager } from '~application/services/focus'  // ✖️ Прямой импорт
```

✅ **ДЕЛАТЬ ТАК**:
```typescript
// Keymap действие использует Public API FocusManager
const keymap: Keymap = {
  id: 'nav-down',
  action: () => {
    // FocusManager передается через ActionContext
    // или используется через Event Bus
  }
}
```

### 3. Presentation → Facades (CQRS)

❌ **НЕ ДЕЛАТЬ ТАК**:
```typescript
// В Route Loader
import { MockResourceRepository } from '~infrastructure/repositories'
import { ListResourcesQueryHandler } from '~application/queries/handlers'

export async function loader({ request }) {
  const repository = new MockResourceRepository()  // ✖️ Прямая зависимость
  const handler = new ListResourcesQueryHandler(repository)
  const query = new ListResourcesQuery()
  return handler.handle(query)  // ✖️ Обходим Facade
}
```

✅ **ДЕЛАТЬ ТАК**:
```typescript
// В Route Loader - используем Facade
import { queries } from '~composition'

export async function loader({ request }) {
  return queries.resources.list(request)  // ✅ Одна строка!
}
```

---

## 4. Domain Layer изолирован

❌ **НЕ ДЕЛАТЬ ТАК**:
```typescript
// В domain/resource/Resource.ts
import { eventBus } from '~infrastructure/event-bus'  // ✖️
import { apiClient } from '~infrastructure/api'      // ✖️❌
```

✅ **ДЕЛАТЬ ТАК**:
```typescript
// Domain только определяет интерфейсы
interface IEventBus {
  publish<T>(event: T): void
}

// Infrastructure реализует
class EventBus implements IEventBus { ... }
```

### 5. Типы централизованы

```typescript
// src/shared/types/domain.ts - Re-export domain types
export type { Resource, Namespace, SecretField } from '~domain'

// src/shared/types/infrastructure.ts - Re-export infrastructure types
export type { ApiResponse, ApiError } from '~infrastructure'

// src/shared/types/index.ts - Single entry point
export * from './domain'
export * from './infrastructure'
export * from './api'
```

---

## Примеры правильного использования

### Пример 1: Получение данных через Application Service

```typescript
// src/presentation/web/react/src/routes/_index.tsx
import type { Route } from './+types/_index'
import { useLoaderData } from 'react-router'
import { queries } from '~composition'
import { ResourceList } from '../components/ResourceList'

/**
 * ✅ СЕРВЕРНАЯ ФУНКЦИЯ (НОВЫЙ ПОДХОД - CQRS)
 * Loader выполняется ТОЛЬКО на сервере
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // ✅ Используем Query Facade - одна строка!
  return queries.listResources(request)
}

/**
 * ✅ КЛИЕНТСКИЙ КОМПОНЕНТ (+ SSR)
 * Выполняется на сервере (SSR) и клиенте (hydration)
 */
export default function Index() {
  // Получаем данные из loader
  const { resources } = useLoaderData<typeof loader>()
  
  return <ResourceList resources={resources} />
}
```

### Пример 2: Взаимодействие систем через Event Bus

```typescript
// src/application/services/notification/NotificationManager.ts
import { IEventBus } from '~domain'

export class NotificationManager {
  constructor(private eventBus: IEventBus) {
    // Подписываемся на события других систем
    this.subscribeToEvents()
  }
  
  private subscribeToEvents() {
    // Слушаем события Resource Context
    this.eventBus.subscribe('ResourceCreated', (event) => {
      this.success(`Resource "${event.data.name}" created`)
    })
    
    this.eventBus.subscribe('ResourceDeleted', (event) => {
      this.info(`Resource "${event.data.name}" deleted`)
    })
  }
}
```

### Пример 3: Keymap использует Focus через колбэк

```typescript
// src/application/services/keymap/keymaps/navigation.ts
import type { Keymap } from '../types'

// FocusManager НЕ импортируется напрямую
// Вместо этого используется через ActionContext

export const navigationKeymaps: Keymap[] = [
  {
    id: 'nav-down',
    name: 'Navigate Down',
    binding: { key: 'j' },
    action: (context) => {
      // FocusManager доступен через глобальный singleton
      // который передается в ActionContext при инициализации
      const { focusManager } = context
      focusManager?.focusNext()
    },
    modes: ['navigation']
  }
]
```

### Пример 4: React Component использует hooks

```typescript
// src/presentation/web/react/src/components/ResourceList/ResourceList.tsx
import { useModal, useFocus, useKeymap } from '../hooks'
import { useLoaderData } from 'react-router'

export function ResourceList() {
  const resources = useLoaderData<Resource[]>()
  const { mode } = useModal()
  const { activeKeymaps } = useKeymap()
  
  // Регистрируем элементы для навигации
  useFocus('resource-list', {
    elements: resources.map(r => r.id)
  })
  
  return (
    <div className={mode === 'navigation' ? 'nav-mode' : 'edit-mode'}>
      {resources.map(resource => (
        <ResourceItem key={resource.id} resource={resource} />
      ))}
    </div>
  )
}
```

### Пример 5: Providers в root.tsx

```typescript
// src/presentation/web/react/src/root.tsx
// React Context providers (UI layer)
import { ModalProvider } from './contexts/ModalContext'
import { KeymapProvider } from './contexts/KeymapContext'
import { FocusProvider } from './contexts/FocusContext'
import { NotificationProvider } from './contexts/NotificationContext'

/**
 * ✅ ПРАВИЛЬНО: Презентационный слой использует только Public API систем
 * Providers получают зависимости внутри себя или через Composition Root
 */
export default function App() {
  return (
    <html>
      <body>
        <ModalProvider>
          <KeymapProvider>
            <FocusProvider>
              <NotificationProvider>
                <Outlet />
              </NotificationProvider>
            </FocusProvider>
          </KeymapProvider>
        </ModalProvider>
      </body>
    </html>
  )
}
```

**Примечание**: Если Providers нужны зависимости (например, EventBus), они должны:
- Либо создавать их внутри себя
- Либо получать через Composition Root
- ❌ **НЕ импортировать напрямую из Infrastructure**

---

## Паттерны коммуникации между системами

### 1. Event Bus (асинхронная коммуникация)

Используется для слабой связанности систем.

```typescript
// System A публикует событие
eventBus.publish({
  eventType: 'ResourceCreated',
  data: { ... }
})

// System B подписывается
eventBus.subscribe('ResourceCreated', (event) => {
  // Реагирует на событие
})
```

### 2. Singleton через ActionContext

Используется когда Keymap'ам нужен доступ к системам.

```typescript
// При инициализации KeymapExecutor
const executor = new KeymapExecutor(registry, modalManager, focusManager)

// Keymap получает доступ через context
action: (context) => {
  context.focusManager.focusNext()
}
```

### 3. React Context + Hooks

Используется для доступа из UI компонентов.

```typescript
// Provider в root.tsx
<ModalProvider>
  <App />
</ModalProvider>

// Hook в компоненте
const { mode, enterEditingMode } = useModal()
```

---

## Чек-лист для новых модулей

При добавлении нового модуля:

- [ ] Определить к какому слою он относится
- [ ] Создать `index.ts` с Public API
- [ ] Убедиться, что зависимости направлены внутрь
- [ ] Не импортировать модули того же уровня напрямую
- [ ] Использовать Event Bus для межсистемной коммуникации
- [ ] Документировать Public API
- [ ] Написать unit тесты

---

## См. также

- [Getting Started](./GETTING_STARTED.md) - Руководство по началу работы
- [Error Handling](./error-handling/README.md) - Обработка ошибок, инварианты и Result Pattern
- [Data Flow](./DATA_FLOW.md) - Поток данных и работа с Application Services
- [Command Bus](./COMMAND_BUS.md) - Паттерн Command Bus для UI команд (CQRS - Commands)
- [Query Handlers](./QUERY_HANDLERS.md) - Query Handlers для чтения данных (CQRS - Queries)
- [Architecture Design](./concepts/ARCHITECTURE_DESIGN.md) - Детальная архитектура
- [System Interfaces](./contracts/system-interfaces.md) - Интерфейсы систем
- [Domain Types](./contracts/domain-types.md) - Доменные типы
