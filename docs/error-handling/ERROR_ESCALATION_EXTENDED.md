# Эскалация ошибок — Расширенное сравнение библиотек `#error-escalation` `#result-pattern` `#monads`

Дополнение к **ERROR_ESCALATION.md** `#file:docs/error-handling/ERROR_ESCALATION.md` с детальным сравнением всех библиотек для работы с Result/Either.

---

## 🔍 Что такое монады и чем отличаются библиотеки?

### Монада — это что?

**Монада** — это паттерн из функционального программирования, который позволяет "оборачивать" значения и работать с ними через композицию функций.

#### Три закона монад:

1. **Left Identity** (левая идентичность)
   ```typescript
   // unit(a).chain(f) === f(a)
   ok(5).andThen(x => ok(x * 2)) === ok(10)
   ```

2. **Right Identity** (правая идентичность)
   ```typescript
   // m.chain(unit) === m
   ok(5).andThen(x => ok(x)) === ok(5)
   ```

3. **Associativity** (ассоциативность)
   ```typescript
   // m.chain(f).chain(g) === m.chain(x => f(x).chain(g))
   ```

### Result vs Either — в чем разница?

| Аспект | Result<T, E> | Either<L, R> |
|--------|--------------|--------------|
| **Происхождение** | Rust | Haskell |
| **Терминология** | Ok/Err | Right/Left |
| **Успех** | Ok(value) | Right(value) |
| **Ошибка** | Err(error) | Left(error) |
| **Интуитивность** | ✅ Более понятно | ⚠️ Менее интуитивно* |
| **Монадичность** | Да | Да |

*Left = ошибка может быть неочевидно для новичков

---

## 📚 Сравнение всех 4 библиотек

### 1. neverthrow

**Тип:** Result монада  
**Философия:** Простота + Railway-oriented programming  
**Стиль:** Ok/Err (из Rust)

```typescript
import { Result, ok, err, combine } from 'neverthrow'

// ✅ Понятная терминология
const result: Result<number, Error> = ok(42)
// Да, это монада!
```

**Монадические операции:**
- `map` — функтор (трансформация значения)
- `andThen` — монада (flatMap, chain)
- `match` — катаморфизм (fold)
- `combine` — applicative (параллельные операции)

**Является ли монадой?** ✅ **Да**  
neverthrow реализует полноценную Result монаду с всеми необходимыми операциями.

---

### 2. @sweet-monads/either

**Тип:** Either монада  
**Философия:** Полный набор монадических операций  
**Стиль:** Left/Right (из Haskell)

```typescript
import { Either, left, right, merge } from '@sweet-monads/either'

// ✅ Классическая Either монада
const result: Either<Error, number> = right(42)
```

**Монадические операции:**
- `map` — функтор
- `chain` — монада (flatMap)
- `fold` — катаморфизм
- `merge` — applicative (fail-fast)
- `mergeInMany` — applicative (accumulate errors)
- `asyncMap` / `asyncChain` — async монада

**Является ли монадой?** ✅ **Да**  
Полноценная Either монада с расширенными возможностями.

**Отличия от neverthrow:**

| Аспект | neverthrow | @sweet-monads/either |
|--------|------------|---------------------|
| Терминология | Ok/Err | Right/Left |
| Стиль | Rust-like | Haskell-like |
| `combine` | ✅ fail-fast | ✅ `merge` fail-fast |
| Накопление ошибок | ❌ | ✅ `mergeInMany` |
| `mapLeft` | ❌ | ✅ |
| `asyncMap` | ResultAsync | ✅ встроено |
| `or` (fallback) | ✅ `orElse` | ✅ `or` |
| Bundle size | ~2kb | ~2kb |
| Популярность | 2.6k ⭐ | 2.1k ⭐ |

---

### 3. fp-ts

**Тип:** Either + полная экосистема функциональных типов  
**Философия:** Академическое ФП из теории категорий  
**Стиль:** Haskell-like + pipe

```typescript
import { Either, left, right } from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

// ✅ Академическая Either монада
const result: Either<Error, number> = right(42)
```

**Монадические операции:**
- `map` — функтор
- `chain` — монада
- `fold` — катаморфизм
- `sequenceArray` — applicative
- `TaskEither` — async монада
- + Option, Reader, State, IO, Writer...

**Является ли монадой?** ✅ **Да**  
Самая полная реализация монад в TypeScript экосистеме.

**Отличия от sweet-monads:**

| Аспект | @sweet-monads | fp-ts |
|--------|---------------|-------|
| Экосистема | Either, Maybe, Iterator | Either, Option, Task, Reader, State, IO, ... |
| Сложность | ⚠️ Средняя | ❌ Высокая |
| pipe обязателен | ❌ Нет | ✅ Да |
| Bundle | ~2kb | ~30kb |
| TypeScript first | ✅ | ⚠️ (из Haskell) |

---

### 4. Нативный Result (без библиотек)

**Тип:** Result паттерн (не полная монада)  
**Философия:** Минимализм, 0 dependencies  
**Стиль:** Свой

```typescript
type Result<T, E> = Success<T> | Failure<E>

const result: Result<number, Error> = success(42)
```

**Монадические операции:**
- ❌ Нет `map`
- ❌ Нет `chain`
- ❌ Нет `fold`
- Только проверка `isSuccess()` / `isFailure()`

**Является ли монадой?** ❌ **Нет**  
Это просто discriminated union без монадических операций.

---

## 🎯 Решение 3 (обновлено): @sweet-monads/either

**Библиотека:** [@sweet-monads/either](https://github.com/JSMonk/sweet-monads) (~2.1k ⭐, 0 deps)

```bash
npm install @sweet-monads/either
```

### Основное использование

```typescript
import { Either, left, right } from '@sweet-monads/either'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<InvariantViolationError, ResourceName> {
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

### map — трансформация Right

```typescript
const result = ResourceName.create('facebook')
  .map(name => name.value.toUpperCase())
// Either<InvariantViolationError, string>
```

### mapLeft — трансформация Left (ошибки)

```typescript
// ✅ Уникальная фича — трансформация ошибок!
const result = ResourceName.create('')
  .mapLeft(error => new ValidationError(error.message))
// Either<ValidationError, ResourceName>
```

### chain — цепочка операций

```typescript
const result = ResourceName.create(input.name)
  .chain(name => 
    Namespace.create(input.namespace)
      .map(namespace => ({ name, namespace }))
  )
// Either<InvariantViolationError, { name, namespace }>
```

### asyncChain — async цепочка

```typescript
const result = await ResourceName.create(input.name)
  .asyncChain(async name => {
    const resource = await createResource(name)
    return right(resource)
  })
```

### fold — pattern matching

```typescript
const response = result.fold(
  (error) => json({ error: error.message }, { status: 400 }),
  (value) => json({ data: value })
)
```

### merge — параллельная валидация (fail-fast)

```typescript
import { merge } from '@sweet-monads/either'

// Валидация всех полей, останавливается на первой ошибке
const result = merge([
  ResourceName.create(input.name),
  Namespace.create(input.namespace),
  SecretField.create(input.secret)
])
// Either<InvariantViolationError, [ResourceName, Namespace, SecretField]>
```

### mergeInMany — накопление ВСЕХ ошибок

```typescript
import { mergeInMany } from '@sweet-monads/either'

// ✅ Уникальная фича — собрать все ошибки валидации!
const result = mergeInMany([
  ResourceName.create(''),           // Left
  Namespace.create(''),              // Left
  SecretField.create('')             // Left
])
// Either<Array<InvariantViolationError>, [...]>

result.fold(
  (errors) => {
    // Array из 3 ошибок
    return json({
      errors: errors.map(e => ({
        field: e.entityType,
        message: e.message
      }))
    }, { status: 400 })
  },
  (values) => json({ data: values })
)
```

### or — fallback

```typescript
const result = ResourceName.create('')
  .or(ResourceName.create('default-name'))
// Если первый Left, вернет второй
```

### fromPromise — обертка Promise

```typescript
import { fromPromise } from '@sweet-monads/either'

const result = await fromPromise<NetworkError, User>(
  fetch('/api/users/1').then(r => r.json())
)
// Either<NetworkError, User>
```

### fromTry — обертка try-catch

```typescript
import { fromTry } from '@sweet-monads/either'

const result = fromTry<SyntaxError, any>(() => {
  return JSON.parse('invalid json')
})
// Either<SyntaxError, any>
```

### Полный пример: Command Handler

```typescript
import { Either, merge, mergeInMany } from '@sweet-monads/either'

class CreateResourceCommandHandler {
  async handle(
    command: CreateResourceCommand
  ): Promise<Either<DomainError, Resource>> {
    
    // Вариант 1: fail-fast (первая ошибка)
    return merge([
      ResourceName.create(command.name),
      Namespace.create(command.namespace),
      SecretField.create(command.secret)
    ])
      .map(([name, namespace, secret]) => 
        Resource.create({ name, namespace, secret })
      )
      .asyncChain(async resource => {
        const saveResult = await this.repository.save(resource)
        return saveResult
      })
    
    // Вариант 2: все ошибки (для форм)
    const validation = mergeInMany([
      ResourceName.create(command.name),
      Namespace.create(command.namespace),
      SecretField.create(command.secret)
    ])
    
    return validation.fold(
      (errors) => left(new ValidationError(errors)),
      ([name, namespace, secret]) => 
        right(Resource.create({ name, namespace, secret }))
    )
  }
}
```

### Преимущества @sweet-monads/either
- ✅ **Полная монада** — все монадические операции
- ✅ **merge** — fail-fast валидация
- ✅ **mergeInMany** — накопление всех ошибок (идеально для форм!)
- ✅ **mapLeft** — трансформация ошибок
- ✅ **asyncMap/asyncChain** — нативный async
- ✅ **Type-safe** — строгая типизация
- ✅ **Легкая** — 0 deps, модульная
- ✅ **Простая** — проще чем fp-ts

### Недостатки @sweet-monads/either
- ⚠️ **Left/Right** — менее интуитивно чем Ok/Err
- ⚠️ **Меньше популярна** чем neverthrow
- ⚠️ **Меньше примеров** в интернете

---

## 📊 Обновленное сравнение

| Критерий | Try-Catch | Result | neverthrow | @sweet-monads | fp-ts |
|----------|-----------|--------|------------|---------------|-------|
| **Монада** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Type Safety** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Читаемость** | ❌ | ⚠️ | ✅ | ✅ | ⚠️ |
| **Boilerplate** | ⚠️ | ❌ Много | ✅ Мало | ✅ Мало | ⚠️ Средне |
| **Chain** | ❌ | ❌ | ✅ andThen | ✅ chain | ✅ chain |
| **Async** | ✅ | ⚠️ | ✅ ResultAsync | ✅ asyncChain | ✅ TaskEither |
| **mapLeft** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Накопление ошибок** | ❌ | ❌ | ❌ | ✅ mergeInMany | ✅ sequenceArray |
| **Обучение** | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |
| **Bundle** | 0kb | 0kb | ~2kb | ~2kb | ~30kb |
| **Популярность** | - | - | 2.6k ⭐ | 2.1k ⭐ | 10k ⭐ |
| **Терминология** | - | Ok/Err | Ok/Err | Right/Left | Right/Left |

---

## 🤔 Какую библиотеку выбрать?

### neverthrow — если:
- ✅ Нужна простота и понятность (Ok/Err из Rust)
- ✅ Railway-oriented programming
- ✅ Не нужно накопление ошибок
- ✅ Хочется больше примеров в интернете

### @sweet-monads/either — если:
- ✅ Нужно накопление всех ошибок (формы!)
- ✅ Нужна трансформация ошибок (mapLeft)
- ✅ Знакомы с Haskell терминологией
- ✅ Нужна полная монада без fp-ts оверкилла

### fp-ts — если:
- ✅ Нужна полная экосистема (Option, Task, Reader, State...)
- ✅ Команда знает функциональное программирование
- ✅ Академический подход важнее простоты
- ❌ Готовы к сложности

### Нативный Result — если:
- ✅ Нужно 0 dependencies
- ✅ Простые случаи (Domain Layer)
- ❌ Не нужна композиция
- ❌ Готовы писать if проверки

---

## 💡 Рекомендация для нашего проекта

### Гибридный подход с neverthrow

**Почему neverthrow, а не sweet-monads?**

1. **Интуитивность** — Ok/Err понятнее чем Right/Left
2. **Популярность** — больше примеров и комьюнити
3. **Rust-style** — современный и понятный стиль
4. **Достаточность** — 90% случаев покрывает neverthrow

**Когда sweet-monads лучше?**
- Если нужно накопление всех ошибок (формы с множественной валидацией)
- Если нужна трансформация ошибок через mapLeft
- Если команда знакома с Haskell

### Итоговая архитектура

```typescript
// Domain Layer — нативный Result (простота)
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ResourceName, InvariantViolationError> {
    // Валидация
    if (!value) return failure(new InvariantViolationError(...))
    return success(new ResourceName(value))
  }
}

// Application Layer — neverthrow (композиция)
class CreateResourceCommandHandler {
  async handle(command): Promise<Result<Resource, DomainError>> {
    return combine([
      toNeverthrow(ResourceName.create(command.name)),
      toNeverthrow(Namespace.create(command.namespace))
    ])
      .map(([name, namespace]) => Resource.create({ name, namespace }))
      .andThen(resource => this.repository.save(resource))
  }
}

// Presentation Layer — match (обработка)
export async function action({ request }) {
  const result = await commands.resources.create(request)
  return result.match(
    (resource) => redirect(`/resources/${resource.id}`),
    (error) => handleError(error)
  )
}
```

---

## 🔗 См. также

- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Иерархия ошибок
- **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Основной документ по эскалации ошибок
- **[INVARIANTS.md](./INVARIANTS.md)** — Инварианты и валидация

---

**💡 Главное:** Все библиотеки (neverthrow, @sweet-monads/either, fp-ts) — это **монады**. Они отличаются терминологией, API и богатством функций, но суть одна — композиция операций с обработкой ошибок через типы!
