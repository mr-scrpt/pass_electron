# Архитектурный дизайн Password Manager

## Содержание

1. [Введение](#введение)
2. [Архитектурное видение](#архитектурное-видение)
3. [Клиент-серверное взаимодействие](#клиент-серверное-взаимодействие)
4. [Domain-Driven Design](#domain-driven-design)
5. [Bounded Contexts](#bounded-contexts)
6. [Архитектурные слои](#архитектурные-слои)
7. [Доменная модель](#доменная-модель)
8. [Системы и их взаимодействие](#системы-и-их-взаимодействие)
9. [Архитектурные границы](#архитектурные-границы)
10. [Принципы проектирования](#принципы-проектирования)

---

## Введение

Менеджер паролей — это **клиентское desktop-приложение** на базе Electron + Remix, построенное с применением принципов Domain-Driven Design. Приложение взаимодействует с backend API для получения и сохранения данных.

### Ключевые характеристики

- **Клиент-серверная архитектура**: данные получаются через REST API
- **Модальное взаимодействие**: режимы навигации и редактирования
- **Keyboard-first UX**: полное управление с клавиатуры
- **Контекстно-зависимое поведение**: адаптивные горячие клавиши
- **Строгие архитектурные границы**: изолированные модули с явными контрактами
- **Моковые данные для разработки**: возможность работать без реального backend

### Цели архитектуры

1. **Изолированность** — модули не зависят напрямую друг от друга
2. **Тестируемость** — каждый модуль тестируется независимо
3. **Расширяемость** — добавление функций без изменения существующего кода
4. **Понятность** — четкое разделение ответственности

---

## Архитектурное видение

### Общая схема

```
┌────────────────────────────────────────────────────────┐
│                  Presentation Layer                     │
│             (UI Components, Remix Routes)               │
│                                                          │
│  ResourceViews • GeneratorView • NamespaceCloud         │
└──────────────────────┬───────────────────────────────────┘
                       │ Commands/Queries
┌──────────────────────┴───────────────────────────────────┐
│                  Application Layer                       │
│            (Use Cases, Orchestration)                    │
│                                                          │
│  UseCases • CommandHandlers • EventHandlers             │
└──────────────────────┬───────────────────────────────────┘
                       │ Domain Operations
┌──────────────────────┴───────────────────────────────────┐
│                    Domain Layer                          │
│         (Business Logic, Entities, Events)               │
│                                                          │
│  Aggregates • Entities • ValueObjects • DomainServices  │
└──────────────────────┬───────────────────────────────────┘
                       │ Adapters
┌──────────────────────┴───────────────────────────────────┐
│               Infrastructure Layer                       │
│        (External Systems, Persistence)                   │
│                                                          │
│  APIClient • LocalStorage • EventBus • Clipboard        │
└──────────────────────────────────────────────────────────┘
```

### Ключевые принципы

- **Dependency Inversion** — зависимости направлены к Domain Layer
- **Event-Driven Communication** — модули общаются через события
- **Single Responsibility** — каждый модуль решает одну задачу
- **Interface Segregation** — узкие, специфичные интерфейсы

---

## Клиент-серверное взаимодействие

### Архитектура взаимодействия

Приложение является **клиентом**, который взаимодействует с backend API:

```
┌──────────────────────────────────────────────────────┐
│           Desktop Client (Electron + Remix)           │
│                                                        │
│  ┌─────────────────────────────────────────────────┐ │
│  │         Application Layer (Use Cases)           │ │
│  └──────────────────┬──────────────────────────────┘ │
│                     │                                 │
│  ┌──────────────────▼──────────────────────────────┐ │
│  │       Domain Layer (Business Logic)            │ │
│  └──────────────────┬──────────────────────────────┘ │
│                     │ Repository Interfaces          │
│  ┌──────────────────▼──────────────────────────────┐ │
│  │    Infrastructure Layer (API Client)           │ │
│  │                                                 │ │
│  │  ┌──────────────┐      ┌──────────────────┐   │ │
│  │  │  Real API    │  OR  │  Mock API        │   │ │
│  │  │  Client      │      │  (Dev Mode)      │   │ │
│  │  └──────────────┘      └──────────────────┘   │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌──────────────────────────────────────────────────────┐
│                   Backend API Server                  │
│                                                        │
│  Endpoints:                                           │
│  - GET    /api/resources                              │
│  - GET    /api/resources/:id                          │
│  - POST   /api/resources                              │
│  - PUT    /api/resources/:id                          │
│  - DELETE /api/resources/:id                          │
│  - GET    /api/namespaces                             │
│  - POST   /api/password/generate                      │
└──────────────────────────────────────────────────────┘
```

### Стратегия работы с данными

#### Для разработки и тестирования

В Infrastructure Layer реализуется два варианта Repository:

1. **MockResourceRepository** — возвращает статические моковые данные
2. **ApiResourceRepository** — делает реальные HTTP запросы к API

Переключение между ними происходит через конфигурацию или environment переменную.

#### API Endpoints (для справки)

```typescript
// Resource Management
GET    /api/resources              → Resource[]       // Список всех ресурсов
GET    /api/resources/:id          → Resource         // Детали ресурса
POST   /api/resources              → Resource         // Создание ресурса
PUT    /api/resources/:id          → Resource         // Обновление ресурса
DELETE /api/resources/:id          → void             // Удаление ресурса
POST   /api/resources/:id/fields   → CustomField      // Добавление поля
PUT    /api/resources/:id/fields/:fieldId → CustomField  // Обновление поля
DELETE /api/resources/:id/fields/:fieldId → void      // Удаление поля

// Namespace Management
GET    /api/namespaces             → Namespace[]      // Список неймспейсов

// Password Generation
POST   /api/password/generate      → GeneratedPassword // Генерация пароля
```

### Repository Pattern

**Domain Layer** определяет интерфейсы:

```typescript
interface IResourceRepository {
  findById(id: ResourceId): Promise<Resource | null>
  findAll(): Promise<Resource[]>
  findByNamespace(namespace: Namespace): Promise<Resource[]>
  save(resource: Resource): Promise<void>
  delete(id: ResourceId): Promise<void>
}

interface INamespaceRepository {
  findAll(): Promise<Namespace[]>
  findByName(name: string): Promise<Namespace | null>
}
```

**Infrastructure Layer** предоставляет реализации:

```typescript
// Для разработки — с моковыми данными
class MockResourceRepository implements IResourceRepository {
  private mockData: Resource[] = [
    // статические данные для разработки
  ]
  
  async findById(id: ResourceId): Promise<Resource | null> {
    return this.mockData.find(r => r.id === id) || null
  }
  
  // остальные методы используют mockData
}

// Для продакшна — с реальным API
class ApiResourceRepository implements IResourceRepository {
  constructor(private apiClient: HttpClient) {}
  
  async findById(id: ResourceId): Promise<Resource | null> {
    const response = await this.apiClient.get(`/api/resources/${id}`)
    return this.mapToResource(response.data)
  }
  
  // остальные методы делают HTTP запросы
}
```

### Моковые данные

**Структура моковых данных** для разработки:

```typescript
// infrastructure/mocks/resources.mock.ts
export const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    namespace: 'social',
    name: 'facebook',
    secret: {
      id: '1-secret',
      label: 'secret',
      value: 'encrypted_value_123',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    customFields: [
      {
        id: '1-field-1',
        label: 'email',
        value: 'encrypted_email@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '1-field-2',
        label: 'username',
        value: 'encrypted_john_doe',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    namespace: 'work',
    name: 'gitlab',
    secret: {
      id: '2-secret',
      label: 'secret',
      value: 'encrypted_value_456',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    },
    customFields: [
      {
        id: '2-field-1',
        label: 'api_token',
        value: 'encrypted_token_xyz',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-10T15:00:00Z'
      }
    ],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-10T15:00:00Z'
  },
  {
    id: '3',
    namespace: 'banking',
    name: 'paypal',
    secret: {
      id: '3-secret',
      label: 'secret',
      value: 'encrypted_value_789',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-10T00:00:00Z'
    },
    customFields: [],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  }
]

export const MOCK_NAMESPACES: Namespace[] = [
  { name: 'social', resourceCount: 3 },
  { name: 'work', resourceCount: 5 },
  { name: 'banking', resourceCount: 2 },
  { name: 'gaming', resourceCount: 1 },
  { name: 'education', resourceCount: 4 }
]
```

### Dependency Injection

Выбор реализации Repository происходит на уровне Application:

```typescript
// app/root.tsx или initialization
const USE_MOCKS = process.env.USE_MOCKS === 'true'

const resourceRepository: IResourceRepository = USE_MOCKS
  ? new MockResourceRepository(MOCK_RESOURCES)
  : new ApiResourceRepository(apiClient)

const namespaceRepository: INamespaceRepository = USE_MOCKS
  ? new MockNamespaceRepository(MOCK_NAMESPACES)
  : new ApiNamespaceRepository(apiClient)
```

### Преимущества подхода

1. **Независимость от backend** — можно разрабатывать UI без готового API
2. **Быстрая разработка** — нет задержек на HTTP запросы
3. **Тестируемость** — легко тестировать с предсказуемыми данными
4. **Гибкость** — легко переключаться между моками и реальным API
5. **Соблюдение контрактов** — моки и API используют одинаковые интерфейсы

---

## Domain-Driven Design

### Ubiquitous Language

**Основные термины предметной области:**

- **Resource** — агрегат, содержащий набор секретов для сервиса
- **Namespace** — категория для группировки ресурсов
- **Secret Field** — обязательное поле с основным паролем
- **Custom Field** — дополнительное поле (email, username)
- **Mode** — состояние приложения (navigation, editing)
- **Keymap** — привязка клавиш к действию с условиями активации
- **Focus** — текущий активный элемент для навигации
- **Notification** — сообщение пользователю

### Domain Events

```typescript
// Resource Context
ResourceCreated, ResourceUpdated, ResourceDeleted
CustomFieldAdded, CustomFieldUpdated, CustomFieldRemoved

// Mode Context
ModeChanged, NavigationModeEntered, EditingModeEntered

// Keymap Context
KeymapTriggered, KeymapRegistered, ActiveKeymapsChanged

// Focus Context
FocusChanged, FocusableElementRegistered

// Notification Context
NotificationRaised, NotificationDismissed
```

---

## Bounded Contexts

### 1. Resource Management Context

**Ответственность**: управление ресурсами и их полями

**Entities:**
- Resource (aggregate root)
- SecretField, CustomField (entities)
- Namespace (value object)

**Use Cases:**
- CreateResource, UpdateResource, DeleteResource
- AddCustomField, UpdateField, RemoveCustomField
- ListResources, SearchResources, GeneratePassword

**Repository Interface:**
```typescript
interface IResourceRepository {
  findById(id: ResourceId): Promise<Resource | null>
  findByNamespace(namespace: Namespace): Promise<Resource[]>
  save(resource: Resource): Promise<void>
  delete(id: ResourceId): Promise<void>
}
```

---

### 2. Interaction Mode Context

**Ответственность**: управление режимами работы приложения

**Entities:**
- ModeContext (aggregate root)
- NavigationState, EditingState (entities)

**Value Objects:**
- AppMode (navigation | editing)
- RouteInfo, EditingMetadata

**Use Cases:**
- EnterNavigationMode, EnterEditingMode
- SwitchMode, GetCurrentMode

**Domain Service:**
```typescript
class ModalManager {
  private mode: AppMode
  private context: ModeContext
  
  enterNavigationMode(): void
  enterEditingMode(metadata: EditingMetadata): void
  getMode(): AppMode
  getContext(): ModeContext
  subscribe(listener: ModeChangeListener): Unsubscribe
}
```

**Invariants:**
- Только один режим активен одновременно
- Переход между режимами сохраняет контекст

---

### 3. Keyboard Navigation Context

**Ответственность**: управление горячими клавишами и навигацией

**Entities:**
- Keymap (aggregate root)
- FocusableElement (entity)

**Value Objects:**
- KeyBinding, ActionContext, ActivationRules

**Use Cases:**
- RegisterKeymap, UnregisterKeymap, ExecuteKeymap
- RegisterFocusable, MoveFocus, FocusNext/Previous

**Domain Services:**
```typescript
class KeymapRegistry {
  register(keymap: Keymap): void
  getActiveKeymaps(context: ActionContext): Keymap[]
  findByBinding(binding: KeyBinding, context: ActionContext): Keymap | null
}

class KeymapExecutor {
  handleKeyDown(event: KeyboardEvent): Promise<void>
  attachToWindow(): Unsubscribe
}

class FocusManager {
  registerFocusable(element: FocusableElement): void
  focusNext(): void
  focusPrevious(): void
  getFocused(): FocusableElement | null
}
```

**Invariants:**
- Keymap ID уникален
- KeyBinding уникален в рамках активного контекста
- Только один элемент может иметь фокус

---

### 4. User Feedback Context

**Ответственность**: уведомления и обратная связь

**Entities:**
- Notification (aggregate root)

**Value Objects:**
- NotificationType (success | error | info | warning)
- NotificationDuration

**Domain Service:**
```typescript
class NotificationManager {
  success(message: string): void
  error(message: string): void
  info(message: string): void
  dismiss(id: NotificationId): void
  getAll(): Notification[]
}
```

---

## Архитектурные слои

### 1. Presentation Layer

**Ответственность**: UI и пользовательский ввод

**Компоненты:**
- React Components
- Remix Routes
- View Models
- Hooks для доступа к системам

**Правила:**
- Не содержит бизнес-логику
- Взаимодействует через Commands/Queries
- Подписывается на Domain Events
- Использует Application Layer

### 2. Application Layer

**Ответственность**: оркестрация бизнес-логики

**Компоненты:**
- Use Case Handlers
- Command/Query Handlers
- Event Handlers
- Application Services

**Правила:**
- Координирует доменные объекты
- Управляет транзакциями
- Обрабатывает cross-cutting concerns

### 3. Domain Layer

**Ответственность**: бизнес-логика предметной области

**Компоненты:**
- Entities, Aggregates, Value Objects
- Domain Services
- Domain Events
- Repository Interfaces

**Правила:**
- Не зависит от других слоев
- Содержит всю бизнес-логику
- Определяет интерфейсы для Infrastructure

### 4. Infrastructure Layer

**Ответственность**: взаимодействие с внешними системами

**Компоненты:**
- API Client, Local Storage
- Repository Implementations
- Event Bus, Logging

**Правила:**
- Реализует интерфейсы Domain Layer
- Не содержит бизнес-логику
- Адаптирует внешние системы

---

## Доменная модель

### Resource Aggregate

```typescript
class Resource {
  constructor(
    private id: ResourceId,
    private namespace: Namespace,
    private name: ResourceName,
    private secret: SecretField,
    private customFields: CustomField[]
  ) {}
  
  // Factory
  static create(namespace: Namespace, name: ResourceName, secretValue: string): Resource
  
  // Commands
  updateName(newName: ResourceName): void
  updateSecret(newValue: string): void
  addCustomField(label: string, value: string): CustomField
  updateCustomField(fieldId: FieldId, newValue: string): void
  removeCustomField(fieldId: FieldId): void
  changeNamespace(newNamespace: Namespace): void
  
  // Queries
  getField(fieldId: FieldId): Field | null
  getAllFields(): Field[]
  
  // Invariants
  private ensureHasSecret(): void
  private ensureUniqueFieldLabel(label: string): void
}

class SecretField {
  constructor(
    private id: FieldId,
    private value: EncryptedValue
  ) {}
  
  readonly label = 'secret' // константа
  
  updateValue(newValue: string): void
}

class CustomField {
  constructor(
    private id: FieldId,
    private label: FieldLabel,
    private value: EncryptedValue
  ) {}
  
  updateLabel(newLabel: string): void
  updateValue(newValue: string): void
}
```

### Value Objects

```typescript
class Namespace {
  private constructor(private value: string) {}
  
  static create(value: string): Namespace {
    // validation: [a-z0-9_-]+, length 2-50
    return new Namespace(value)
  }
  
  equals(other: Namespace): boolean
  toString(): string
}

class EncryptedValue {
  private constructor(
    private encryptedData: string,
    private iv: string
  ) {}
  
  static encrypt(plaintext: string): EncryptedValue
  decrypt(): string
  equals(other: EncryptedValue): boolean
}
```

### ModeContext Aggregate

```typescript
class ModeContext {
  constructor(
    private mode: AppMode,
    private route: RouteInfo,
    private state: NavigationState | EditingState | null
  ) {}
  
  enterNavigationMode(): void {
    this.mode = 'navigation'
    this.state = new NavigationState()
    this.publishEvent(new NavigationModeEntered(this.route))
  }
  
  enterEditingMode(metadata: EditingMetadata): void {
    this.mode = 'editing'
    this.state = new EditingState(metadata)
    this.publishEvent(new EditingModeEntered(metadata))
  }
  
  getMode(): AppMode
  getActiveState(): NavigationState | EditingState
}
```

### Keymap Aggregate

```typescript
class Keymap {
  constructor(
    private id: KeymapId,
    private name: string,
    private binding: KeyBinding,
    private description: string,
    private activationRules: ActivationRules,
    private action: KeymapAction
  ) {}
  
  isActive(context: ActionContext): boolean {
    return this.activationRules.evaluate(context)
  }
  
  async execute(context: ActionContext): Promise<void> {
    await this.action(context)
    this.publishEvent(new KeymapTriggered(this.id, context))
  }
}

class ActivationRules {
  constructor(
    private modes: AppMode[],
    private routes: string[] | null,
    private condition: ((context: ActionContext) => boolean) | null
  ) {}
  
  evaluate(context: ActionContext): boolean {
    if (!this.modes.includes(context.mode)) return false
    if (this.routes && !this.matchesRoute(context.route)) return false
    if (this.condition && !this.condition(context)) return false
    return true
  }
}
```

---

## Системы и их взаимодействие

### Диаграмма взаимодействия

```
┌─────────────────┐      Events      ┌─────────────────┐
│  Modal System   │ ←─────────────→  │  Keymap System  │
└────────┬────────┘                  └────────┬────────┘
         │                                    │
         │ Events                             │ Commands
         │                                    │
         ↓                                    ↓
┌─────────────────┐                  ┌─────────────────┐
│  Focus System   │                  │    Resource     │
└─────────────────┘                  │   Management    │
         ↑                            └─────────────────┘
         │                                    │
         │ Events                             │ Events
         │                                    │
         └────────────────┬───────────────────┘
                          ↓
                  ┌───────────────┐
                  │ Notification  │
                  │    System     │
                  └───────────────┘
```

### 1. Modal System

**Обязанности:**
- Хранение текущего режима (navigation/editing)
- Переключение между режимами
- Уведомление подписчиков об изменении режима
- Хранение метаданных активного режима

**События:**
- `ModeChanged { from, to, context }`
- `NavigationModeEntered { route }`
- `EditingModeEntered { resourceId, fieldId }`

**Зависимости:**
- НЕ зависит от других систем
- Публикует события для других систем

### 2. Keymap System

**Обязанности:**
- Регистрация и хранение кеймапов
- Определение активных кеймапов для контекста
- Обработка нажатий клавиш
- Выполнение соответствующих действий

**События:**
- `KeymapTriggered { keymapId, context }`
- `KeymapRegistered { keymap }`
- `ActiveKeymapsChanged { active }`

**Зависимости:**
- Подписан на `ModeChanged` от Modal System
- Использует Focus System через публичный API
- Триггерит Use Cases из Resource Management

### 3. Focus System

**Обязанности:**
- Регистрация элементов для фокуса
- Перемещение фокуса (next, previous)
- Хранение текущего фокусированного элемента
- Очистка реестра при смене route/mode

**События:**
- `FocusChanged { from, to }`
- `FocusableElementRegistered { element }`

**Зависимости:**
- Подписан на `ModeChanged` для очистки фокуса
- Используется Keymap System

### 4. Notification System

**Обязанности:**
- Создание уведомлений
- Управление очередью уведомлений
- Автоматическое удаление по таймауту

**События:**
- `NotificationRaised { notification }`
- `NotificationDismissed { id }`

**Зависимости:**
- Подписан на все Domain Events
- Отображает результаты операций

### 5. Resource Management System

**Обязанности:**
- CRUD операции с ресурсами
- Валидация данных
- Генерация паролей
- Поиск и фильтрация

**События:**
- `ResourceCreated { resource }`
- `ResourceUpdated { id, changes }`
- `ResourceDeleted { id }`

**Зависимости:**
- Использует API Client для persistence
- Публикует события для Notification System

---

## Архитектурные границы

### Принцип изоляции

Каждая система — автономный модуль с четкими границами:

**Коммуникация через события:**

```typescript
// Modal System публикует
eventBus.publish(new ModeChanged(from, to, context))

// Keymap System подписывается
eventBus.subscribe('ModeChanged', (event) => {
  this.updateActiveKeymaps()
})

// Focus System подписывается
eventBus.subscribe('ModeChanged', (event) => {
  if (event.to === 'editing') {
    this.clearFocus()
  }
})
```

**Коммуникация через публичный API:**

```typescript
// Keymap использует Focus через публичный API
class NavigationKeymap {
  action = () => {
    focusManager.focusNext() // публичный метод
  }
}
```

### Event Bus как интеграционный механизм

```typescript
interface EventBus {
  publish<T extends DomainEvent>(event: T): void
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => void
  ): Unsubscribe
}
```

**Преимущества:**
- Системы не зависят друг от друга напрямую
- Легко добавлять новых подписчиков
- Системы можно тестировать изолированно
- Четкий контракт через типы событий

---

## Принципы проектирования

### SOLID

**Single Responsibility:**
- Каждая система решает одну задачу
- Каждый aggregate управляет одной сущностью

**Open/Closed:**
- Новые кеймапы добавляются без изменения KeymapRegistry
- Новые типы уведомлений добавляются без изменения NotificationManager

**Liskov Substitution:**
- Value Objects взаимозаменяемы
- Repository реализации взаимозаменяемы

**Interface Segregation:**
- Узкие интерфейсы для каждой системы
- Клиенты зависят только от нужных методов

**Dependency Inversion:**
- Зависимости направлены к Domain Layer
- Infrastructure зависит от интерфейсов Domain

### DDD Principles

**Ubiquitous Language:**
- Код использует термины предметной области
- Названия классов соответствуют бизнес-понятиям

**Bounded Contexts:**
- Четкие границы между контекстами
- Каждый контекст имеет свою модель

**Aggregates:**
- Resource — aggregate root
- Инварианты защищены на уровне aggregate

**Domain Events:**
- События описывают что произошло
- Системы реагируют на события

### Расширяемость

**Добавление нового режима:**
1. Расширить `AppMode` type
2. Добавить новый State class
3. Зарегистрировать кеймапы для нового режима
4. Системы автоматически адаптируются

**Добавление нового кеймапа:**
1. Создать Keymap объект
2. Зарегистрировать через KeymapRegistry
3. Никакие другие изменения не нужны

**Добавление новой системы:**
1. Создать Domain Service
2. Подписаться на нужные события
3. Опубликовать свои события
4. Другие системы не затронуты

---

## Заключение

Архитектура построена на принципах:
- **Модульности** — системы изолированы
- **Event-driven** — асинхронная коммуникация
- **DDD** — доменная модель в центре
- **Clean Architecture** — зависимости направлены внутрь

Это обеспечивает:
- Легкость тестирования
- Возможность расширения
- Понятную структуру
- Независимость модулей
