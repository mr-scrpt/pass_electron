# Эскалация ошибок (Error Escalation)

Документ описывает как правильно эскалировать ошибки между архитектурными слоями используя **neverthrow** и Result Pattern, избегая Try-Catch Hell.

> 📖 **Сравнение библиотек:** [ERROR_ESCALATION_EXTENDED.md](./ERROR_ESCALATION_EXTENDED.md) — детальное сравнение neverthrow, @sweet-monads/either, fp-ts с объяснением монад и выбора библиотеки.

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

## 🎯 Решение: neverthrow (Result Pattern)

**Библиотека**: [neverthrow](https://github.com/supermacro/neverthrow) (~2.6k ⭐)

### Установка

#### Команда установки [#command:pnpm-add-neverthrow]

```bash
pnpm add neverthrow
```

### Базовое использование

#### ResourceName с neverthrow [#class:ResourceName|#code]

```typescript
import { Result, ok, err } from 'neverthrow'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value) {
      return err(new InvariantViolationError('ResourceName', 'empty'))
    }
    return ok(new ResourceName(value))
  }
  
  getValue(): string {
    return this.value
  }
}
```

### Монадические операции

#### 1. **map** — трансформация значения

##### Пример map [#code]

```typescript
const result = ResourceName.create('facebook')
  .map(name => name.value.toUpperCase())
// Result<string, InvariantViolationError>
```

#### 2. **andThen** — цепочка операций (flatMap)

##### Пример andThen [#code]

```typescript
// ❌ ПЛОХО: Вложенные проверки
const nameResult = ResourceName.create(input.name)
if (nameResult.isErr()) return err(nameResult.error)

const namespaceResult = Namespace.create(input.namespace)
if (namespaceResult.isErr()) return err(namespaceResult.error)

// ✅ ХОРОШО: andThen
const result = ResourceName.create(input.name)
  .andThen(name => 
    Namespace.create(input.namespace)
      .map(namespace => ({ name, namespace }))
  )
```

#### 3. **match** — pattern matching

##### Пример match [#code]

```typescript
return result.match(
  (value) => json({ data: value }),
  (error) => json({ error: error.message }, { status: 400 })
)
```

#### 4. **combine** — параллельная валидация

##### Пример combine [#code]

```typescript
import { combine } from 'neverthrow'

const results = combine([
  ResourceName.create(input.name),
  Namespace.create(input.namespace),
  SecretField.create(input.secret)
])
// Result<[ResourceName, Namespace, SecretField], Error>

results.match(
  ([name, namespace, secret]) => {
    return Resource.create({ name, namespace, secret })
  },
  (error) => err(error)
)
```

### Полный пример: Command Handler

#### CreateResourceCommandHandler [#class:CreateResourceCommandHandler|#code]

```typescript
import { Result, ok, err, combine } from 'neverthrow'

class CreateResourceCommandHandler {
  async handle(
    command: CreateResourceCommand
  ): Promise<Result<Resource, DomainError>> {
    
    return combine([
      ResourceName.create(command.name),
      Namespace.create(command.namespace),
      SecretField.create(command.secret)
    ])
      .map(([name, namespace, secret]) => 
        Resource.create({ name, namespace, secret })
      )
      .andThen(resource => 
        this.repository.save(resource)
      )
      .map(savedResource => {
        this.eventBus.publish(new ResourceCreated(savedResource.id))
        return savedResource
      })
  }
}
```

### ResultAsync для async операций

#### ApiResourceRepository [#interface:IResourceRepository|#code]

```typescript
import { ResultAsync } from 'neverthrow'

class ApiResourceRepository implements IResourceRepository {
  findById(id: ResourceId): ResultAsync<Resource, NotFoundError | NetworkError> {
    return ResultAsync.fromPromise(
      fetch(`/api/resources/${id.getValue()}`),
      () => new NetworkError('Failed to fetch')
    )
      .andThen(response => {
        if (response.status === 404) {
          return err(new NotFoundError('Resource', id.getValue()))
        }
        return ok(response)
      })
      .andThen(response => 
        ResultAsync.fromPromise(
          response.json(),
          () => new NetworkError('Failed to parse')
        )
      )
      .map(data => this.mapper.toDomain(data))
  }
}
```

### Преимущества neverthrow
- ✅ **Railway-oriented programming**: ошибка автоматически прокидывается
- ✅ **Type-safe chain**: компилятор знает тип на каждом шаге
- ✅ **Нет boilerplate**: не нужны if на каждом шаге
- ✅ **Функциональный стиль**: map, andThen, match
- ✅ **Async support**: ResultAsync для промисов
- ✅ **Легкая**: 0 dependencies, ~2kb gzipped

---

## 🔄 Эскалация между слоями

### Domain → Application

Domain Layer возвращает `Result<T, DomainError>`, Application Layer комбинирует их через `combine()` и `andThen()`.

#### Пример: Command Handler [#code]

```typescript
import { Result, combine } from 'neverthrow'

class CreateResourceCommandHandler {
  async handle(
    command: CreateResourceCommand
  ): Promise<Result<Resource, DomainError>> {
    // Комбинируем валидацию Value Objects
    return combine([
      ResourceName.create(command.name),
      Namespace.create(command.namespace),
      SecretField.create(command.secret)
    ])
      .map(([name, namespace, secret]) => 
        Resource.create({ name, namespace, secret })
      )
      .asyncAndThen(resource => 
        this.repository.save(resource)
      )
  }
}
```

### Infrastructure → Domain

Infrastructure Layer перехватывает технические ошибки (NetworkError, ApiError) и преобразует их в Domain ошибки через `mapErr()`.

#### Пример: Repository [#interface:IResourceRepository|#code]

```typescript
import { ResultAsync } from 'neverthrow'

class ApiResourceRepository implements IResourceRepository {
  findById(id: ResourceId): ResultAsync<Resource, NotFoundError | NetworkError> {
    return this.httpClient
      .get<ResourceDTO>(`/resources/${id.getValue()}`)
      .andThen((response) => 
        this.mapper.toDomain(response)
      )
      .mapErr((error) => {
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

Presentation Layer использует `.match()` для обработки Result и возврата HTTP ответов.

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
