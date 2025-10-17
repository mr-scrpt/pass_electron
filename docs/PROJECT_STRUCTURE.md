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
project/
├── docs/                          # Документация
│   ├── concepts/                  # Концептуальные документы
│   ├── contracts/                 # Типы и контракты
│   ├── GETTING_STARTED.md        # Руководство по началу работы
│   ├── README.md                 # Обзор документации
│   └── PROJECT_STRUCTURE.md      # ← Этот файл
│
├── app/                           # Remix приложение
│   ├── routes/                    # Presentation Layer - Remix routes
│   ├── components/                # Presentation Layer - React компоненты
│   ├── core/                      # Application/Domain Layer - Системы
│   ├── domain/                    # Domain Layer - Бизнес-логика
│   ├── application/               # Application Layer - Use Cases
│   ├── infrastructure/            # Infrastructure Layer - Внешние системы
│   ├── hooks/                     # Presentation Layer - React Hooks
│   ├── types/                     # Типы (re-exports)
│   └── root.tsx                   # Root layout
│
├── electron/                      # Electron main process
├── public/                        # Static assets
├── tests/                         # Тесты
├── package.json
├── tsconfig.json
└── remix.config.js
```

---

## Архитектурные слои

### 1. Domain Layer (`app/domain/`)

**Назначение**: Бизнес-логика, независимая от фреймворков и внешних систем.

```
app/domain/
├── resource/              # Resource Aggregate
│   ├── Resource.ts        # Aggregate Root
│   ├── SecretField.ts     # Entity
│   ├── CustomField.ts     # Entity
│   └── Namespace.ts       # Value Object
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

### 2. Application Layer (`app/application/`)

**Назначение**: Оркестрация бизнес-логики, Use Cases.

```
app/application/
├── use-cases/             # Use Cases
│   ├── CreateResource/
│   │   ├── CreateResourceUseCase.ts
│   │   └── CreateResourceCommand.ts
│   ├── UpdateResource/
│   ├── DeleteResource/
│   └── ListResources/
└── services/              # Application Services
    └── ResourceService.ts
```

**Характеристики**:
- Зависит только от Domain Layer
- Координирует доменные объекты
- Управляет транзакциями
- Обрабатывает команды и запросы

### 3. Core Systems (`app/core/`)

**Назначение**: Основные системы приложения (Modal, Keymap, Focus, Notification).

```
app/core/
├── modal/                 # Система модальности
│   ├── ModalManager.ts    # Domain Service
│   ├── ModalContext.tsx   # React Context
│   ├── types.ts           # Типы
│   └── index.ts           # Public API
├── keymap/                # Система кеймапов
│   ├── KeymapRegistry.ts  # Domain Service
│   ├── KeymapExecutor.ts  # Application Service
│   ├── KeymapContext.tsx  # React Context
│   ├── keymaps/          # Определения кеймапов
│   │   ├── navigation.ts
│   │   ├── editing.ts
│   │   ├── resource.ts
│   │   └── index.ts
│   ├── types.ts
│   └── index.ts           # Public API
├── focus/                 # Система фокуса
│   ├── FocusManager.ts
│   ├── FocusContext.tsx
│   ├── types.ts
│   └── index.ts           # Public API
└── notification/          # Система уведомлений
    ├── NotificationManager.ts
    ├── NotificationContext.tsx
    ├── types.ts
    └── index.ts           # Public API
```

**Характеристики**:
- Каждая система изолирована
- Общаются через Event Bus
- Предоставляют React Context для UI
- Имеют четкий Public API

### 4. Infrastructure Layer (`app/infrastructure/`)

**Назначение**: Реализация интерфейсов Domain Layer, работа с внешними системами.

```
app/infrastructure/
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
└── clipboard/             # Clipboard Service
    ├── ClipboardService.ts
    └── index.ts
```

**Характеристики**:
- Реализует интерфейсы из Domain Layer
- НЕ содержит бизнес-логику
- Адаптирует внешние системы
- Переключение Mock ↔ Real через конфигурацию

### 5. Presentation Layer (`app/routes/`, `app/components/`)

**Назначение**: UI компоненты и маршрутизация.

```
app/
├── routes/                # Remix routes
│   ├── _index.tsx         # GET /
│   ├── resources.$id.tsx  # GET /resources/:id
│   ├── resources.new.tsx  # GET /resources/new
│   └── generator.tsx      # GET /generator
│
└── components/            # React компоненты
    ├── ResourceList/
    │   ├── ResourceList.tsx
    │   ├── ResourceListItem.tsx
    │   ├── ResourceSearch.tsx
    │   └── index.ts
    ├── ResourceDetail/
    │   ├── ResourceDetail.tsx
    │   ├── FieldEditor.tsx
    │   ├── DynamicFieldList.tsx
    │   └── index.ts
    ├── NamespaceCloud/
    │   ├── NamespaceCloud.tsx
    │   └── index.ts
    ├── PasswordGenerator/
    │   ├── GeneratorForm.tsx
    │   ├── PasswordStrength.tsx
    │   └── index.ts
    ├── KeymapStatusBar/
    │   ├── KeymapStatusBar.tsx
    │   └── index.ts
    └── NotificationToast/
        ├── NotificationToast.tsx
        └── index.ts
```

**Характеристики**:
- НЕ содержит бизнес-логику
- Использует hooks для доступа к системам
- Вызывает Use Cases через команды
- Подписывается на события через Event Bus

### 6. React Hooks (`app/hooks/`)

```
app/hooks/
├── useModal.ts            # Hook для Modal System
├── useKeymap.ts           # Hook для Keymap System
├── useFocus.ts            # Hook для Focus System
├── useFocusable.ts        # Hook для регистрации focusable элементов
├── useNotification.ts     # Hook для Notification System
└── index.ts               # Public API
```

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
│  (use-cases, core systems)          │
└────────────┬────────────────────────┘
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
| **Presentation** | Application, Domain, Core, Infrastructure, Hooks |
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
- Импортировать из Application Use Cases
- Импортировать из Presentation

**Infrastructure Layer НЕ МОЖЕТ**:
- Импортировать из Application
- Импортировать из Presentation
- Содержать бизнес-логику

---

## Public API модулей

Каждый модуль экспортирует свой Public API через `index.ts`.

### Domain Layer

```typescript
// app/domain/index.ts
export * from './resource'
export * from './repositories'
export * from './events'
```

```typescript
// app/domain/resource/index.ts
export { Resource } from './Resource'
export { Namespace } from './Namespace'
export { SecretField } from './SecretField'
export { CustomField } from './CustomField'
export type { ResourceId, FieldId } from './types'
```

### Core Systems

```typescript
// app/core/modal/index.ts
export { ModalManager, modalManager } from './ModalManager'
export { ModalProvider, useModalContext } from './ModalContext'
export type { AppMode, ModeContext, EditingState } from './types'
```

```typescript
// app/core/keymap/index.ts
export { KeymapRegistry, keymapRegistry } from './KeymapRegistry'
export { KeymapExecutor } from './KeymapExecutor'
export { KeymapProvider, useKeymapContext } from './KeymapContext'
export { registerAllKeymaps } from './keymaps'
export type { Keymap, KeyBinding, ActionContext } from './types'
```

```typescript
// app/core/focus/index.ts
export { FocusManager, focusManager } from './FocusManager'
export { FocusProvider, useFocusContext } from './FocusContext'
export type { FocusableElement, FocusableMetadata } from './types'
```

```typescript
// app/core/notification/index.ts
export { NotificationManager, notificationManager } from './NotificationManager'
export { NotificationProvider, useNotificationContext } from './NotificationContext'
export type { Notification, NotificationType } from './types'
```

### Application Layer

```typescript
// app/application/use-cases/index.ts
export { CreateResourceUseCase } from './CreateResource/CreateResourceUseCase'
export { UpdateResourceUseCase } from './UpdateResource/UpdateResourceUseCase'
export { DeleteResourceUseCase } from './DeleteResource/DeleteResourceUseCase'
export { ListResourcesUseCase } from './ListResources/ListResourcesUseCase'
export type { CreateResourceCommand, UpdateResourceCommand } from './types'
```

### Infrastructure Layer

```typescript
// app/infrastructure/index.ts
export * from './api'
export * from './repositories'
export * from './event-bus'
export * from './storage'
export * from './clipboard'
```

```typescript
// app/infrastructure/repositories/index.ts
export { MockResourceRepository } from './MockResourceRepository'
export { ApiResourceRepository } from './ApiResourceRepository'
```

### Components

```typescript
// app/components/ResourceList/index.ts
export { ResourceList } from './ResourceList'
export { ResourceListItem } from './ResourceListItem'
export { ResourceSearch } from './ResourceSearch'
```

### Hooks

```typescript
// app/hooks/index.ts
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
import { ModalManager } from '~/core/modal'
import { KeymapRegistry } from '~/core/keymap'
```

### 2. Core Systems не импортируют друг друга

❌ **НЕ ДЕЛАТЬ ТАК**:
```typescript
// В KeymapExecutor.ts
import { focusManager } from '~/core/focus'  // ❌ Прямой импорт
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

### 3. Presentation → Application через Use Cases

❌ **НЕ ДЕЛАТЬ ТАК**:
```typescript
// В React компоненте
import { resourceRepository } from '~/infrastructure/repositories'

const resource = await resourceRepository.save(data)  // ❌
```

✅ **ДЕЛАТЬ ТАК**:
```typescript
// В React компоненте
import { CreateResourceUseCase } from '~/application/use-cases'

const useCase = new CreateResourceUseCase(resourceRepository)
const result = await useCase.execute(command)  // ✅
```

### 4. Domain Layer изолирован

❌ **НЕ ДЕЛАТЬ ТАК**:
```typescript
// В domain/resource/Resource.ts
import { eventBus } from '~/infrastructure/event-bus'  // ❌
import { apiClient } from '~/infrastructure/api'      // ❌
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
// app/types/domain.ts - Re-export domain types
export type { Resource, Namespace, SecretField } from '~/domain'

// app/types/infrastructure.ts - Re-export infrastructure types
export type { ApiResponse, ApiError } from '~/infrastructure'

// app/types/index.ts - Single entry point
export * from './domain'
export * from './infrastructure'
export * from './api'
```

---

## Примеры правильного использования

### Пример 1: Создание ресурса из UI

```typescript
// app/routes/resources.new.tsx
import { useLoaderData, Form } from '@remix-run/react'
import { useNotification } from '~/hooks'
import { CreateResourceUseCase } from '~/application/use-cases'
import { resourceRepository } from '~/infrastructure/repositories'

export default function NewResource() {
  const { notify } = useNotification()
  
  const handleSubmit = async (data: FormData) => {
    // 1. Создаем Use Case с зависимостями
    const useCase = new CreateResourceUseCase(resourceRepository)
    
    // 2. Выполняем команду
    const result = await useCase.execute({
      namespace: data.get('namespace'),
      name: data.get('name'),
      secretValue: data.get('secret')
    })
    
    // 3. Обрабатываем результат
    if (result.success) {
      notify.success('Resource created')
      // Event Bus автоматически уведомит другие системы
    } else {
      notify.error(result.error.message)
    }
  }
  
  return <Form onSubmit={handleSubmit}>...</Form>
}
```

### Пример 2: Взаимодействие систем через Event Bus

```typescript
// app/core/notification/NotificationManager.ts
import { IEventBus } from '~/domain'

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
// app/core/keymap/keymaps/navigation.ts
import type { Keymap } from '~/core/keymap'

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
// app/components/ResourceList/ResourceList.tsx
import { useModal, useFocus, useKeymap } from '~/hooks'
import { useLoaderData } from '@remix-run/react'

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

### Пример 5: Dependency Injection в root.tsx

```typescript
// app/root.tsx
import { ModalProvider } from '~/core/modal'
import { KeymapProvider } from '~/core/keymap'
import { FocusProvider } from '~/core/focus'
import { NotificationProvider } from '~/core/notification'
import { eventBus } from '~/infrastructure/event-bus'
import { resourceRepository } from '~/infrastructure/repositories'

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
- [Architecture Design](./concepts/ARCHITECTURE_DESIGN.md) - Детальная архитектура
- [System Interfaces](./contracts/system-interfaces.md) - Интерфейсы систем
- [Domain Types](./contracts/domain-types.md) - Доменные типы
