# Contracts - Контракты приложения

Полная спецификация типов, интерфейсов и контрактов для Password Manager.

## Файлы контрактов

### 📘 [domain-types.md](./domain-types.md)
**Доменные типы предметной области**

Содержит:
- Resource Aggregate (Resource, SecretField, CustomField)
- Namespace Value Object
- Mode Context (AppMode, ModeContext, NavigationState, EditingState)
- Keymap Context (Keymap, KeyBinding, ActivationRules, FocusableElement)
- Notification Types
- Password Generation Types
- Domain Errors
- Type Guards

---

### 🔌 [system-interfaces.md](./system-interfaces.md)
**Интерфейсы систем и сервисов**

Содержит:
- Repository Interfaces (IResourceRepository, INamespaceRepository)
- Modal System (IModalManager)
- Keymap System (IKeymapRegistry, IKeymapExecutor)
- Focus System (IFocusManager)
- Notification System (INotificationManager)
- Event Bus (IEventBus)
- Use Cases (CreateResource, UpdateResource, etc.)
- HTTP Client (IHttpClient)
- Clipboard Service (IClipboardService)

---

### 🌐 [api-contracts.md](./api-contracts.md)
**REST API контракты**

Содержит:
- Resource Endpoints (CRUD операции)
- Field Endpoints (добавление/обновление/удаление полей)
- Namespace Endpoints
- Password Generation Endpoint
- Request/Response форматы
- Error Codes
- Status Codes
- Rate Limiting
- Pagination

---

### 📡 [events.md](./events.md)
**Domain Events**

Содержит:
- Resource Context Events (ResourceCreated, ResourceUpdated, etc.)
- Mode Context Events (ModeChanged, NavigationModeEntered, etc.)
- Keymap Context Events (KeymapTriggered, KeymapRegistered, etc.)
- Focus Context Events (FocusChanged, FocusableElementRegistered, etc.)
- Notification Context Events (NotificationRaised, NotificationDismissed)
- Application Events
- Event Handlers примеры
- Event Naming Convention

---

### 🛠️ [infrastructure-types.md](./infrastructure-types.md)
**Типы инфраструктурного слоя**

Содержит:
- Configuration (AppConfig, ApiConfig, FeatureFlags)
- API Client Types (ApiResponse, ApiError, RequestOptions)
- Repository Implementation Types (Mock, API, Mappers, Cache)
- Storage Types (LocalStorage, Settings)
- Event Bus Implementation
- Clipboard Service Types
- Encryption Types
- Logger Types
- HTTP Client Implementation
- Mock Data Types
- Performance Monitoring
- DI Container
- Testing Types
- Environment Types

---

## Quick Reference

### Основные Aggregates

```typescript
Resource
├── id: ResourceId
├── namespace: Namespace
├── name: ResourceName
├── secret: SecretField
└── customFields: CustomField[]

ModeContext
├── mode: AppMode
├── route: RouteInfo
└── state: ModeState | null

Keymap
├── id: KeymapId
├── binding: KeyBinding
├── activationRules: ActivationRules
└── action: KeymapAction

Notification
├── id: NotificationId
├── type: NotificationType
└── message: string
```

### Основные системы

```typescript
ModalManager      // Управление режимами
KeymapRegistry    // Реестр кеймапов
KeymapExecutor    // Выполнение кеймапов
FocusManager      // Управление фокусом
NotificationManager // Уведомления
EventBus          // Шина событий
```

### Repository Interfaces

```typescript
IResourceRepository
INamespaceRepository
IPasswordGeneratorService
```

### Domain Events

```typescript
// Resource
ResourceCreated
ResourceUpdated
ResourceDeleted
CustomFieldAdded
CustomFieldUpdated
CustomFieldRemoved

// Mode
ModeChanged
NavigationModeEntered
EditingModeEntered

// Keymap
KeymapTriggered
KeymapRegistered
ActiveKeymapsChanged

// Focus
FocusChanged
FocusableElementRegistered

// Notification
NotificationRaised
NotificationDismissed
```

---

## Соглашения о типах

### Naming Conventions

**Interfaces:**
```typescript
interface I[Name]           // IResourceRepository, IModalManager
```

**Value Objects:**
```typescript
interface [Name]            // Namespace, ResourceName
readonly value: string
```

**Aggregates:**
```typescript
interface [Name]            // Resource, ModeContext
id: [Name]Id
```

**DTOs:**
```typescript
interface [Name]DTO         // ResourceDTO, CustomFieldDTO
```

**Commands:**
```typescript
interface [Verb][Name]Command    // CreateResourceCommand
```

**Queries:**
```typescript
interface [Verb][Name]Query      // ListResourcesQuery
```

**Events:**
```typescript
interface [Aggregate][Action]    // ResourceCreated, ModeChanged
extends DomainEvent
```

**Errors:**
```typescript
interface [Name]Error       // ValidationError, NotFoundError
extends DomainError
```

---

## Type Safety

### Discriminated Unions

```typescript
type AppMode = 'navigation' | 'editing'

type ModeState = NavigationState | EditingState
// Discriminated by 'type' field

type NotificationType = 'success' | 'error' | 'info' | 'warning'

type Result<T, E> = 
  | { success: true; value: T }
  | { success: false; error: E }
// Discriminated by 'success' field
```

### Type Guards

```typescript
function isNavigationMode(mode: AppMode): mode is 'navigation'
function isEditingState(state: ModeState): state is EditingState
function isSuccess<T, E>(result: Result<T, E>): result is { success: true; value: T }
```

### Branded Types

```typescript
type ResourceId = string    // Could be branded: string & { __brand: 'ResourceId' }
type FieldId = string
type KeymapId = string
type NotificationId = string
```

---

## Инварианты

### Resource
- Должен иметь минимум одно поле (secret)
- Namespace не может быть пустым
- Name должно быть уникальным в рамках namespace

### Namespace
- Паттерн: `[a-z0-9_-]+`
- Длина: 2-50 символов
- Только lowercase

### ResourceName
- Длина: 1-100 символов

### FieldLabel
- Длина: 1-50 символов

### Keymap
- ID должен быть уникальным
- KeyBinding должен быть уникальным в активном контексте

---

## Зависимости между слоями

```
Presentation Layer
       ↓ (uses)
Application Layer
       ↓ (uses)
Domain Layer
       ↑ (implements)
Infrastructure Layer
```

**Правило:** Зависимости всегда направлены к Domain Layer.

---

## Примеры использования

### Создание ресурса

```typescript
// Command
const command: CreateResourceCommand = {
  namespace: 'social',
  name: 'facebook',
  secretValue: 'mypassword123',
  customFields: [
    { label: 'email', value: 'user@example.com' }
  ]
}

// Use Case
const result = await createResourceUseCase.execute(command)

// Result handling
if (isSuccess(result)) {
  const resource: Resource = result.value
  // Event: ResourceCreated будет опубликован
} else {
  const error: DomainError = result.error
  // Обработка ошибки
}
```

### Работа с режимами

```typescript
// Вход в режим редактирования
modalManager.enterEditingMode({
  resourceId: '123',
  fieldId: '456',
  originalValue: 'old value',
  isDirty: false
})

// Event: EditingModeEntered будет опубликован

// Получение контекста
const context = modalManager.getContext()
// context.mode === 'editing'
// context.state.type === 'editing'
```

### Регистрация кеймапа

```typescript
const keymap: Keymap = {
  id: 'save-resource',
  name: 'Save Resource',
  binding: { key: 's', ctrl: true },
  description: 'Save changes to resource',
  activationRules: {
    modes: ['editing'],
    routes: ['/resources/:id', '/resources/new']
  },
  action: async (ctx) => {
    await saveResource(ctx.editingContext.resourceId)
  }
}

keymapRegistry.register(keymap)
// Event: KeymapRegistered будет опубликован
```

### Подписка на события

```typescript
eventBus.subscribe<ResourceCreated>('ResourceCreated', (event) => {
  notificationManager.success(
    `Resource "${event.data.name}" created successfully`
  )
})

eventBus.subscribe<ModeChanged>('ModeChanged', (event) => {
  console.log(`Mode changed: ${event.data.from} → ${event.data.to}`)
})
```

---

## Валидация

Все валидации происходят на уровне Domain Layer при создании Value Objects и Entities.

```typescript
// Пример валидации Namespace
class Namespace {
  private constructor(private value: string) {}
  
  static create(value: string): Result<Namespace, ValidationError> {
    if (!/^[a-z0-9_-]+$/.test(value)) {
      return {
        success: false,
        error: new ValidationError('namespace', 'pattern', value)
      }
    }
    
    if (value.length < 2 || value.length > 50) {
      return {
        success: false,
        error: new ValidationError('namespace', 'length', value)
      }
    }
    
    return {
      success: true,
      value: new Namespace(value)
    }
  }
}
```

---

## Заключение

Эти контракты являются **единственным источником правды** для всех типов в приложении.

При реализации:
1. Следуйте этим контрактам строго
2. Не изменяйте сигнатуры без обновления документации
3. Используйте TypeScript для type safety
4. Применяйте Result type для обработки ошибок
5. Публикуйте Domain Events для значимых изменений

**Важно:** Domain Layer не зависит от других слоев. Все зависимости направлены внутрь (к Domain).
