# Эскалация ошибок (Error Escalation) `#error-escalation` `#result-pattern` `#monads`

Документ описывает проблемы традиционного подхода к обработке ошибок через `try-catch` и современные решения с использованием Result Pattern и монад.

> 📖 **Расширенное сравнение:** [ERROR_ESCALATION_EXTENDED.md](./ERROR_ESCALATION_EXTENDED.md) — детальное сравнение всех библиотек (@sweet-monads/either, fp-ts) с объяснением что такое монады и чем они отличаются.

---

## 🔴 Проблема: Try-Catch Hell

### Традиционный подход в TypeScript

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

## 🎯 Решение 1: Result Pattern (Нативный TypeScript)

### Базовая реализация

**Файл: `src/domain/shared/result/Result.ts`**  `#structure:domain/shared/result/`

```typescript
/**
 * Result Type для обработки ошибок без исключений
 */
export type Result<T, E = Error> = Success<T> | Failure<E>

export class Success<T> {  // #class:Success
  readonly ok = true as const
  
  constructor(readonly value: T) {}
  
  isSuccess(): this is Success<T> {
    return true
  }
  
  isFailure(): this is never {
    return false
  }
}

export class Failure<E> {  // #class:Failure
  readonly ok = false as const
  
  constructor(readonly error: E) {}
  
  isSuccess(): this is never {
    return false
  }
  
  isFailure(): this is Failure<E> {
    return true
  }
}

export const success = <T>(value: T): Success<T> => new Success(value)
export const failure = <E>(error: E): Failure<E> => new Failure(error)
```

### Использование

```typescript
// ✅ ХОРОШО: Явная обработка ошибок

// Value Object возвращает Result
class ResourceName {  // #class:ResourceName
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value || value.length < 1) {
      return failure(new InvariantViolationError('ResourceName', 'cannot be empty'))
    }
    return success(new ResourceName(value))
  }
  
  getValue(): string {
    return this.value
  }
}

// Command Handler использует Result
class CreateResourceCommandHandler {  // #class:CreateResourceCommandHandler
  async handle(command: CreateResourceCommand): Promise<Result<Resource, DomainError>> {
    const nameResult = ResourceName.create(command.name)
    if (nameResult.isFailure()) {
      return failure(nameResult.error) // ✅ Тип сохранен!
    }
    
    const resource = Resource.create({ name: nameResult.value })
    const saveResult = await this.repository.save(resource)
    
    if (saveResult.isFailure()) {
      return failure(saveResult.error)
    }
    
    return success(saveResult.value)
  }
}

// Presentation Layer
export async function action({ request }: ActionFunctionArgs) {
  const result = await commands.resources.create(request)
  
  if (result.isFailure()) {
    const error = result.error
    if (error instanceof InvariantViolationError) {
      return json({ error: error.message }, { status: 400 })
    }
    return json({ error: 'Unknown error' }, { status: 500 })
  }
  
  return redirect(`/resources/${result.value.id}`)
}
```

### Преимущества
- ✅ **Type-safe**: компилятор заставляет обработать ошибку
- ✅ **Явный control flow**: видно что функция может вернуть ошибку
- ✅ **Нативный TypeScript**: не нужны библиотеки

### Недостатки
- ❌ **Boilerplate**: много `if (result.isFailure())`
- ❌ **Нет chain методов**: приходится проверять каждый шаг

---

## 🎯 Решение 2: Монады (neverthrow)

**Библиотека**: [neverthrow](https://github.com/supermacro/neverthrow) (~2.6k ⭐)

### Установка

```bash
pnpm add neverthrow  #command:pnpm-add-neverthrow
```

### Базовое использование

```typescript
import { Result, ok, err } from 'neverthrow'

class ResourceName {  // #class:ResourceName
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

```typescript
const result = ResourceName.create('facebook')
  .map(name => name.value.toUpperCase())
// Result<string, InvariantViolationError>
```

#### 2. **andThen** — цепочка операций (flatMap)

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

```typescript
return result.match(
  (value) => json({ data: value }),
  (error) => json({ error: error.message }, { status: 400 })
)
```

#### 4. **combine** — параллельная валидация

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

```typescript
import { Result, ok, err, combine } from 'neverthrow'

class CreateResourceCommandHandler {  // #class:CreateResourceCommandHandler
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

## 🎯 Решение 3: fp-ts (Функциональное программирование)

**Библиотека**: [fp-ts](https://github.com/gcanti/fp-ts) (~10k ⭐)

```bash
pnpm add fp-ts  #command:pnpm-add-fp-ts
```

### Either (аналог Result)

```typescript
import { Either, left, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<InvariantViolationError, ResourceName> {
    if (!value) return left(new InvariantViolationError('ResourceName', 'empty'))
    return right(new ResourceName(value))
  }
  
  getValue(): string {
    return this.value
  }
}

const result = pipe(
  ResourceName.create(input),
  E.map(name => name.value.toUpperCase()),
  E.fold(
    (error) => ({ error: error.message }),
    (value) => ({ data: value })
  )
)
```

### TaskEither (Either + Promise)

```typescript
import { TaskEither } from 'fp-ts/TaskEither'
import * as TE from 'fp-ts/TaskEither'

const createResource = (command: CreateResourceCommand): TaskEither<DomainError, Resource> =>
  pipe(
    TE.Do,
    TE.bind('name', () => TE.fromEither(ResourceName.create(command.name))),
    TE.bind('namespace', () => TE.fromEither(Namespace.create(command.namespace))),
    TE.chain(({ name, namespace }) => 
      repository.save(Resource.create({ name, namespace }))
    )
  )
```

### Преимущества fp-ts
- ✅ **Полный функциональный тулкит**
- ✅ **Композиция**: pipe для цепочек
- ✅ **Большое комьюнити**

### Недостатки fp-ts
- ❌ **Сложность**: крутая кривая обучения
- ❌ **Verbosity**: много импортов
- ❌ **Overkill**: для простых случаев избыточно

---

## 📊 Сравнение подходов

| Критерий | Try-Catch | Result | neverthrow | @sweet-monads | fp-ts |
|----------|-----------|--------|------------|---------------|-------|
| **Монада** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Type Safety** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Читаемость** | ❌ | ⚠️ | ✅ | ✅ | ⚠️ |
| **Boilerplate** | ⚠️ | ❌ Много | ✅ Мало | ✅ Мало | ⚠️ Средне |
| **Chain** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Async** | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| **mapLeft** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Накопление ошибок** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Обучение** | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |
| **Bundle** | 0kb | 0kb | ~2kb | ~2kb | ~30kb |
| **Популярность** | - | - | 2.6k ⭐ | 2.1k ⭐ | 10k ⭐ |
| **Терминология** | - | Ok/Err | Ok/Err | Right/Left | Right/Left |

> 💡 **Примечание:** @sweet-monads/either поддерживает `mergeInMany` для накопления всех ошибок — идеально для валидации форм!

---

## 💡 Рекомендация: Гибридный подход

### Domain Layer — нативный Result

```typescript
// src/domain/shared/result/Result.ts  #structure:domain/shared/result/
export type Result<T, E = Error> = Success<T> | Failure<E>
// ... реализация

// Value Objects возвращают нативный Result
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    if (!value) return failure(new InvariantViolationError(...))
    return success(new ResourceName(value))
  }
  
  getValue(): string {
    return this.value
  }
}
```

### Application Layer — neverthrow для композиции

```bash
pnpm add neverthrow  #command:pnpm-add-neverthrow
```

```typescript
// src/application/shared/adapters.ts  #structure:application/shared/
import { Result as NativeResult } from '@/domain/shared/result'  #structure:domain/shared/result/
import { Result, ok, err } from 'neverthrow'

export function toNeverthrow<T, E>(result: NativeResult<T, E>): Result<T, E> {
  return result.isSuccess() ? ok(result.value) : err(result.error)
}

// Command Handler
import { combine } from 'neverthrow'
import { toNeverthrow } from './adapters'

class CreateResourceCommandHandler {
  async handle(command: CreateResourceCommand): Promise<Result<Resource, DomainError>> {
    return combine([
      toNeverthrow(ResourceName.create(command.name)),
      toNeverthrow(Namespace.create(command.namespace))
    ])
      .map(([name, namespace]) => Resource.create({ name, namespace }))
      .andThen(resource => this.repository.save(resource))
  }
}
```

### Presentation Layer — match

```typescript
export async function action({ request }: ActionFunctionArgs) {
  const result = await commands.resources.create(request)
  
  return result.match(
    (resource) => redirect(`/resources/${resource.id}`),
    (error) => handleDomainError(error)
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
