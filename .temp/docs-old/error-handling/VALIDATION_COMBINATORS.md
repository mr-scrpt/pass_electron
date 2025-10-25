# ValidationCombinators - Накопление ошибок валидации

**Назначение:** Комбинаторы для работы с валидацией Value Objects с накоплением ВСЕХ ошибок.

---

## 🎯 Проблема

При создании Value Object нужно собрать **ВСЕ ошибки валидации**, а не останавливаться на первой (fail-fast).

**Требование UX:**
```typescript
// ❌ Fail-fast (плохо для UX)
User вводит: "A!"
Показываем: "must be 2-50 characters"
User исправляет: "AB!"
Показываем: "invalid format"
User исправляет: "ab"
✅ Success

// ✅ Accumulate (хорошо для UX)
User вводит: "A!"
Показываем: 
  - "must be 2-50 characters"
  - "invalid format"
User исправляет: "ab"
✅ Success
```

---

## 📐 Архитектура решения

### 1. Validation API (фасад над монадами) [#code|#structure:path]

```typescript
// src/shared/validation/Validation.ts
import { Either, left, right } from '@sweet-monads/either'

/**
 * Результат валидации
 * Обертка над Either для изоляции библиотеки
 */
export type Validation<E, T> = Either<E, T>

export const valid = <T>(value: T): Validation<never, T> => right(value)
export const invalid = <E>(error: E): Validation<E, never> => left(error)
```

---

### 2. ValidationCombinators с mergeInMany [#class:ValidationCombinators|#code|#structure:path]

```typescript
// src/shared/validation/ValidationCombinators.ts
import { mergeInMany } from '@sweet-monads/either'
import { Validation } from './Validation'

/**
 * Комбинаторы для работы с валидацией
 * Используют функциональный подход (монады) вместо императивного
 */
export class ValidationCombinators {
  /**
   * Накопление ВСЕХ ошибок валидации
   * Использует mergeInMany из @sweet-monads/either
   * 
   * @returns Either<E[], T[]> - массив ошибок ИЛИ массив успешных значений
   * 
   * @example
   * const validations = [
   *   valid('value1'),
   *   invalid(new Error('error1')),
   *   invalid(new Error('error2'))
   * ]
   * 
   * const result = ValidationCombinators.accumulate(validations)
   * // => Left([Error('error1'), Error('error2')])
   */
  static accumulate<E, T>(
    validations: Validation<E, T>[]
  ): Validation<E[], T[]> {
    return mergeInMany(validations)
  }

  /**
   * Применить функцию к успешным значениям
   * Если есть ошибки - вернуть их
   * 
   * Это applicative functor pattern:
   * - Если все validations успешны -> применяем fn к значениям
   * - Если есть ошибки -> возвращаем массив ошибок
   * 
   * @example
   * const specs = [
   *   new NotEmptySpec('Namespace'),
   *   new LengthRangeSpec(2, 50, 'Namespace')
   * ]
   * 
   * return ValidationCombinators.sequence(
   *   specs.map(spec => spec.isSatisfiedBy(value)),
   *   () => new Namespace(value)
   * )
   */
  static sequence<E, T, U>(
    validations: Validation<E, T>[],
    fn: (values: T[]) => U
  ): Validation<E[], U> {
    return mergeInMany(validations).map(fn)
  }
}
```

---

### 3. Public API [#code|#structure:path]

```typescript
// src/shared/validation/index.ts
export * from './Validation'
export * from './ValidationCombinators'
```

---

## 🔍 Как работает mergeInMany

`mergeInMany` - это комбинатор из `@sweet-monads/either` для накопления ошибок:

```typescript
// Сигнатура
mergeInMany<L, R>(eithers: Array<Either<L, R>>): Either<Array<L>, Array<R>>
```

### Пример 1: Все успешны ✅

```typescript
const validations = [
  right('value1'),  // ✅
  right('value2'),  // ✅
  right('value3')   // ✅
]

mergeInMany(validations)
// => Right(['value1', 'value2', 'value3'])
```

### Пример 2: Есть ошибки ❌

```typescript
const validations = [
  right('value1'),           // ✅
  left('error1'),            // ❌
  left('error2'),            // ❌
  right('value2')            // ✅
]

mergeInMany(validations)
// => Left(['error1', 'error2'])
// Обрати внимание: успешные значения игнорируются!
```

**Поведение:** Если хотя бы одна валидация провалилась, `mergeInMany` возвращает **ТОЛЬКО ошибки**.

Это правильно для нашего случая:
- ✅ Если есть ошибки → Value Object НЕ создается
- ✅ Нам нужны только ошибки для показа пользователю
- ✅ Успешные значения не важны, если хоть одна проверка провалилась

---

## 📊 Использование в Value Objects

### Value Object с накоплением ошибок [#class:Namespace|#code|#structure:path]

```typescript
// src/domain/resource/value-objects/Namespace.ts
import { Validation, ValidationCombinators } from '@/shared/validation'
import { NotEmptySpec, LengthRangeSpec, PatternSpec } from '@/shared/specification'
import { InvariantViolationError } from '@/domain/shared/errors'

export class Namespace {
  private constructor(private readonly _value: string) {}

  /**
   * Создание Namespace с накоплением ВСЕХ ошибок
   */
  static create(value: string): Validation<InvariantViolationError[], Namespace> {
    // Определяем спецификации
    const specs = [
      new NotEmptySpec('Namespace'),
      new LengthRangeSpec(2, 50, 'Namespace'),
      new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format (only lowercase, numbers, -, _)', 'Namespace')
    ]

    // Применяем ВСЕ спецификации и накапливаем ошибки
    return ValidationCombinators.sequence(
      specs.map(spec => spec.isSatisfiedBy(value)),
      () => new Namespace(value)
    )
  }

  getValue(): string {
    return this._value
  }
}
```

---

## 🎯 Примеры использования

### Пример 1: Все правила пройдены ✅ [#code]

```typescript
const result = Namespace.create('my-namespace')

if (result.isRight()) {
  const namespace = result.value
  console.log(namespace.getValue()) // "my-namespace"
}
```

**Результат:**
```
✅ Success: Namespace("my-namespace")
```

---

### Пример 2: Одна ошибка ❌ [#code]

```typescript
const result = Namespace.create('A')

if (result.isLeft()) {
  const errors = result.value
  console.log(errors)
  // [
  //   InvariantViolationError { field: 'Namespace', message: 'must be 2-50 characters' }
  // ]
}
```

**Результат:**
```
❌ Errors: [
  "Namespace must be 2-50 characters"
]
```

---

### Пример 3: Несколько ошибок ❌❌❌ [#code]

```typescript
const result = Namespace.create('A!')

if (result.isLeft()) {
  const errors = result.value
  console.log(errors)
  // [
  //   InvariantViolationError { field: 'Namespace', message: 'must be 2-50 characters' },
  //   InvariantViolationError { field: 'Namespace', message: 'invalid format (only lowercase, numbers, -, _)' }
  // ]
}
```

**Результат:**
```
❌ Errors: [
  "Namespace must be 2-50 characters",
  "Namespace invalid format (only lowercase, numbers, -, _)"
]
```

---

## 🌐 Использование в Presentation Layer

### React Router action [#code|#structure:path]

```typescript
// src/presentation/web/react/src/routes/resources.new.tsx
import { Namespace } from '@/domain'

export function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const namespaceValue = formData.get('namespace') as string

  // Создаем Namespace с накоплением ошибок
  const namespaceResult = Namespace.create(namespaceValue)

  if (namespaceResult.isLeft()) {
    const errors = namespaceResult.value
    
    // Показываем ВСЕ ошибки пользователю
    return json({
      errors: {
        namespace: errors.map(e => e.message)
      }
    })
  }

  // Успех - создаем ресурс
  const namespace = namespaceResult.value
  // ...
}
```

**UI отобразит:**
```
❌ Namespace:
  - must be 2-50 characters
  - invalid format (only lowercase, numbers, -, _)
```

---

## ✅ Преимущества подхода

### 1. Лучший UX

Пользователь видит ВСЕ ошибки сразу, а не по одной.

### 2. Декларативность [#code]

```typescript
// Просто список правил
const specs = [
  new NotEmptySpec('Namespace'),
  new LengthRangeSpec(2, 50, 'Namespace'),
  new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace')
]

// ValidationCombinators делает всю работу
return ValidationCombinators.sequence(
  specs.map(spec => spec.isSatisfiedBy(value)),
  () => new Namespace(value)
)
```

### 3. Функциональный стиль [#code]

```typescript
// ❌ Императивно - "КАК делать"
const errors: E[] = []
for (const validation of validations) {
  if (validation.isLeft()) {
    errors.push(validation.value)
  }
}

// ✅ Декларативно - "ЧТО делать"
return mergeInMany(validations)
```

### 4. Иммутабельность [#code]

```typescript
// ❌ Мутабельные массивы
const errors: E[] = []
errors.push(validation.value)

// ✅ Иммутабельные операции
mergeInMany(validations) // создает новый Either
```

### 5. Композиция [#code]

```typescript
// ✅ Легко композировать
return mergeInMany(validations)
  .map(fn)                    // если успех
  .mapLeft(errors => ...)     // если ошибки
  .chain(...)                 // дальнейшая обработка
```

### 6. Переиспользуемость [#code]

```typescript
// Спецификации можно переиспользовать
const notEmpty = new NotEmptySpec('ResourceName')
const lengthRange = new LengthRangeSpec(2, 100, 'ResourceName')

// В разных Value Objects
class ResourceName {
  static create(value: string) {
    return ValidationCombinators.sequence(
      [notEmpty, lengthRange].map(spec => spec.isSatisfiedBy(value)),
      () => new ResourceName(value)
    )
  }
}
```

---

## 📁 Структура файлов [#structure:tree]

```
src/shared/
└── validation/
    ├── Validation.ts              # type Validation<E, T>, valid(), invalid()
    ├── ValidationCombinators.ts   # accumulate(), sequence()
    └── index.ts                   # Public API
```

---

## 🔗 Связанные документы

- **[SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md)** - Specification Pattern для валидации ⭐
- **[VALIDATION_EVOLUTION.md](./VALIDATION_EVOLUTION.md)** - Эволюция подхода к валидации
- **[INVARIANTS.md](./INVARIANTS.md)** - Инварианты и Shared Kernel
- **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** - Обработка ошибок
- **[../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** - Структура проекта (Shared Layer)

---

**Дата создания:** 2025-01-22  
**Статус:** ✅ Актуально
