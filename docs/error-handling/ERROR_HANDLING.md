# Обработка ошибок (Error Handling)

Ошибки в приложении разделены по архитектурным слоям согласно Clean Architecture и DDD.

> 💡 **Валидация:** Для валидации инвариантов используйте **[Specification Pattern](./SPECIFICATION_VALIDATION.md)** - декларативный подход БЕЗ if-ов!

## 📦 Библиотека @sweet-monads/either

В проекте используется библиотека **[@sweet-monads/either](https://github.com/JSMonk/sweet-monads)** для функциональной обработки ошибок через `Either<E, T>` вместо `throw`/`try-catch`.

### Почему Either вместо throw?

1. **Явность** - тип функции показывает что она может вернуть ошибку
2. **Type Safety** - TypeScript заставляет обработать ошибку
3. **Композиция** - легко комбинировать операции через `chain`, `map`, `mapLeft`
4. **mergeInMany** - накопление ВСЕХ ошибок валидации (уникально!)
5. **mapLeft** - трансформация ошибок между слоями

### Основные типы:

```typescript
import { Either, right, left } from '@sweet-monads/either'

// Either тип
Either<E, T>  // Left(E) | Right(T)
// ⚠️ Порядок: ошибка первая, успех второй!

// Async операции
asyncChain, asyncMap  // встроены в Either
```

### Базовые операции:

```typescript
// Создание
right(value)        // Either<never, T>
left(error)         // Either<E, never>

// Проверка
result.isLeft()     // boolean
result.isRight()    // boolean

// Трансформация
result.map(fn)      // Either<E, U> - трансформация Right
result.mapLeft(fn)  // Either<F, T> - трансформация Left (ошибки)
result.chain(fn)    // Either<E, U> - flatMap

// Извлечение
result.fold(leftFn, rightFn)  // U
// ⚠️ Порядок: (error, success) - ошибка первая!
```

---

## 🎯 Принципы

### 1. **Domain Errors** — доменные ошибки
- Нарушение бизнес-правил (инварианты)
- Часть Ubiquitous Language
- Должны быть понятны бизнесу
- **Место**: 
  - **Общие**: `src/domain/shared/errors/` (Shared Kernel)
  - **Aggregate-specific**: `src/domain/{aggregate}/errors/`

### 2. **Application Errors** — ошибки use case
- Ошибки валидации команд/запросов
- Ошибки координации
- **Место**: `src/application/errors/`

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

### Структура ошибок [#structure:tree]

```
app/
├── domain/                          #structure:
│   ├── shared/                      # Shared Kernel #structure:
│   │   └── errors/                  # ← Общие Domain Errors #structure:
│   │       ├── DomainError.ts       # Базовая доменная ошибка #class:DomainError
│   │       ├── InvariantViolationError.ts  #class:InvariantViolationError
│   │       ├── ValidationError.ts          #class:ValidationError (для спецификаций)
│   │       ├── NotFoundError.ts     #class:NotFoundError
│   │       ├── DuplicateError.ts    #class:DuplicateError
│   │       ├── InvalidOperationError.ts  #class:InvalidOperationError
│   │       └── index.ts
│   └── resource/                   # Resource Aggregate #structure:
│       ├── Resource.ts              #class:Resource
│       ├── ResourceName.ts          #class:ResourceName
│       └── errors/                 # ← Aggregate-specific errors #structure:
│           ├── ResourceLockedError.ts  #class:ResourceLockedError
│           ├── DuplicateFieldLabelError.ts  #class:DuplicateFieldLabelError
│           └── index.ts
├── application/                     #structure:
├── infrastructure/                  #structure:
│   └── errors/                        # ← Infrastructure Errors #structure:
│       ├── NetworkError.ts          #class:NetworkError
│       ├── ApiError.ts              #class:ApiError
│       ├── StorageError.ts          #class:StorageError
│       └── index.ts
└── routes/                            # ← Presentation Errors
    └── components/
        └── ErrorBoundary.tsx
```

---

## 🔴 Domain Errors

### Базовая доменная ошибка

**Файл: `src/domain/shared/errors/DomainError.ts`**

#### DomainError [#class:DomainError|#code|#structure:path]

```typescript
// src/domain/shared/errors/DomainError.ts
/**
 * Базовая ошибка домена
 * Все доменные ошибки наследуются от неё
 */ // #class:DomainError
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

### ValidationError (для спецификаций)

**Файл: `src/shared/errors/ValidationError.ts`**

Это **доменная** ошибка, которая используется внутри **спецификаций** для описания нарушения сложных, композитных бизнес-правил.

```typescript
// src/shared/errors/ValidationError.ts

/**
 * Ошибка валидации, используемая в спецификациях
 */
export class ValidationError extends Error {
  constructor(
    public readonly entityType: string,
    public readonly message: string
  ) {
    super(`${entityType}: ${message}`)
    this.name = 'ValidationError'
  }
}
```

**Отличие от `InvariantViolationError`:**
- `ValidationError` - для сложных композитных правил (спецификаций).
- `InvariantViolationError` - для простых, атомарных инвариантов.

### InvariantViolationError

**Файл: `src/domain/shared/errors/InvariantViolationError.ts`**

#### InvariantViolationError [#class:InvariantViolationError|#code|#structure:path]

```typescript
// src/domain/shared/errors/InvariantViolationError.ts
import { DomainError } from './DomainError'

/**
 * Ошибка нарушения инварианта
 * Используется когда не соблюдено бизнес-правило
 */ // #class:InvariantViolationError
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

### NotFoundError

**Файл: `src/domain/shared/errors/NotFoundError.ts`**

#### NotFoundError [#class:NotFoundError|#code|#structure:path]

```typescript
// src/domain/shared/errors/NotFoundError.ts
import { DomainError } from './DomainError'

/**
 * Ошибка "не найдено"
 * Используется когда агрегат/entity не найден
 */ // #class:NotFoundError
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

#### Repository с NotFoundError [#interface:IResourceRepository|#code]

```typescript
// В Repository
import { Either, right, left } from '@sweet-monads/either'

class MockResourceRepository implements IResourceRepository {
  async findById(id: ResourceId): Promise<Either<NotFoundError, Resource>> {
    const resource = this.data.find(r => r.id === id.getValue())
    
    if (!resource) {
      return left(new NotFoundError('Resource', id.getValue()))
    }
    
    return right(resource)
  }
}
```

### DuplicateError

**Файл: `src/domain/shared/errors/DuplicateError.ts`**

#### DuplicateError [#class:DuplicateError|#code|#structure:path]

```typescript
// src/domain/shared/errors/DuplicateError.ts
import { DomainError } from './DomainError'

/**
 * Ошибка дубликата
 * Используется когда пытаются создать уже существующую сущность
 */ // #class:DuplicateError
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

#### Resource с DuplicateError [#class:Resource|#code]

```typescript
// В Aggregate
import { Either, right, left } from '@sweet-monads/either'

class Resource {
  addCustomField(field: CustomField): Either<DuplicateError, void> {
    const exists = this._customFields.some(
      f => f.label.equals(field.label)
    )
    
    if (exists) {
      return left(new DuplicateError(
        'CustomField',
        'label',
        field.label.getValue()
      ))
    }
    
    this._customFields.push(field)
    return right(undefined)
  }
}
```

### InvalidOperationError

**Файл: `src/domain/shared/errors/InvalidOperationError.ts`**

#### InvalidOperationError [#class:InvalidOperationError|#code|#structure:path]

```typescript
// src/domain/shared/errors/InvalidOperationError.ts
import { DomainError } from './DomainError'

/**
 * Ошибка недопустимой операции
 * Используется когда операция не может быть выполнена в текущем состоянии
 */ // #class:InvalidOperationError
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

#### Resource с InvalidOperationError [#class:Resource|#code]

```typescript
// В Aggregate
import { Either, right, left } from '@sweet-monads/either'

class Resource {
  delete(): Either<InvalidOperationError, void> {
    if (this._isLocked) {
      return left(new InvalidOperationError(
        'Resource',
        'delete',
        'resource is locked'
      ))
    }
    // delete logic
    return right(undefined)
  }
}
```

---

## 🎯 Aggregate-Specific Errors

**Принцип DDD**: Если ошибка специфична для конкретного Aggregate, она **не должна** быть в Shared Kernel.

### ResourceLockedError

**Файл: `src/domain/resource/errors/ResourceLockedError.ts`**

#### ResourceLockedError [#class:ResourceLockedError|#code|#structure:path]

```typescript
// src/domain/resource/errors/ResourceLockedError.ts
import { DomainError } from '@/domain/shared'
import { ResourceId } from '../value-objects/ResourceId'

/**
 * Ошибка заблокированного ресурса
 * Aggregate-specific ошибка для Resource Aggregate
 */ // #class:ResourceLockedError
export class ResourceLockedError extends DomainError {
  readonly code = 'RESOURCE_LOCKED'
  
  constructor(readonly resourceId: ResourceId) {
    super(`Resource ${resourceId.getValue()} is locked and cannot be modified`)
  }
}
```

**Использование:**

#### Resource с Result [#code]

```typescript
import { Either, right, left } from '@sweet-monads/either'
import { ResourceLockedError } from './errors'

// В Resource Aggregate
class Resource {
  rename(name: ResourceName): Either<ResourceLockedError, void> {
    if (this._isLocked) {
      return left(new ResourceLockedError(this._id))
    }
    this._name = name
    return right(undefined)
  }
}
```

### DuplicateFieldLabelError

**Файл: `src/domain/resource/errors/DuplicateFieldLabelError.ts`**

#### DuplicateFieldLabelError [#class:DuplicateFieldLabelError|#code|#structure:path]

```typescript
// src/domain/resource/errors/DuplicateFieldLabelError.ts
import { DomainError } from '@/domain/shared'

/**
 * Ошибка дублирования метки поля
 * Aggregate-specific ошибка для Resource Aggregate
 */ // #class:DuplicateFieldLabelError
export class DuplicateFieldLabelError extends DomainError {
  readonly code = 'DUPLICATE_FIELD_LABEL'
  
  constructor(readonly fieldLabel: string) {
    super(`Field with label "${fieldLabel}" already exists in this resource`)
  }
}
```

### Public API (для aggregate errors)

**Файл: `src/domain/resource/errors/index.ts`**

#### Resource errors index.ts [#code|#structure:path]

```typescript
// src/domain/resource/errors/index.ts
export { ResourceLockedError } from './ResourceLockedError'
export { DuplicateFieldLabelError } from './DuplicateFieldLabelError'
```

---

### Public API (Shared Kernel)

**Файл: `src/domain/shared/errors/index.ts`**

#### Shared errors index.ts [#code|#structure:path]

```typescript
// src/domain/shared/errors/index.ts
export { DomainError } from './DomainError'
export { InvariantViolationError } from './InvariantViolationError'
export { NotFoundError } from './NotFoundError'
export { DuplicateError } from './DuplicateError'
export { InvalidOperationError } from './InvalidOperationError'
```

---


## 🔵 Infrastructure Errors

### NetworkError

**Файл: `src/infrastructure/errors/NetworkError.ts`**

#### NetworkError [#class:NetworkError|#code|#structure:path]

```typescript
// src/infrastructure/errors/NetworkError.ts
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

#### HttpClient с NetworkError [#code]

```typescript
// В API Client
import { left, right } from '@sweet-monads/either'

class HttpClient {
  async fetch<T>(url: string): Promise<Either<NetworkError, T>> {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        return left(new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        ))
      }
      
      const data = await response.json() as T
      return right(data)
    } catch (error) {
      return left(new NetworkError('Failed to fetch', undefined, error))
    }
  }
}
```

### ApiError

**Файл: `src/infrastructure/errors/ApiError.ts`**

#### ApiError [#class:ApiError|#code|#structure:path]

```typescript
// src/infrastructure/errors/ApiError.ts
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

**Файл: `src/infrastructure/errors/StorageError.ts`**

#### StorageError [#class:StorageError|#code|#structure:path]

```typescript
// src/infrastructure/errors/StorageError.ts
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

**Файл: `src/presentation/web/react/src/components/ErrorBoundary.tsx`**

#### ErrorBoundary компонент [#code|#structure:path]

```typescript
// src/presentation/web/react/src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'
import { DomainError } from '@/domain/shared'

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

#### Remix Action [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/resources.new.tsx

import { 
  InvariantViolationError, 
  DuplicateError 
} from '@/domain/shared'
import { ValidationError } from '@/domain/shared/errors'

export async function action({ request }: ActionFunctionArgs) {
  const result = await commands.resources.create(request)
  
  return result.fold(
    // Error case (first!)
    (error) => json({ error: error.message }, { status: 400 }),
    
    // Success case (second!)
    (data) => redirect(`/resources/${data.id}`)
  )
}
```

---

## 🔄 Преобразование ошибок между слоями

### Infrastructure → Domain

#### ApiResourceRepository [#interface:IResourceRepository|#code|#structure:path]

```typescript
// Infrastructure Layer перехватывает технические ошибки
// и может преобразовать их в доменные
// src/infrastructure/repositories/ApiResourceRepository.ts
import { Either, left, right } from '@sweet-monads/either'

class ApiResourceRepository implements IResourceRepository {
  async findById(id: ResourceId): Promise<Either<NotFoundError | NetworkError, Resource>> {
    return this.httpClient
      .get<ResourceDTO>(`/resources/${id.getValue()}`)
      .chain((response) => 
        this.mapper.toDomain(response)
      )
      .mapLeft((error) => {
        // API вернул 404 → NotFoundError (Domain)
        if (error instanceof NetworkError && error.statusCode === 404) {
          return new NotFoundError('Resource', id.getValue())
        }
        
        // Остальные ошибки пробрасываем как есть
        return error
      })
  }
}
```

### Domain → Application

#### CreateResourceCommandHandler [#code|#structure:path]

```typescript
// Application Layer перехватывает Domain ошибки
// и оборачивает в Either
// src/application/commands/handlers/CreateResourceCommandHandler.ts
import { Either, right, merge } from '@sweet-monads/either'

class CreateResourceCommandHandler {
  async handle(
    command: CreateResourceCommand
  ): Promise<Either<DomainError, CommandResult>> {
    // Создаем Value Objects через Result
    const nameResult = ResourceName.create(command.name)
    const namespaceResult = Namespace.create(command.namespace)
    
    // Комбинируем результаты (fail-fast)
    return merge([nameResult, namespaceResult])
      .chain(([name, namespace]) => 
        Resource.create({ name, namespace })
      )
      .asyncChain(async (resource) => {
        // Сохраняем через Repository (тоже возвращает Result)
        return (await this.repository.save(resource))
          .map(() => ({
            success: true,
            data: { id: resource.id.getValue() }
          }))
      })
  }
}
```

---

## 📊 Иерархия ошибок

### Диаграмма иерархии [#diagram:hierarchy]

```
Error (JavaScript)
│
├─ DomainError (Domain Layer) ✅
│  ├─ InvariantViolationError
│  ├─ ValidationError (для спецификаций)
│  ├─ NotFoundError
│  ├─ DuplicateError
│  └─ InvalidOperationError
│
└─ InfrastructureError (Infrastructure Layer) ✅
   ├─ NetworkError
   ├─ ApiError
   └─ StorageError
```

---

## ✅ DO: Правильные практики

### 1. Domain ошибки в Domain Layer

#### Правильное использование [#code|#structure:path]

```typescript
// ✅ ХОРОШО: Domain ошибка в Domain Layer через Result
// src/domain/resource/value-objects/ResourceName.ts
import { Either, right, left } from '@sweet-monads/either'
import { InvariantViolationError } from '@/domain/shared'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value) {
      return left(new InvariantViolationError('ResourceName', 'cannot be empty'))
    }
    return right(new ResourceName(value))
  }
  
  getValue(): string {
    return this.value
  }
}
```

### 2. Ошибки как часть Ubiquitous Language

#### Понятные имена [#code]

```typescript
// ✅ ХОРОШО: понятные имена в Result
return left(new DuplicateError('Resource', 'name', name))
return left(new InvalidOperationError('Resource', 'delete', 'resource is locked'))

// ❌ ПЛОХО: общие имена
return left(new Error('duplicate'))
return left(new Error('cannot delete'))
```

### 3. Преобразование на границах слоев

#### Преобразование ошибок [#code]

```typescript
// ✅ ХОРОШО: Infrastructure ошибка → Domain ошибка через mapLeft
return httpClient.get(url)
  .mapLeft((error) => {
    if (error instanceof NetworkError && error.statusCode === 404) {
      return new NotFoundError('Resource', id)
    }
    return error
  })
```

### 4. Перехват в Application Layer

#### CommandResult [#code]

```typescript
// ✅ ХОРОШО: Domain ошибка → Either
return this.useCase.execute(command)
  .map((result) => ({ success: true, data: result }))
  .mapLeft((error) => ({ success: false, error: error.message }))

// Или с fold для разных типов ошибок
return this.useCase.execute(command).fold(
  (error) => ({ success: false, error: error.message }),
  (result) => ({ success: true, data: result })
)
```

---

## ❌ DON'T: Анти-паттерны

### 1. Infrastructure ошибки в Domain

#### Антипаттерн [#code]

```typescript
// ❌ ПЛОХО: NetworkError в Domain Layer
import { Either, left } from '@sweet-monads/either'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<NetworkError, ResourceName> {
    if (!value) {
      return left(new NetworkError('invalid name'))  // ❌ Не та ошибка!
    }
    return right(new ResourceName(value))
  }
}

// ✅ ХОРОШО: используй правильную ошибку
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value) {
      return left(new InvariantViolationError('ResourceName', 'cannot be empty'))
    }
    return right(new ResourceName(value))
  }
}
```

### 2. Общие Error вместо специализированных

#### Антипаттерн [#code]

```typescript
// ❌ ПЛОХО: общая ошибка
return left(new Error('not found'))

// ✅ ХОРОШО: специализированная
return left(new NotFoundError('Resource', id.getValue()))
```

### 3. Проглатывание ошибок

#### Антипаттерн [#code]

```typescript
// ❌ ПЛОХО: игнорируем ошибку
const result = await repository.save(resource)
if (result.isLeft()) {
  console.log('error', result.value)  // ❌ Молча логируем
  return null  // ❌ Потеряли ошибку!
}

// ✅ ХОРОШО: обрабатываем или пробрасываем
return (await repository.save(resource))
  .fold(
    (error) => {
      if (error instanceof DuplicateError) {
        return { success: false, error: 'Resource already exists' }
      }
      throw error  // Пробрасываем неожиданные ошибки
    },
    () => ({ success: true })
  )
```

---

## 🧪 Тестирование ошибок

### Тесты ResourceName [#code]

```typescript
import { InvariantViolationError } from '@/domain/shared'
import { ResourceName } from '@/domain/resource/value-objects'

describe('ResourceName', () => {
  it('должен вернуть Left для пустой строки', () => {
    const result = ResourceName.create('')
    
    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(InvariantViolationError)
    }
  })
  
  it('ошибка должна содержать правильное сообщение', () => {
    const result = ResourceName.create('')
    
    result.mapLeft((error) => {
      expect(error.message).toBe('ResourceName: cannot be empty')
    })
  })
  
  it('ошибка должна иметь правильный entityType', () => {
    const result = ResourceName.create('')
    
    result.mapLeft((error) => {
      expect(error.entityType).toBe('ResourceName')
      expect(error.invariant).toBe('cannot be empty')
    })
  })
  
  it('должен вернуть Right для валидного значения', () => {
    const result = ResourceName.create('valid-name')
    
    expect(result.isRight()).toBe(true)
    result.map((name) => {
      expect(name.getValue()).toBe('valid-name')
    })
  })
})
```

---

## 📐 Архитектурные правила

### 1. Domain Layer

```
✅ Возвращает Result<T, E> где E:
   - DomainError и его подклассы (InvariantViolationError, NotFoundError, etc.)
   
❌ НЕ может использовать в Either<E, T>:
   - NetworkError, ApiError, StorageError
   - ValidationError, CommandError, QueryError
   
❌ НЕ использует throw/try-catch:
   - Только Either<E, T> для обработки ошибок
```

### 2. Application Layer

```
✅ Возвращает Result<T, E> где E:
   - ValidationError, CommandError, QueryError
   - DomainError (пробрасывает из Domain через andThen/asyncAndThen)
   
✅ Комбинирует Results:
   - combine() для параллельной валидации
   - andThen() для последовательных операций
   
❌ НЕ использует throw для бизнес-логики:
   - throw только для неожиданных системных ошибок
```

### 3. Infrastructure Layer

```
✅ Возвращает ResultAsync<T, E> где E:
   - NetworkError, ApiError, StorageError
   - DomainError (преобразует через mapErr)
   
✅ Преобразует через mapErr:
   - HTTP 404 → NotFoundError (Domain)
   - HTTP 409 → DuplicateError (Domain)
   
✅ Использует ResultAsync.fromPromise:
   - Для обертки Promise-based API (fetch, etc.)
```

---

## 🔗 См. также

- **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Эскалация ошибок: Result Pattern и монады
- **[INVARIANTS.md](./INVARIANTS.md)** — Инварианты и валидация
- **[DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** — Архитектурные слои
- **[PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** — Структура проекта
- **[contracts/domain-types.md](../contracts/domain-types.md)** — Доменные типы

---

**💡 Правило**: Используй `Either<E, T>` из @sweet-monads/either вместо `throw`/`try-catch`. Ошибки должны соответствовать слою, в котором они возникают. Domain ошибки — часть Ubiquitous Language!
