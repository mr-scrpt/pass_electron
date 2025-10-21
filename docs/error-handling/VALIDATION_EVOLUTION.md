# Эволюция подхода к валидации и обработке ошибок

Этот документ показывает **полный путь развития** подхода к валидации и обработке ошибок в проекте — от традиционного `try-catch` через монады к Specification Pattern.

---

## 📑 Содержание

1. [Этап 1: Try-Catch Hell](#этап-1-try-catch-hell--проблемный-подход)
2. [Этап 2: Either Pattern (Монады)](#этап-2-either-pattern--монады)
3. [Этап 3: Specification Pattern](#этап-3-specification-pattern--лучший-подход)
4. [Сравнительная таблица](#сравнительная-таблица)
5. [Эскалация ошибок через слои](#эскалация-ошибок-через-слои)
6. [Итоговая рекомендация](#итоговая-рекомендация)

---

## Этап 1: Try-Catch Hell (❌ Проблемный подход)

### Проблема: Валидация + Эскалация через слои

Рассмотрим **полный пример** создания ресурса с эскалацией ошибок через все слои архитектуры.

#### Domain Layer - Value Object [#code]

```typescript
// ❌ ПЛОХО: Try-Catch в Value Object
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): ResourceName {
    // Проблема 1: throw не виден в сигнатуре типа
    if (!value || value.length < 1) {
      throw new Error('Name cannot be empty')
    }
    
    if (value.length > 100) {
      throw new Error('Name too long')
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      throw new Error('Invalid characters')
    }
    
    return new ResourceName(value)
  }
  
  getValue(): string {
    return this.value
  }
}
```

#### Infrastructure Layer - API Client [#code]

```typescript
// ❌ ПЛОХО: throw в Infrastructure
class ApiClient {
  async post(url: string, data: any): Promise<Response> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}`, response.status)
      }
      
      return response
    } catch (error) {
      if (error instanceof NetworkError) throw error
      throw new NetworkError('Connection failed')
    }
  }
}
```

#### Domain Layer - Repository [#code]

```typescript
// ❌ ПЛОХО: instanceof на границе Infrastructure → Domain
class ResourceRepository {
  async save(resource: Resource): Promise<Resource> {
    try {
      const dto = this.mapper.toDTO(resource)
      const response = await this.apiClient.post('/resources', dto)
      return this.mapper.toDomain(response)
    } catch (error) {
      // Проблема 2: instanceof на каждом слое
      if (error instanceof NetworkError) {
        if (error.statusCode === 409) {
          throw new DuplicateError('Resource', resource.getName())
        }
        throw new DomainError('Failed to save resource')
      }
      throw error
    }
  }
}
```

#### Application Layer - Command Handler [#code]

```typescript
// ❌ ПЛОХО: instanceof на границе Domain → Application
class CreateResourceHandler {
  async execute(command: CreateResourceCommand): Promise<ResourceDTO> {
    try {
      // Валидация - может выбросить Error
      const name = ResourceName.create(command.name)
      const namespace = Namespace.create(command.namespace)
      
      // Создание ресурса
      const resource = Resource.create({
        name,
        namespace,
        secret: command.secret
      })
      
      // Сохранение - может выбросить DomainError
      const saved = await this.repository.save(resource)
      
      return this.mapper.toDTO(saved)
    } catch (error) {
      // Проблема 3: instanceof на каждом слое
      if (error instanceof DuplicateError) {
        throw new CommandError(`Resource already exists: ${error.message}`)
      }
      if (error instanceof DomainError) {
        throw new CommandError(`Domain error: ${error.message}`)
      }
      if (error instanceof Error) {
        throw new CommandError(`Validation error: ${error.message}`)
      }
      throw new CommandError('Unknown error')
    }
  }
}
```

#### Presentation Layer - Route Handler [#code]

```typescript
// ❌ ПЛОХО: instanceof на границе Application → Presentation
async function createResourceRoute(request: Request) {
  try {
    const command = await request.json()
    const dto = await handler.execute(command)
    return json(dto, { status: 201 })
  } catch (error) {
    // Проблема 4: instanceof на каждом слое
    if (error instanceof CommandError) {
      return json({ error: error.message }, { status: 400 })
    }
    if (error instanceof NetworkError) {
      return json({ error: 'Service unavailable' }, { status: 503 })
    }
    return json({ error: 'Unknown error' }, { status: 500 })
  }
}
```

### Проблемы Try-Catch подхода

1. ❌ **Ошибки не видны в типах** - `create()` возвращает `ResourceName`, но может выбросить `Error`
2. ❌ **error: unknown** - в `catch` блоке тип ошибки неизвестен
3. ❌ **instanceof на КАЖДОМ слое** - проверка типа ошибки на каждой границе
4. ❌ **Много вложенных try-catch** - 4 уровня вложенности
5. ❌ **Легко забыть обработку** - компилятор не проверяет
6. ❌ **Невозможно собрать ВСЕ ошибки** - валидация останавливается на первой ошибке
7. ❌ **Много boilerplate** - повторяющийся код обработки

---

## Этап 2: Either Pattern (✅ Монады)

### Решение: Either для type-safe обработки + mapLeft для эскалации

Тот же пример, но с монадой `Either` и трансформацией ошибок через `mapLeft`.

#### Domain Layer - Value Object [#code]

```typescript
// ✅ ХОРОШО: Either делает ошибки явными
import { Either, left, right } from '@sweet-monads/either'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  // Теперь ошибка ВИДНА в типе! ⭐
  static create(value: string): Either<InvariantViolationError, ResourceName> {
    if (!value || value.length < 1) {
      return left(new InvariantViolationError('ResourceName', 'cannot be empty'))
    }
    
    if (value.length > 100) {
      return left(new InvariantViolationError('ResourceName', 'too long (max 100)'))
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      return left(new InvariantViolationError('ResourceName', 'invalid characters'))
    }
    
    return right(new ResourceName(value))
  }
  
  getValue(): string {
    return this.value
  }
}
```

#### Infrastructure Layer - API Client [#code]

```typescript
// ✅ ХОРОШО: Either БЕЗ throw
import { Either, left, right } from '@sweet-monads/either'

class ApiClient {
  async post(url: string, data: any): Promise<Either<NetworkError, Response>> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        return left(new NetworkError(`HTTP ${response.status}`, response.status))
      }
      
      return right(response)
    } catch (error) {
      return left(new NetworkError('Connection failed'))
    }
  }
}
```

#### Domain Layer - Repository [#code]

```typescript
// ✅ ХОРОШО: mapLeft трансформирует Infrastructure → Domain
class ResourceRepository implements IResourceRepository {
  save(resource: Resource): Either<DomainError, Resource> {
    const dto = this.mapper.toDTO(resource)
    
    return this.apiClient.post('/resources', dto)
      // mapLeft трансформирует NetworkError → DomainError
      .mapLeft((networkError) => {
        if (networkError.statusCode === 409) {
          return new DuplicateError('Resource', resource.getName())
        }
        return new DomainError('Failed to save resource')
      })
      .chain((response) => this.mapper.toDomain(response))
  }
}
```

#### Application Layer - Command Handler [#code]

```typescript
// ✅ ХОРОШО: chain для композиции + mapLeft для трансформации
class CreateResourceHandler {
  execute(command: CreateResourceCommand): Either<CommandError, ResourceDTO> {
    // Валидация name
    return ResourceName.create(command.name)
      .mapLeft((error) => 
        new CommandError(`Invalid name: ${error.message}`)
      )
      .chain((name) =>
        // Валидация namespace
        Namespace.create(command.namespace)
          .mapLeft((error) => 
            new CommandError(`Invalid namespace: ${error.message}`)
          )
          .map((namespace) => ({ name, namespace }))
      )
      .chain(({ name, namespace }) => {
        // Создание ресурса
        const resource = Resource.create({ name, namespace, secret: command.secret })
        
        // Сохранение
        return this.repository.save(resource)
          .mapLeft((domainError) => 
            new CommandError(`Failed to create resource: ${domainError.message}`)
          )
      })
      .map((resource) => this.mapper.toDTO(resource))
  }
}
```

#### Presentation Layer - Route Handler [#code]

```typescript
// ✅ ХОРОШО: fold обрабатывает Either БЕЗ instanceof
async function createResourceRoute(request: Request) {
  const command = await request.json()
  const result = await handler.execute(command)
  
  // fold обрабатывает Either БЕЗ instanceof!
  return result.fold(
    // Left (ошибка) - TypeScript ЗНАЕТ что это CommandError
    (error) => json({ error: error.message }, { status: 400 }),
    // Right (успех) - TypeScript ЗНАЕТ что это ResourceDTO
    (dto) => json(dto, { status: 201 })
  )
}
```

### Преимущества Either Pattern

- ✅ **Ошибки видны в типах** - `Either<Error, Success>`
- ✅ **Компилятор проверяет** - заставляет обработать ошибку
- ✅ **Type-safe** - нет `unknown`, TypeScript знает типы
- ✅ **НЕТ instanceof** - трансформация через `mapLeft`
- ✅ **НЕТ try-catch** - плоская цепочка `chain`/`map`
- ✅ **Явная эскалация** - видно где ошибка меняет тип
- ✅ **Можно собрать все ошибки** - через `mergeInMany`

### Но остались проблемы

- ⚠️ **Много if-ов** - валидация все еще через `if`
- ⚠️ **Не переиспользуется** - правила валидации дублируются
- ⚠️ **Сложно тестировать** - нужно тестировать весь Value Object

> 📖 См. [ERROR_ESCALATION.md](./ERROR_ESCALATION.md) для деталей про Either Pattern

---

## Этап 3: Specification Pattern (⭐ Лучший подход)

### Решение: Specification + Validation + mapLeft

Тот же пример, но с Specification Pattern для валидации.

#### Shared Layer - Спецификации [#code]

```typescript
// ✅ ОТЛИЧНО: Переиспользуемые спецификации
// src/shared/specification/StringSpecifications.ts
import { Validation, valid, invalid } from '@/shared/validation'
import { ISpecification } from './ISpecification'

export class NotEmptySpec implements ISpecification<string> {
  constructor(private entityType: string) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return value && value.trim()
      ? valid(value)
      : invalid(new ValidationError(this.entityType, "cannot be empty"))
  }
}

export class LengthRangeSpec implements ISpecification<string> {
  constructor(
    private min: number,
    private max: number,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return value.length >= this.min && value.length <= this.max
      ? valid(value)
      : invalid(new ValidationError(
          this.entityType,
          `must be ${this.min}-${this.max} characters`
        ))
  }
}

export class PatternSpec implements ISpecification<string> {
  constructor(
    private pattern: RegExp,
    private message: string,
    private entityType: string
  ) {}
  
  isSatisfiedBy(value: string): Validation<ValidationError, string> {
    return this.pattern.test(value)
      ? valid(value)
      : invalid(new ValidationError(this.entityType, this.message))
  }
}
```

#### Domain Layer - Value Object [#code]

```typescript
// ✅ ОТЛИЧНО: БЕЗ if-ов! Декларативная валидация
import { Validation } from '@/shared/validation'
import { CompositeSpecification } from '@/shared/specification'
import { NotEmptySpec, LengthRangeSpec, PatternSpec } from '@/shared/specification'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Validation<ValidationError, ResourceName> {
    // Декларативно описываем правила - БЕЗ if-ов! ⭐
    const spec = CompositeSpecification.allOf(
      new NotEmptySpec('ResourceName'),
      new LengthRangeSpec(1, 100, 'ResourceName'),
      new PatternSpec(/^[a-zA-Z0-9-_]+$/, 'invalid characters', 'ResourceName')
    )
    
    // Одна строка вместо множества if-ов!
    return spec.isSatisfiedBy(value).map(v => new ResourceName(v))
  }
  
  // Бонус: можем собрать ВСЕ ошибки
  static createWithAllErrors(value: string): Validation<ValidationError[], ResourceName> {
    const spec = CompositeSpecification.allOfAccumulate(
      new NotEmptySpec('ResourceName'),
      new LengthRangeSpec(1, 100, 'ResourceName'),
      new PatternSpec(/^[a-zA-Z0-9-_]+$/, 'invalid characters', 'ResourceName')
    )
    
    return spec.isSatisfiedBy(value).map(v => new ResourceName(v))
  }
  
  getValue(): string {
    return this.value
  }
}
```

#### Infrastructure, Domain, Application - без изменений

```typescript
// Infrastructure, Domain Repository, Application Handler
// остаются такими же как в Этапе 2 (Either Pattern)
// Изменились только Value Objects - теперь БЕЗ if-ов!
```

#### Presentation Layer - с выбором режима [#code]

```typescript
// ✅ ОТЛИЧНО: Можем выбрать fail-fast или accumulate
async function createResourceRoute(request: Request) {
  const command = await request.json()
  
  // Для API - возвращаем ВСЕ ошибки валидации
  const nameResult = ResourceName.createWithAllErrors(command.name)
  const namespaceResult = Namespace.createWithAllErrors(command.namespace)
  
  // Если есть ошибки валидации - вернем ВСЕ сразу
  if (nameResult.isLeft() || namespaceResult.isLeft()) {
    const errors = [
      ...(nameResult.isLeft() ? nameResult.value : []),
      ...(namespaceResult.isLeft() ? namespaceResult.value : [])
    ]
    return json({ 
      errors: errors.map(e => e.message) 
    }, { status: 400 })
  }
  
  // Продолжаем с валидными значениями
  const result = await handler.execute(command)
  
  return result.fold(
    (error) => json({ error: error.message }, { status: 400 }),
    (dto) => json(dto, { status: 201 })
  )
}
```

### Преимущества Specification Pattern

- ✅ **БЕЗ if-ов** - декларативный стиль
- ✅ **Переиспользуемо** - `NotEmptySpec` используется везде
- ✅ **Тестируемо** - каждая спецификация тестируется отдельно
- ✅ **Композируемо** - легко комбинировать правила
- ✅ **Читаемо** - код читается как бизнес-правила
- ✅ **Два режима** - fail-fast или accumulate (все ошибки)
- ✅ **Type-safe** - как Either
- ✅ **Явная эскалация** - `mapLeft` на границах слоев

> 📖 См. [SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md) для деталей

---

## Сравнительная таблица

| Критерий | Try-Catch | Either Pattern | Specification Pattern |
|----------|-----------|----------------|----------------------|
| **Ошибки в типах** | ❌ Нет | ✅ Да | ✅ Да |
| **Type-safe** | ❌ `unknown` | ✅ Полностью | ✅ Полностью |
| **Компилятор проверяет** | ❌ Нет | ✅ Да | ✅ Да |
| **Количество if-ов** | ⚠️ Много | ⚠️ Много | ✅ Ноль! |
| **instanceof на слоях** | ❌ На каждом | ✅ Нет (mapLeft) | ✅ Нет (mapLeft) |
| **Переиспользование** | ❌ Сложно | ⚠️ Возможно | ✅ Легко |
| **Тестируемость** | ⚠️ Средняя | ⚠️ Средняя | ✅ Отличная |
| **Читаемость** | ❌ Плохая | ⚠️ Средняя | ✅ Отличная |
| **Все ошибки сразу** | ❌ Нет | ✅ Да (`mergeInMany`) | ✅ Да (`allOfAccumulate`) |
| **Декларативность** | ❌ Нет | ⚠️ Частично | ✅ Полностью |
| **Вложенность** | ❌ try-catch Hell | ✅ Плоская цепочка | ✅ Плоская цепочка |

---

## Эскалация ошибок через слои

### Схема трансформации ошибок

```
┌─────────────────────────────────────────────────────────┐
│  Infrastructure Layer                                    │
│  Either<NetworkError, Response>                          │
└────────────┬────────────────────────────────────────────┘
             │ mapLeft(networkError => new DomainError())
             ↓
┌────────────┴────────────────────────────────────────────┐
│  Domain Layer                                            │
│  Either<DomainError, Resource>                           │
│  (DuplicateError, NotFoundError, InvariantViolationError)│
└────────────┬────────────────────────────────────────────┘
             │ mapLeft(domainError => new CommandError())
             ↓
┌────────────┴────────────────────────────────────────────┐
│  Application Layer                                       │
│  Either<CommandError, ResourceDTO>                       │
└────────────┬────────────────────────────────────────────┘
             │ fold(error => json(...), dto => json(...))
             ↓
┌────────────┴────────────────────────────────────────────┐
│  Presentation Layer                                      │
│  Response (JSON)                                         │
└─────────────────────────────────────────────────────────┘
```

### Ключевые правила

1. **Infrastructure → Domain:** ВСЕГДА трансформируем через `mapLeft`
   - `NetworkError` → `DomainError` (NotFoundError, DuplicateError)

2. **Domain → Application:** МОГУТ трансформироваться через `mapLeft`
   - `DomainError` → `CommandError` или `QueryError`

3. **Application → Presentation:** Обрабатываем через `fold`
   - `CommandError` → HTTP Response

**Главное:** НЕТ `instanceof` проверок! Только `mapLeft` для трансформации!

---

## Итоговая рекомендация

### Используйте Specification Pattern для валидации

1. **Общие правила** → `src/shared/specification/`
   - `NotEmptySpec`, `LengthRangeSpec`, `PatternSpec`, `UuidV4Spec`

2. **Бизнес-правила** → `src/domain/{context}/specifications/`
   - `NotReservedNamespaceSpec`, `UniqueResourceNameSpec`

3. **Композиция** → `CompositeSpecification.allOf()`
   - Комбинируйте общие и бизнес-специфичные спецификации

4. **Два режима:**
   - `allOf()` — fail-fast (для UI)
   - `allOfAccumulate()` — все ошибки (для API/форм)

5. **Эскалация** → `mapLeft()` на границах слоев
   - Infrastructure → Domain → Application → Presentation

### Результат

- ✅ Код без if-ов
- ✅ Type-safe обработка ошибок
- ✅ Переиспользуемые правила
- ✅ Легко тестировать
- ✅ Читается как документация
- ✅ НЕТ instanceof проверок
- ✅ Явная эскалация через mapLeft

---

## 🔗 Связанные документы

- **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** - Either Pattern и монады
- **[SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md)** - Specification Pattern
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** - Иерархия ошибок по слоям
- **[INVARIANTS.md](./INVARIANTS.md)** - Инварианты в DDD
