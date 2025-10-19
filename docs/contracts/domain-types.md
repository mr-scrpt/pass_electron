# Domain Types - Доменные типы

Все типы предметной области (Domain Layer).

## Resource Context

### Resource Aggregate

```typescript
/**
 * Ресурс - основная сущность приложения
 * Содержит набор секретов для конкретного сервиса
 */
interface Resource {
  id: ResourceId
  namespace: Namespace
  name: ResourceName
  secret: SecretField          // Обязательное поле
  customFields: CustomField[]  // Дополнительные поля
  createdAt: DateTime
  updatedAt: DateTime
}

type ResourceId = string  // UUID

/**
 * Value Object для имени ресурса
 * Invariants: длина от 1 до 100 символов
 */
interface ResourceName {
  readonly value: string
}

/**
 * Обязательное секретное поле
 * У каждого ресурса ровно одно такое поле
 */
interface SecretField {
  id: FieldId
  label: 'secret'              // Константа
  value: EncryptedValue
  createdAt: DateTime
  updatedAt: DateTime
}

/**
 * Дополнительное кастомное поле
 * Может быть любое количество
 */
interface CustomField {
  id: FieldId
  label: FieldLabel
  value: EncryptedValue
  createdAt: DateTime
  updatedAt: DateTime
}

type FieldId = string  // UUID

/**
 * Value Object для метки поля
 * Invariants: длина от 1 до 50 символов
 */
interface FieldLabel {
  readonly value: string
}

/**
 * Value Object для зашифрованного значения
 */
interface EncryptedValue {
  readonly encryptedData: string
  readonly iv: string  // Initialization Vector
}
```

### Namespace Value Object

```typescript
/**
 * Неймспейс - категория для группировки ресурсов
 * Примеры: social, work, banking
 */
interface Namespace {
  readonly value: string
}

/**
 * Инварианты Namespace:
 * - Соответствует паттерну: [a-z0-9_-]+
 * - Длина от 2 до 50 символов
 * - Только lowercase
 */

/**
 * Информация о неймспейсе для отображения
 */
interface NamespaceInfo {
  name: string
  resourceCount?: number
}
```

### Resource List Item (для списков)

```typescript
/**
 * Упрощенная версия ресурса для списков
 */
interface ResourceListItem {
  id: ResourceId
  namespace: string
  name: string
  secretPreview?: string  // Первые символы + ***
  fieldsCount: number
  updatedAt: DateTime
}
```

---

## Mode Context

### Mode Context Aggregate

```typescript
/**
 * Контекст текущего режима приложения
 */
interface ModeContext {
  mode: AppMode
  route: RouteInfo
  state: ModeState | null
}

/**
 * Режим приложения
 */
type AppMode = 'navigation' | 'editing'

/**
 * Информация о текущем маршруте
 */
interface RouteInfo {
  path: string
  params: Record<string, string>
}

/**
 * Базовый интерфейс для состояния режима
 */
interface ModeState {
  readonly type: AppMode
}

/**
 * Состояние режима навигации
 */
interface NavigationState extends ModeState {
  readonly type: 'navigation'
  focusedElementId: string | null
  scrollPosition: number
}

/**
 * Состояние режима редактирования
 */
interface EditingState extends ModeState {
  readonly type: 'editing'
  resourceId: ResourceId
  fieldId: FieldId
  originalValue: string
  isDirty: boolean
}
```

---

## Keymap Context

### Keymap Aggregate

```typescript
/**
 * Кеймап - привязка клавиш к действию
 */
interface Keymap {
  id: KeymapId
  name: string
  binding: KeyBinding
  description: string
  icon?: string
  activationRules: ActivationRules
  action: KeymapAction
}

type KeymapId = string

/**
 * Привязка клавиш
 */
interface KeyBinding {
  key: string                    // 's', 'enter', 'escape'
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

/**
 * Правила активации кеймапа
 */
interface ActivationRules {
  modes: AppMode[]               // В каких режимах активен
  routes?: string[]              // На каких роутах (undefined = все)
  condition?: ActivationCondition // Дополнительное условие
}

type ActivationCondition = (context: ActionContext) => boolean

/**
 * Контекст для выполнения действия
 */
interface ActionContext {
  mode: AppMode
  route: string
  editingContext?: EditingState
  focusedElement?: FocusableElement
  [key: string]: any
}

type KeymapAction = (context: ActionContext) => void | Promise<void>
```

### Focus System

```typescript
/**
 * Элемент, доступный для фокуса
 */
interface FocusableElement {
  id: string
  order: number                  // Порядок для навигации
  route: string
  mode: AppMode
  
  // Колбэки - мост между системой и UI
  onFocus?: () => void
  onBlur?: () => void
  onEnter?: () => void | Promise<void>
  
  metadata?: FocusableMetadata
}

/**
 * Метаданные элемента
 */
interface FocusableMetadata {
  resourceId?: ResourceId
  fieldId?: FieldId
  type?: FocusableType
}

type FocusableType = 
  | 'resource-item'
  | 'field'
  | 'button'
  | 'input'
  | 'namespace-tag'
```

---

## Notification Context

### Notification Aggregate

```typescript
/**
 * Уведомление пользователю
 */
interface Notification {
  id: NotificationId
  type: NotificationType
  message: string
  duration: number | null        // null = бесконечное
  dismissible: boolean
  createdAt: DateTime
}

type NotificationId = string

type NotificationType = 
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
```

---

## Password Generation

### Password Generation Types

```typescript
/**
 * Опции для генерации пароля
 */
interface PasswordGenerationOptions {
  length: number                 // 8-128
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeAmbiguous: boolean      // Исключить O/0, l/1, etc.
  customCharset?: string
}

/**
 * Сгенерированный пароль
 */
interface GeneratedPassword {
  password: string
  strength: PasswordStrength
}

/**
 * Оценка силы пароля
 */
interface PasswordStrength {
  score: number                  // 0-100
  level: PasswordStrengthLevel
  feedback: string[]
}

type PasswordStrengthLevel = 
  | 'weak'
  | 'fair'
  | 'good'
  | 'strong'
  | 'excellent'
```

---

## Common Value Objects

### DateTime

```typescript
/**
 * Value Object для даты и времени
 * Всегда в формате ISO 8601
 */
type DateTime = string  // ISO 8601: "2024-01-15T10:30:00Z"
```

### Result Type

```typescript
/**
 * Result type для обработки ошибок
 */
type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E }
```

---

## Domain Errors

```typescript
/**
 * Базовая ошибка домена
 */
interface DomainError extends Error {
  readonly code: string
  readonly context?: Record<string, any>
}

/**
 * Ошибка валидации
 */
interface ValidationError extends DomainError {
  readonly code: 'VALIDATION_ERROR'
  readonly field: string
  readonly constraint: string
}

/**
 * Ошибка не найдено
 */
interface NotFoundError extends DomainError {
  readonly code: 'NOT_FOUND'
  readonly entityType: string
  readonly entityId: string
}

/**
 * Ошибка нарушения инварианта
 */
interface InvariantViolationError extends DomainError {
  readonly code: 'INVARIANT_VIOLATION'
  readonly invariant: string
}
```

---

## Type Guards

```typescript
/**
 * Type guard для проверки режима
 */
function isNavigationMode(mode: AppMode): mode is 'navigation' {
  return mode === 'navigation'
}

function isEditingMode(mode: AppMode): mode is 'editing' {
  return mode === 'editing'
}

/**
 * Type guard для проверки состояния
 */
function isNavigationState(state: ModeState): state is NavigationState {
  return state.type === 'navigation'
}

function isEditingState(state: ModeState): state is EditingState {
  return state.type === 'editing'
}

/**
 * Type guard для Result
 */
function isSuccess<T, E>(result: Result<T, E>): result is { success: true; value: T } {
  return result.success === true
}

function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false
}
```

---

## Примечания

### Инварианты

**Resource:**
- Должен иметь минимум одно поле (secret)
- Namespace не может быть пустым
- Name должно быть уникальным в рамках namespace

**Namespace:**
- Только lowercase буквы, цифры, дефис и подчеркивание
- Длина от 2 до 50 символов

**ResourceName:**
- Длина от 1 до 100 символов

**FieldLabel:**
- Длина от 1 до 50 символов

**Keymap:**
- ID должен быть уникальным
- KeyBinding должен быть уникальным в рамках активного контекста

### Immutability

Все Value Objects являются иммутабельными (readonly поля).
Изменение требует создания нового экземпляра.
