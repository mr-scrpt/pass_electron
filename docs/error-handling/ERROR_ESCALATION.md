# Эскалация ошибок (Error Escalation)

Документ описывает как правильно эскалировать ошибки между архитектурными слоями используя **@sweet-monads/either** и Either Pattern, избегая Try-Catch Hell.

> 📖 **Сравнение библиотек:** [ERROR_ESCALATION_EXTENDED.md](./ERROR_ESCALATION_EXTENDED.md) — детальное сравнение @sweet-monads/either, neverthrow, fp-ts с объяснением монад и выбора библиотеки.

---

## 🔴 Проблема: Try-Catch Hell

### Традиционный подход в TypeScript

#### Try-Catch Hell [#code]

```typescript
// ❌ ПРОБЛЕМА: Try-Catch Hell с instanceof
async function createResource(request: Request): Promise<Response> {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    
    try {
      const resourceName = ResourceName.create(name)
      
      try {
        const resource = await repository.save(resourceName)
        return json({ success: true, data: resource })
        
      } catch (error) {
        if (error instanceof NotFoundError) {
          return json({ error: 'Not found' }, { status: 404 })
        }
        if (error instanceof DuplicateError) {
          return json({ error: 'Already exists' }, { status: 409 })
        }
        throw error
      }
      
    } catch (error) {
      if (error instanceof InvariantViolationError) {
        return json({ error: error.message }, { status: 400 })
      }
      throw error
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Проблемы этого подхода

#### 1. **Вложенные try-catch блоки**
- ❌ Плохая читаемость
- ❌ Сложно отследить поток выполнения
- ❌ Легко пропустить обработку ошибки

#### 2. **instanceof на каждом уровне**

##### Проблема instanceof [#code]

```typescript
catch (error) {
  if (error instanceof InvariantViolationError) { }
  if (error instanceof NotFoundError) { }
  if (error instanceof DuplicateError) { }
  // ... еще 10 проверок
}
```
- ❌ Много boilerplate кода
- ❌ Легко забыть проверку
- ❌ Не type-safe (unknown в catch)

#### 3. **Неявный control flow**

##### Неявный тип [#code]

```typescript
function doSomething(): string {
  // может вернуть string
  // ИЛИ выбросить исключение
  // НО тип говорит только про string!
}
```
- ❌ Тип не показывает возможные ошибки
- ❌ Нет compile-time проверки

#### 4. **Проблема с типизацией**

##### Unknown тип [#code]

```typescript
catch (error) {
  // error имеет тип unknown
  // Нужны runtime проверки
  if (error instanceof Error) {
    console.log(error.message)
  }
}
```
---

## 🎯 Решение: @sweet-monads/either (Either Pattern)

**Библиотека**: [@sweet-monads/either](https://github.com/JSMonk/sweet-monads) (~2.1k ⭐)

**Почему @sweet-monads/either?**
- ✅ Накопление всех ошибок валидации (`mergeInMany`)
- ✅ Трансформация ошибок (`mapLeft`)
- ✅ Async операции встроены (`asyncChain`, `asyncMap`)
- ✅ Легкая (~2kb, 0 dependencies)
- ✅ Классическая Either монада (Haskell-style)

### Установка

#### Команда установки [#command:pnpm-add-sweet-monads]

```bash
pnpm add @sweet-monads/either
```

### Базовое использование

#### ResourceName с @sweet-monads/either [#class:ResourceName|#code]

```typescript
import { Either, right, left } from '@sweet-monads/either'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<InvariantViolationError, ResourceName> {
    if (!value) {
      return left(new InvariantViolationError('ResourceName', 'empty'))
    }
    return right(new ResourceName(value))
  }
  
  getValue(): string {
    return this.value
  }
}
```

### Монадические операции

#### 1. **map** — трансформация Right (успешного значения)

##### Пример map [#code]

```typescript
const result = ResourceName.create('facebook')
  .map(name => name.getValue().toUpperCase())
// Either<InvariantViolationError, string>
```

#### 2. **chain** — цепочка операций (flatMap)

##### Пример chain [#code]

```typescript
// ❌ ПЛОХО: Вложенные проверки
const nameResult = ResourceName.create(input.name)
if (nameResult.isLeft()) return left(nameResult.value)

const namespaceResult = Namespace.create(input.namespace)
if (namespaceResult.isLeft()) return left(namespaceResult.value)

// ✅ ХОРОШО: chain
const result = ResourceName.create(input.name)
  .chain(name => 
    Namespace.create(input.namespace)
      .map(namespace => ({ name, namespace }))
  )
```

#### 3. **fold** — pattern matching

##### Пример fold [#code]

```typescript
return result.fold(
  (error) => json({ error: error.message }, { status: 400 }),
  (value) => json({ data: value })
)
// ⚠️ Порядок аргументов: (left, right) - сначала ошибка!
```

#### 4. **merge** — параллельная валидация (fail-fast)

##### Пример merge [#code]

```typescript
import { merge } from '@sweet-monads/either'

// Останавливается на первой ошибке
const results = merge([
  ResourceName.create(input.name),
  Namespace.create(input.namespace),
  SecretField.create(input.secret)
])
// Either<InvariantViolationError, [ResourceName, Namespace, SecretField]>

results.fold(
  (error) => left(error),
  ([name, namespace, secret]) => {
    return Resource.create({ name, namespace, secret })
  }
)
```

#### 5. **mergeInMany** — накопление ВСЕХ ошибок ⭐

##### Пример mergeInMany [#code]

```typescript
import { mergeInMany } from '@sweet-monads/either'

// ✅ Собирает ВСЕ ошибки валидации!
const results = mergeInMany([
  ResourceName.create(''),           // Left(error1)
  Namespace.create(''),              // Left(error2)
  SecretField.create('')             // Left(error3)
])
// Either<Array<InvariantViolationError>, [ResourceName, Namespace, SecretField]>

results.fold(
  (errors) => {
    // errors = [error1, error2, error3]
    return json({
      errors: errors.map(e => ({
        field: e.entityType,
        message: e.message
      }))
    }, { status: 400 })
  },
  ([name, namespace, secret]) => {
    return Resource.create({ name, namespace, secret })
  }
)
```

#### 6. **mapLeft** — трансформация ошибок

##### Пример mapLeft [#code]

```typescript
// Преобразование Domain ошибки в Application ошибку
const result = ResourceName.create('')
  .mapLeft(domainError => 
    new ValidationError(domainError.message)
  )
// Either<ValidationError, ResourceName>
```

### Полный пример: Command Handler

#### CreateResourceCommandHandler [#class:CreateResourceCommandHandler|#code]

```typescript
import { Either, merge } from '@sweet-monads/either'

class CreateResourceCommandHandler {
  async handle(
    command: CreateResourceCommand
  ): Promise<Either<DomainError, Resource>> {
    
    return merge([
      ResourceName.create(command.name),
      Namespace.create(command.namespace),
      SecretField.create(command.secret)
    ])
      .map(([name, namespace, secret]) => 
        Resource.create({ name, namespace, secret })
      )
      .asyncChain(resource => 
        this.repository.save(resource)
      )
      .map(savedResource => {
        this.eventBus.publish(new ResourceCreated(savedResource.id))
        return savedResource
      })
  }
}
```

### asyncChain для async операций

#### ApiResourceRepository [#interface:IResourceRepository|#code]

```typescript
import { Either, right, left, fromPromise } from '@sweet-monads/either'

class ApiResourceRepository implements IResourceRepository {
  async findById(id: ResourceId): Promise<Either<NotFoundError | NetworkError, Resource>> {
    return fromPromise<NetworkError, Response>(
      fetch(`/api/resources/${id.getValue()}`)
    )
      .asyncChain(async response => {
        if (response.status === 404) {
          return left(new NotFoundError('Resource', id.getValue()))
        }
        return right(response)
      })
      .asyncChain(response => 
        fromPromise<NetworkError, any>(
          response.json()
        )
      )
      .map(data => this.mapper.toDomain(data))
  }
}
```

### Преимущества @sweet-monads/either
- ✅ **Railway-oriented programming**: ошибка автоматически прокидывается
- ✅ **Type-safe chain**: компилятор знает тип на каждом шаге
- ✅ **Нет boilerplate**: не нужны if на каждом шаге
- ✅ **Функциональный стиль**: map, chain, fold
- ✅ **Async support**: asyncChain, asyncMap встроены
- ✅ **mergeInMany**: накопление всех ошибок (уникально!)
- ✅ **mapLeft**: трансформация ошибок
- ✅ **Легкая**: 0 dependencies, ~2kb gzipped

---

## 🔄 Эскалация между слоями

### Domain → Application

Domain Layer возвращает `Either<DomainError, T>`, Application Layer комбинирует их через `merge()` и `chain()`.

#### Пример: Command Handler [#code]

```typescript
import { Either, merge } from '@sweet-monads/either'

class CreateResourceCommandHandler {
  async handle(
    command: CreateResourceCommand
  ): Promise<Either<DomainError, Resource>> {
    // Комбинируем валидацию Value Objects
    return merge([
      ResourceName.create(command.name),
      Namespace.create(command.namespace),
      SecretField.create(command.secret)
    ])
      .map(([name, namespace, secret]) => 
        Resource.create({ name, namespace, secret })
      )
      .asyncChain(resource => 
        this.repository.save(resource)
      )
  }
}
```

### Infrastructure → Domain

Infrastructure Layer перехватывает технические ошибки (NetworkError, ApiError) и преобразует их в Domain ошибки через `mapLeft()`.

#### Пример: Repository [#interface:IResourceRepository|#code]

```typescript
import { Either } from '@sweet-monads/either'

class ApiResourceRepository implements IResourceRepository {
  async findById(id: ResourceId): Promise<Either<NotFoundError | NetworkError, Resource>> {
    return this.httpClient
      .get<ResourceDTO>(`/resources/${id.getValue()}`)
      .chain((response) => 
        this.mapper.toDomain(response)
      )
      .mapLeft((error) => {
        // HTTP 404 → NotFoundError (Domain)
        if (error instanceof NetworkError && error.statusCode === 404) {
          return new NotFoundError('Resource', id.getValue())
        }
        return error
      })
  }
}
```

### Application → Presentation

Presentation Layer использует `.fold()` для обработки Either и возврата HTTP ответов.

#### Пример: Remix Action [#code]

```typescript
export async function action({ request }: ActionFunctionArgs) {
  const result = await commands.resources.create(request)
  
  return result.match(
    // Success → redirect
    (resource) => redirect(`/resources/${resource.id}`),
    
    // Error → JSON response
    (error) => {
      if (error instanceof InvariantViolationError) {
        return json({ error: error.message }, { status: 400 })
      }
      if (error instanceof DuplicateError) {
        return json({ error: 'Already exists' }, { status: 409 })
      }
      return json({ error: 'Server error' }, { status: 500 })
    }
  )
}
```

---

## 🔧 План миграции

```
Этап 1: Domain Layer
├── Создать Result type (нативный)
├── Обновить Value Objects (create → Result)
└── Обновить Repository интерфейсы

Этап 2: Application Layer
├── Установить neverthrow
├── Создать адаптеры toNeverthrow/fromNeverthrow
├── Обновить Command Handlers
└── Обновить Query Handlers

Этап 3: Presentation Layer
├── Создать handleDomainError helper
├── Обновить Actions (использовать match)
└── Обновить Loaders
```

---

## 🔗 См. также

- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Иерархия ошибок Domain/Application/Infrastructure
- **[INVARIANTS.md](./INVARIANTS.md)** — Инварианты и валидация
- **[DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** — Архитектурные слои

---

**💡 Ключевая идея**: Result делает ошибки частью сигнатуры типа. Компилятор заставляет обработать все возможные ошибки!
