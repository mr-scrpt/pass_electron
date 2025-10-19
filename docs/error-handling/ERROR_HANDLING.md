# Обработка ошибок (Error Handling) `#error-handling` `#domain-errors`

Ошибки в приложении разделены по архитектурным слоям согласно Clean Architecture и DDD.

---

## 🎯 Принципы

### 1. **Domain Errors** — доменные ошибки `#domain-errors` `#layer-domain`
- Нарушение бизнес-правил (инварианты)
- Часть Ubiquitous Language
- Должны быть понятны бизнесу
- **Место**: 
  - **Общие**: `src/domain/shared/errors/` #file:domain/shared/errors/ (Shared Kernel)
  - **Aggregate-specific**: `src/domain/{aggregate}/errors/`

### 2. **Application Errors** — ошибки use case `#application-errors` `#layer-application`
- Ошибки валидации команд/запросов
- Ошибки координации
- **Место**: `src/application/errors/` #file:application/errors/

### 3. **Infrastructure Errors** — технические ошибки
- Сетевые ошибки
- Ошибки БД
- Ошибки файловой системы
- **Место**: `app/infrastructure/errors/`

### 4. **Presentation Errors** — UI ошибки
- Ошибки форм
- Ошибки роутинга
- **Место**: `app/routes/` или `app/components/`

---

## 📁 Структура

```
app/
├── domain/
│   ├── shared/                      # Shared Kernel
│   │   └── errors/                  # ← Общие Domain Errors
│   │       ├── DomainError.ts       # Базовая доменная ошибка
│   │       ├── InvariantViolationError.ts
│   │       ├── NotFoundError.ts
│   │       ├── DuplicateError.ts
│   │       ├── InvalidOperationError.ts
│   │       └── index.ts
│   └── resource/                   # Resource Aggregate
│       ├── Resource.ts
│       ├── ResourceName.ts
│       └── errors/                 # ← Aggregate-specific errors
│           ├── ResourceLockedError.ts
│           ├── DuplicateFieldLabelError.ts
│           └── index.ts
├── application/
│   └── errors/                        # ← Application Errors
│       ├── ValidationError.ts
│       ├── CommandError.ts
│       ├── QueryError.ts
│       └── index.ts
├── infrastructure/
│   └── errors/                        # ← Infrastructure Errors
│       ├── NetworkError.ts
│       ├── ApiError.ts
│       ├── StorageError.ts
│       └── index.ts
└── routes/                            # ← Presentation Errors
    └── components/
        └── ErrorBoundary.tsx
```

---

## 🔴 Domain Errors

### Базовая доменная ошибка

**Файл: `src/domain/shared/errors/DomainError.ts`**

```typescript
/**
 * Базовая ошибка домена
 * Все доменные ошибки наследуются от неё
 */
export abstract class DomainError extends Error {
  abstract readonly code: string
  
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    
    // Сохраняем правильный stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
  
  /**
   * Преобразование в JSON для API responses
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      stack: this.stack
    }
  }
}
```

### InvariantViolationError

**Файл: `src/domain/shared/errors/InvariantViolationError.ts`**

```typescript
import { DomainError } from './DomainError'

/**
 * Ошибка нарушения инварианта
 * Используется когда не соблюдено бизнес-правило
 */
export class InvariantViolationError extends DomainError {
  readonly code = 'INVARIANT_VIOLATION'
  
  constructor(
    readonly entityType: string,
    readonly invariant: string
  ) {
    super(`${entityType}: ${invariant}`)
  }
}
```

**Использование:**
```typescript
// В Value Object
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): ResourceName {
    if (!value || value.length < 1) {
      throw new InvariantViolationError(
        'ResourceName',
        'name cannot be empty'
      )
    }
    return new ResourceName(value)
  }
  
  getValue(): string {
    return this.value
  }
}
```

### NotFoundError

**Файл: `src/domain/shared/errors/NotFoundError.ts`**

```typescript
import { DomainError } from './DomainError'

/**
 * Ошибка "не найдено"
 * Используется когда агрегат/entity не найден
 */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND'
  
  constructor(
    readonly entityType: string,
    readonly entityId: string
  ) {
    super(`${entityType} with id ${entityId} not found`)
  }
}
```

**Использование:**
```typescript
// В Repository
class MockResourceRepository implements IResourceRepository {
  async findById(id: ResourceId): Promise<Resource> {
    const resource = this.data.find(r => r.id === id.getValue())
    
    if (!resource) {
      throw new NotFoundError('Resource', id.getValue())
    }
    
    return resource
  }
}
```

### DuplicateError

**Файл: `src/domain/shared/errors/DuplicateError.ts`**

```typescript
import { DomainError } from './DomainError'

/**
 * Ошибка дубликата
 * Используется когда пытаются создать уже существующую сущность
 */
export class DuplicateError extends DomainError {
  readonly code = 'DUPLICATE'
  
  constructor(
    readonly entityType: string,
    readonly field: string,
    readonly value: string
  ) {
    super(`${entityType} with ${field}="${value}" already exists`)
  }
}
```

**Использование:**
```typescript
// В Aggregate
class Resource {
  addCustomField(field: CustomField): void {
    const exists = this._customFields.some(
      f => f.label.equals(field.label)
    )
    
    if (exists) {
      throw new DuplicateError(
        'CustomField',
        'label',
        field.label.getValue()
      )
    }
    
    this._customFields.push(field)
  }
}
```

### InvalidOperationError

**Файл: `src/domain/shared/errors/InvalidOperationError.ts`**

```typescript
import { DomainError } from './DomainError'

/**
 * Ошибка недопустимой операции
 * Используется когда операция не может быть выполнена в текущем состоянии
 */
export class InvalidOperationError extends DomainError {
  readonly code = 'INVALID_OPERATION'
  
  constructor(
    readonly entityType: string,
    readonly operation: string,
    readonly reason: string
  ) {
    super(`Cannot ${operation} ${entityType}: ${reason}`)
  }
}
```

**Использование:**
```typescript
// В Aggregate
class Resource {
  delete(): void {
    if (this._isLocked) {
      throw new InvalidOperationError(
        'Resource',
        'delete',
        'resource is locked'
      )
    }
    
    this.addDomainEvent(new ResourceDeleted(this._id))
  }
}
```

---

## 🎯 Aggregate-Specific Errors

**Принцип DDD**: Если ошибка специфична для конкретного Aggregate, она **не должна** быть в Shared Kernel.

### ResourceLockedError

**Файл: `src/domain/resource/errors/ResourceLockedError.ts`**

```typescript
import { DomainError } from '~domain/shared/errors'
import { ResourceId } from '../types'

/**
 * Ошибка заблокированного ресурса
 * Aggregate-specific ошибка для Resource Aggregate
 */
export class ResourceLockedError extends DomainError {
  readonly code = 'RESOURCE_LOCKED'
  
  constructor(readonly resourceId: ResourceId) {
    super(`Resource ${resourceId.getValue()} is locked and cannot be modified`)
  }
}
```

**Использование:**
```typescript
import { Result, ok, err } from 'neverthrow'
import { ResourceLockedError } from './errors'

// В Resource Aggregate
class Resource {
  rename(name: ResourceName): Result<void, ResourceLockedError> {
    if (this._isLocked) {
      return err(new ResourceLockedError(this._id))
    }
    this._name = name
    return ok(undefined)
  }
}
```

### DuplicateFieldLabelError

**Файл: `src/domain/resource/errors/DuplicateFieldLabelError.ts`**

```typescript
import { DomainError } from '~domain/shared/errors'

/**
 * Ошибка дублирования метки поля
 * Aggregate-specific ошибка для Resource Aggregate
 */
export class DuplicateFieldLabelError extends DomainError {
  readonly code = 'DUPLICATE_FIELD_LABEL'
  
  constructor(readonly fieldLabel: string) {
    super(`Field with label "${fieldLabel}" already exists in this resource`)
  }
}
```

### Public API (для aggregate errors)

**Файл: `src/domain/resource/errors/index.ts`**

```typescript
export { ResourceLockedError } from './ResourceLockedError'
export { DuplicateFieldLabelError } from './DuplicateFieldLabelError'
```

---

### Public API (Shared Kernel)

**Файл: `src/domain/shared/errors/index.ts`**

```typescript
export { DomainError } from './DomainError'
export { InvariantViolationError } from './InvariantViolationError'
export { NotFoundError } from './NotFoundError'
export { DuplicateError } from './DuplicateError'
export { InvalidOperationError } from './InvalidOperationError'
```

---

## 🟡 Application Errors

### ValidationError

**Файл: `src/application/errors/ValidationError.ts`**

```typescript
/**
 * Ошибка валидации на уровне Application Layer
 * Используется для валидации Commands/Queries
 */
export class ValidationError extends Error {
  readonly code = 'VALIDATION_ERROR'
  
  constructor(
    readonly field: string,
    readonly message: string
  ) {
    super(`Validation failed for ${field}: ${message}`)
    this.name = 'ValidationError'
  }
}
```

**Использование:**
```typescript
// В Command Handler
class CreateResourceCommandHandler {
  async handle(command: CreateResourceCommand): Promise<CommandResult> {
    // Валидация входных данных
    if (!command.name || command.name.trim().length === 0) {
      throw new ValidationError('name', 'name is required')
    }
    
    // Domain валидация будет в Value Object
    const name = ResourceName.create(command.name)
    // ...
  }
}
```

### CommandError

**Файл: `src/application/errors/CommandError.ts`**

```typescript
/**
 * Ошибка выполнения команды
 */
export class CommandError extends Error {
  readonly code = 'COMMAND_ERROR'
  
  constructor(
    readonly commandType: string,
    message: string,
    readonly cause?: Error
  ) {
    super(`Command ${commandType} failed: ${message}`)
    this.name = 'CommandError'
  }
}
```

### QueryError

**Файл: `src/application/errors/QueryError.ts`**

```typescript
/**
 * Ошибка выполнения запроса
 */
export class QueryError extends Error {
  readonly code = 'QUERY_ERROR'
  
  constructor(
    readonly queryType: string,
    message: string,
    readonly cause?: Error
  ) {
    super(`Query ${queryType} failed: ${message}`)
    this.name = 'QueryError'
  }
}
```

---

## 🔵 Infrastructure Errors

### NetworkError

**Файл: `app/infrastructure/errors/NetworkError.ts`**

```typescript
/**
 * Сетевая ошибка
 */
export class NetworkError extends Error {
  readonly code = 'NETWORK_ERROR'
  
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly response?: unknown
  ) {
    super(message)
    this.name = 'NetworkError'
  }
}
```

**Использование:**
```typescript
// В API Client
class HttpClient {
  async fetch<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          await response.json()
        )
      }
      
      return response.json()
    } catch (error) {
      if (error instanceof NetworkError) throw error
      
      throw new NetworkError(
        'Failed to fetch',
        undefined,
        error
      )
    }
  }
}
```

### ApiError

**Файл: `app/infrastructure/errors/ApiError.ts`**

```typescript
/**
 * Ошибка API
 */
export class ApiError extends Error {
  readonly code = 'API_ERROR'
  
  constructor(
    readonly endpoint: string,
    message: string,
    readonly statusCode?: number
  ) {
    super(`API error at ${endpoint}: ${message}`)
    this.name = 'ApiError'
  }
}
```

### StorageError

**Файл: `app/infrastructure/errors/StorageError.ts`**

```typescript
/**
 * Ошибка хранилища (LocalStorage, IndexedDB, etc.)
 */
export class StorageError extends Error {
  readonly code = 'STORAGE_ERROR'
  
  constructor(
    readonly operation: 'read' | 'write' | 'delete',
    readonly key: string,
    message: string
  ) {
    super(`Storage ${operation} failed for key "${key}": ${message}`)
    this.name = 'StorageError'
  }
}
```

---

## 🎨 Обработка ошибок в Presentation Layer

### ErrorBoundary

**Файл: `app/components/ErrorBoundary.tsx`**

```typescript
import { Component, ReactNode } from 'react'
import { DomainError } from '~domain/shared/errors'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error
      
      // Domain ошибки показываем пользователю
      if (error instanceof DomainError) {
        return (
          <div className="error-message">
            <h2>Ошибка</h2>
            <p>{error.message}</p>
          </div>
        )
      }
      
      // Технические ошибки — общее сообщение
      return (
        <div className="error-message">
          <h2>Что-то пошло не так</h2>
          <p>Попробуйте перезагрузить страницу</p>
        </div>
      )
    }

    return this.props.children
  }
}
```

### Обработка в Remix Action

```typescript
// app/routes/resources.new.tsx

import { 
  InvariantViolationError, 
  DuplicateError 
} from '~domain/shared/errors'
import { ValidationError } from '~/application/errors'

export async function action({ request }: ActionFunctionArgs) {
  try {
    const result = await commands.resources.create(request)
    
    if (result.success) {
      return redirect(`/resources/${result.data.id}`)
    }
    
    return json({ error: result.error }, { status: 400 })
    
  } catch (error) {
    // Domain ошибки — понятные пользователю
    if (error instanceof InvariantViolationError) {
      return json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    if (error instanceof DuplicateError) {
      return json(
        { error: `Ресурс с таким ${error.field} уже существует` },
        { status: 409 }
      )
    }
    
    // Application ошибки
    if (error instanceof ValidationError) {
      return json(
        { error: error.message, field: error.field },
        { status: 422 }
      )
    }
    
    // Технические ошибки — общее сообщение
    console.error('Unexpected error:', error)
    return json(
      { error: 'Произошла ошибка сервера' },
      { status: 500 }
    )
  }
}
```

---

## 🔄 Преобразование ошибок между слоями

### Infrastructure → Domain

```typescript
// Infrastructure Layer перехватывает технические ошибки
// и может преобразовать их в доменные

class ApiResourceRepository implements IResourceRepository {
  async findById(id: ResourceId): Promise<Resource> {
    try {
      const response = await this.httpClient.get(`/resources/${id.getValue()}`)
      return this.mapper.toDomain(response)
      
    } catch (error) {
      // API вернул 404 → NotFoundError (Domain)
      if (error instanceof ApiError && error.statusCode === 404) {
        throw new NotFoundError('Resource', id.getValue())
      }
      
      // Остальные ошибки пробрасываем как есть
      throw error
    }
  }
}
```

### Domain → Application

```typescript
// Application Layer перехватывает Domain ошибки
// и оборачивает в CommandResult/QueryResult

class CreateResourceCommandHandler {
  async handle(command: CreateResourceCommand): Promise<CommandResult> {
    try {
      const resource = Resource.create({
        name: ResourceName.create(command.name),
        namespace: Namespace.create(command.namespace)
      })
      
      await this.repository.save(resource)
      
      return {
        success: true,
        data: { id: resource.id.getValue() }
      }
      
    } catch (error) {
      // Domain ошибки возвращаем в CommandResult
      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message
        }
      }
      
      // Неожиданные ошибки пробрасываем выше
      throw new CommandError(
        'CreateResourceCommand',
        'Unexpected error',
        error
      )
    }
  }
}
```

---

## 📊 Иерархия ошибок

```
Error (JavaScript)
│
├─ DomainError (Domain Layer) ✅
│  ├─ InvariantViolationError
│  ├─ NotFoundError
│  ├─ DuplicateError
│  └─ InvalidOperationError
│
├─ ApplicationError (Application Layer) ✅
│  ├─ ValidationError
│  ├─ CommandError
│  └─ QueryError
│
└─ InfrastructureError (Infrastructure Layer) ✅
   ├─ NetworkError
   ├─ ApiError
   └─ StorageError
```

---

## ✅ DO: Правильные практики

### 1. Domain ошибки в Domain Layer

```typescript
// ✅ ХОРОШО: Domain ошибка в Domain Layer
// src/domain/value-objects/ResourceName.ts
import { InvariantViolationError } from '~domain/shared/errors'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): ResourceName {
    if (!value) {
      throw new InvariantViolationError('ResourceName', 'cannot be empty')
    }
    return new ResourceName(value)
  }
  
  getValue(): string {
    return this.value
  }
}
```

### 2. Ошибки как часть Ubiquitous Language

```typescript
// ✅ ХОРОШО: понятные имена
throw new DuplicateError('Resource', 'name', name)
throw new InvalidOperationError('Resource', 'delete', 'resource is locked')

// ❌ ПЛОХО: общие имена
throw new Error('duplicate')
throw new Error('cannot delete')
```

### 3. Преобразование на границах слоев

```typescript
// ✅ ХОРОШО: Infrastructure ошибка → Domain ошибка
catch (error) {
  if (error instanceof ApiError && error.statusCode === 404) {
    throw new NotFoundError('Resource', id)
  }
}
```

### 4. Перехват в Application Layer

```typescript
// ✅ ХОРОШО: Domain ошибка → CommandResult
try {
  const result = await this.useCase.execute(command)
  return { success: true, data: result }
} catch (error) {
  if (error instanceof DomainError) {
    return { success: false, error: error.message }
  }
  throw error // неожиданные ошибки пробрасываем
}
```

---

## ❌ DON'T: Анти-паттерны

### 1. Infrastructure ошибки в Domain

```typescript
// ❌ ПЛОХО: NetworkError в Domain Layer
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): ResourceName {
    if (!value) {
      throw new NetworkError('invalid name')  // ❌ Не та ошибка!
    }
    return new ResourceName(value)
  }
}

// ✅ ХОРОШО: используй правильную ошибку
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): ResourceName {
    if (!value) {
      throw new InvariantViolationError('ResourceName', 'cannot be empty')
    }
    return new ResourceName(value)
  }
}
```

### 2. Общие Error вместо специализированных

```typescript
// ❌ ПЛОХО: общая ошибка
throw new Error('not found')

// ✅ ХОРОШО: специализированная
throw new NotFoundError('Resource', id.getValue())
```

### 3. Проглатывание ошибок

```typescript
// ❌ ПЛОХО: игнорируем ошибку
try {
  await repository.save(resource)
} catch (error) {
  console.log('error', error)  // ❌ Молча логируем
  return null
}

// ✅ ХОРОШО: обрабатываем или пробрасываем
try {
  await repository.save(resource)
} catch (error) {
  if (error instanceof DuplicateError) {
    return { success: false, error: 'Ресурс уже существует' }
  }
  throw error  // Неожиданные ошибки пробрасываем
}
```

---

## 🧪 Тестирование ошибок

```typescript
import { InvariantViolationError } from '~domain/shared/errors'
import { ResourceName } from '~domain/value-objects'

describe('ResourceName', () => {
  it('должен выбросить InvariantViolationError для пустой строки', () => {
    expect(() => {
      ResourceName.create('')
    }).toThrow(InvariantViolationError)
  })
  
  it('ошибка должна содержать правильное сообщение', () => {
    expect(() => {
      ResourceName.create('')
    }).toThrow('ResourceName: cannot be empty')
  })
  
  it('ошибка должна иметь правильный entityType', () => {
    try {
      ResourceName.create('')
    } catch (error) {
      expect(error).toBeInstanceOf(InvariantViolationError)
      expect((error as InvariantViolationError).entityType).toBe('ResourceName')
    }
  })
})
```

---

## 📐 Архитектурные правила

### 1. Domain Layer

```
✅ Может выбрасывать:
   - DomainError и его подклассы
   
❌ НЕ может выбрасывать:
   - NetworkError, ApiError, StorageError
   - ValidationError, CommandError, QueryError
```

### 2. Application Layer

```
✅ Может выбрасывать:
   - ValidationError, CommandError, QueryError
   - DomainError (пробрасывает из Domain)
   
❌ НЕ может выбрасывать:
   - NetworkError, ApiError (должен перехватить и обработать)
```

### 3. Infrastructure Layer

```
✅ Может выбрасывать:
   - NetworkError, ApiError, StorageError
   - DomainError (преобразует из технических ошибок)
   
✅ Должен преобразовывать:
   - HTTP 404 → NotFoundError
   - HTTP 409 → DuplicateError
```

---

## 🔗 См. также

- **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Эскалация ошибок: Result Pattern и монады
- **[INVARIANTS.md](./INVARIANTS.md)** — Инварианты и валидация
- **[DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** — Архитектурные слои
- **[PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** — Структура проекта
- **[contracts/domain-types.md](../contracts/domain-types.md)** — Доменные типы

---

**💡 Правило**: Ошибки должны соответствовать слою, в котором они возникают. Domain ошибки — часть Ubiquitous Language!
