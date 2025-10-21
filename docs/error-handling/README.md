# Error Handling - Обработка ошибок

Этот раздел содержит полную документацию по обработке ошибок, валидации и инвариантам в проекте.

---

## 📚 Содержание

### 1. **[INVARIANTS.md](./INVARIANTS.md)** — Инварианты и валидация

Документ описывает:
- Что такое инварианты в DDD
- Где они живут (Value Objects, Aggregates)
- Паттерн Shared Kernel для переиспользуемых правил валидации
- Примеры: `UuidInvariant`, `StringInvariant`, `EmailInvariant`
- Интеграция с `InvariantViolationError`

**Ключевые концепции:**
- Fail Fast — валидация при создании
- DRY — переиспользуемые инварианты
- Type Safety — компилятор проверяет

**Начни с этого документа**, если нужно понять как работает валидация в Domain Layer.

---

### 1.5 **[SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md)** — Specification Pattern для валидации ⭐

Документ описывает:
- **Specification Pattern** для валидации БЕЗ if-ов
- Библиотека переиспользуемых спецификаций (`NotEmptySpec`, `LengthRangeSpec`, `PatternSpec`)
- Композиция спецификаций (`CompositeSpecification.allOf`)
- Два режима: fail-fast и accumulate (все ошибки)
- Примеры для `Namespace`, `ResourceName`, `ResourceId`
- Кастомные бизнес-спецификации

**Ключевые преимущества:**
- ✅ Декларативно — читается как бизнес-правила
- ✅ Переиспользуемо — спецификации используются везде
- ✅ Тестируемо — каждая спецификация тестируется отдельно
- ✅ БЕЗ if-ов — чистый функциональный стиль

**Читай этот документ**, чтобы понять как избавиться от if-ов в валидации.

> 📖 **Теория:** См. [../patterns/SPECIFICATION_PATTERN.md](../patterns/SPECIFICATION_PATTERN.md) для полного описания паттерна

---

### 2. **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Иерархия ошибок

Документ описывает:
- Разделение ошибок по архитектурным слоям
- **Domain Errors**: `InvariantViolationError`, `NotFoundError`, `DuplicateError`, `InvalidOperationError`
- **Application Errors**: `ValidationError`, `CommandError`, `QueryError`
- **Infrastructure Errors**: `NetworkError`, `ApiError`, `StorageError`
- Преобразование ошибок на границах слоев (Infrastructure → Domain)
- Обработка в Presentation Layer

**Ключевые принципы:**
- Ошибки следуют архитектурным границам
- Domain ошибки — часть Ubiquitous Language
- Infrastructure ошибки преобразуются в Domain на границе

**Читай этот документ**, чтобы понять какие ошибки в каком слое должны быть.

---

### 3. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Эскалация ошибок через Either Pattern

Документ описывает:
- Проблемы традиционного `try-catch` подхода (Try-Catch Hell)
- **@sweet-monads/either** — Either монада (рекомендуется!) ⭐
- `mergeInMany` — накопление ВСЕХ ошибок валидации
- `mapLeft` — трансформация ошибок между слоями
- План миграции

**Ключевые концепции:**
- Type-safe обработка ошибок
- Railway-oriented programming
- Ошибки как часть сигнатуры типа
- Накопление всех ошибок (уникально!)

**Читай этот документ**, чтобы понять как избавиться от `try-catch` и сделать обработку ошибок type-safe.

---

### 4. **[ERROR_ESCALATION_EXTENDED.md](./ERROR_ESCALATION_EXTENDED.md)** — Детальное сравнение библиотек

Расширенный документ с полным сравнением:
- Что такое монады и как они работают
- Result vs Either — в чем разница
- **@sweet-monads/either** (Either монада, Haskell-style) — РЕКОМЕНДУЕТСЯ ⭐
- **neverthrow** (Result монада, Rust-style)
- **fp-ts** (полная экосистема монад)
- Детальная таблица сравнения всех библиотек
- Когда какую библиотеку использовать

**Почему @sweet-monads/either:**
- `mergeInMany` — накопление ВСЕХ ошибок (идеально для форм!)
- `mapLeft` — трансформация ошибок между слоями
- `asyncChain`/`asyncMap` — встроены
- Right/Left терминология (Haskell)

**Читай этот документ**, если нужно глубоко понять различия между библиотеками для принятия решения.

---

## 🔄 Эволюция подхода к валидации

Этот раздел показывает **путь развития** подхода к валидации в проекте — от традиционного `try-catch` к монадам и Specification Pattern.

### Этап 1: Try-Catch Hell (❌ Проблемный подход)

**Проблемы:**
- Вложенные `try-catch` блоки
- `instanceof` на каждом уровне
- Ошибки не видны в типах
- Легко забыть обработку

```typescript
// ❌ ПЛОХО: Try-Catch Hell
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
}

// Использование - нужно помнить про try-catch
try {
  const name = ResourceName.create(userInput)
  // ...
} catch (error) {
  // Проблема 2: error имеет тип unknown
  if (error instanceof Error) {
    console.error(error.message)
  }
}
```

**Почему это плохо:**
1. ❌ Ошибки не видны в типе функции
2. ❌ `error` имеет тип `unknown` в catch
3. ❌ Легко забыть `try-catch`
4. ❌ Много boilerplate кода
5. ❌ Невозможно собрать ВСЕ ошибки валидации

---

### Этап 2: Either Pattern (✅ Монады)

**Решение:** Используем монаду `Either` для type-safe обработки ошибок.

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
      return left(new InvariantViolationError('ResourceName', 'too long'))
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      return left(new InvariantViolationError('ResourceName', 'invalid characters'))
    }
    
    return right(new ResourceName(value))
  }
}

// Использование - компилятор ЗАСТАВИТ обработать ошибку!
const result = ResourceName.create(userInput)

if (result.isLeft()) {
  // TypeScript ЗНАЕТ что здесь InvariantViolationError
  console.error(result.value.message)
} else {
  // TypeScript ЗНАЕТ что здесь ResourceName
  const name = result.value
}
```

**Преимущества Either:**
- ✅ Ошибки видны в типе функции
- ✅ Компилятор заставляет обработать ошибку
- ✅ Type-safe — нет `unknown`
- ✅ Railway-oriented programming
- ✅ Можно собрать все ошибки через `mergeInMany`

**Но остались проблемы:**
- ⚠️ Много `if`-ов в коде
- ⚠️ Валидация не переиспользуется
- ⚠️ Сложно тестировать отдельные правила

> 📖 См. [ERROR_ESCALATION.md](./ERROR_ESCALATION.md) для деталей про Either

---

### Этап 3: Specification Pattern (⭐ Лучший подход)

**Решение:** Инкапсулируем каждое правило в отдельную спецификацию.

```typescript
// ✅ ОТЛИЧНО: Specification Pattern - БЕЗ if-ов!
import { Validation } from '@/shared/validation'
import { CompositeSpecification } from '@/shared/specification'
import { NotEmptySpec, LengthRangeSpec, PatternSpec } from '@/shared/specification'

class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Validation<InvariantViolationError, ResourceName> {
    // Декларативно описываем правила - БЕЗ if-ов! ⭐
    const spec = CompositeSpecification.allOf(
      new NotEmptySpec('ResourceName'),                    // Правило 1
      new LengthRangeSpec(1, 100, 'ResourceName'),         // Правило 2
      new PatternSpec(/^[a-zA-Z0-9-_]+$/, 'invalid', 'ResourceName')  // Правило 3
    )
    
    // Одна строка вместо множества if-ов!
    return spec.isSatisfiedBy(value).map(v => new ResourceName(v))
  }
  
  // Бонус: можем собрать ВСЕ ошибки
  static createWithAllErrors(value: string): Validation<InvariantViolationError[], ResourceName> {
    const spec = CompositeSpecification.allOfAccumulate(
      new NotEmptySpec('ResourceName'),
      new LengthRangeSpec(1, 100, 'ResourceName'),
      new PatternSpec(/^[a-zA-Z0-9-_]+$/, 'invalid', 'ResourceName')
    )
    
    return spec.isSatisfiedBy(value).map(v => new ResourceName(v))
  }
}

// Использование - так же type-safe как Either!
const result = ResourceName.create(userInput)

if (result.isLeft()) {
  console.error(result.value.message)  // Одна ошибка
}

// Или получить ВСЕ ошибки сразу
const allErrorsResult = ResourceName.createWithAllErrors(userInput)

if (allErrorsResult.isLeft()) {
  // Массив ВСЕХ ошибок валидации!
  allErrorsResult.value.forEach(err => console.error(err.message))
}
```

**Преимущества Specification Pattern:**
- ✅ **БЕЗ if-ов** — декларативный стиль
- ✅ **Переиспользуемо** — `NotEmptySpec` используется везде
- ✅ **Тестируемо** — каждая спецификация тестируется отдельно
- ✅ **Композируемо** — легко комбинировать правила
- ✅ **Читаемо** — код читается как бизнес-правила
- ✅ **Два режима** — fail-fast или accumulate (все ошибки)
- ✅ **Type-safe** — как Either

> 📖 См. [SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md) для деталей

---

### Сравнительная таблица

| Критерий | Try-Catch | Either Pattern | Specification Pattern |
|----------|-----------|----------------|----------------------|
| **Ошибки в типах** | ❌ Нет | ✅ Да | ✅ Да |
| **Type-safe** | ❌ `unknown` | ✅ Полностью | ✅ Полностью |
| **Компилятор проверяет** | ❌ Нет | ✅ Да | ✅ Да |
| **Количество if-ов** | ⚠️ Много | ⚠️ Много | ✅ Ноль! |
| **Переиспользование** | ❌ Сложно | ⚠️ Возможно | ✅ Легко |
| **Тестируемость** | ⚠️ Средняя | ⚠️ Средняя | ✅ Отличная |
| **Читаемость** | ❌ Плохая | ⚠️ Средняя | ✅ Отличная |
| **Все ошибки сразу** | ❌ Нет | ✅ Да (`mergeInMany`) | ✅ Да (`allOfAccumulate`) |
| **Декларативность** | ❌ Нет | ⚠️ Частично | ✅ Полностью |

---

### Итоговая рекомендация

**Используйте Specification Pattern для валидации:**

1. **Общие правила** → `src/shared/specification/`
   - `NotEmptySpec`, `LengthRangeSpec`, `PatternSpec`, `UuidV4Spec`

2. **Бизнес-правила** → `src/domain/{context}/specifications/`
   - `NotReservedNamespaceSpec`, `UniqueResourceNameSpec`

3. **Композиция** → `CompositeSpecification.allOf()`
   - Комбинируйте общие и бизнес-специфичные спецификации

4. **Два режима:**
   - `allOf()` — fail-fast (для UI)
   - `allOfAccumulate()` — все ошибки (для API/форм)

**Результат:**
- ✅ Код без if-ов
- ✅ Type-safe обработка ошибок
- ✅ Переиспользуемые правила
- ✅ Легко тестировать
- ✅ Читается как документация

---

## 🎯 Рекомендуемый порядок изучения

### Для начинающих:
1. **INVARIANTS.md** — понять валидацию
2. **SPECIFICATION_VALIDATION.md** — понять как валидировать БЕЗ if-ов ⭐
3. **ERROR_HANDLING.md** — понять иерархию ошибок
4. **ERROR_ESCALATION.md** — понять Either Pattern и @sweet-monads/either

### Для опытных:
1. **SPECIFICATION_VALIDATION.md** — Specification Pattern для валидации ⭐
2. **ERROR_ESCALATION_EXTENDED.md** — детальное сравнение монад
3. **ERROR_HANDLING.md** — архитектурные правила
4. **INVARIANTS.md** — паттерны переиспользования

---

## 💡 Ключевые правила проекта

### 1. Валидация через Specification Pattern (рекомендуется) ⭐
```typescript
// ✅ ОТЛИЧНО: Specification Pattern - БЕЗ if-ов!
class Namespace {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<InvariantViolationError, Namespace> {
    const spec = CompositeSpecification.allOf(
      new NotEmptySpec('Namespace'),
      new LengthRangeSpec(2, 50, 'Namespace'),
      new PatternSpec(/^[a-z0-9-_]+$/, 'invalid format', 'Namespace')
    )
    
    return spec.isSatisfiedBy(value).map(v => new Namespace(v))
  }
  
  getValue(): string {
    return this.value
  }
}
```

> 📖 См. [SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md) для деталей

### 2. Альтернатива: Инварианты (классический подход)
```typescript
// ✅ ХОРОШО: Self-validating Value Object через инварианты
class ResourceName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Either<InvariantViolationError, ResourceName> {
    return StringInvariant.validateLength(value, 1, 100, 'ResourceName')
      .chain(v => 
        StringInvariant.validateAlphanumericWithDashUnderscore(v, 'ResourceName')
      )
      .map(validValue => new ResourceName(validValue))
  }
  
  getValue(): string {
    return this.value
  }
}
```

> 📖 См. [INVARIANTS.md](./INVARIANTS.md) для деталей

### 3. Ошибки по слоям
```typescript
// Domain Layer
class InvariantViolationError extends DomainError { }

// Application Layer  
class ValidationError extends Error { }

// Infrastructure Layer
class NetworkError extends Error { }
```

### 4. Either для type-safe обработки
```typescript
// ✅ ХОРОШО: Either делает ошибки явными
function findUser(id: string): Either<NotFoundError, User> {
  // Компилятор заставит обработать NotFoundError!
  // ⚠️ Порядок: Either<Error, Success>
}
```

---

## 🔗 Связанные документы

- **[../DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** — Value Objects и Entities
- **[../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** — Структура Domain Layer
- **[../contracts/domain-types.md](../contracts/domain-types.md)** — Контракты доменных типов
- **[../../steps/step_1/README.md](../../steps/step_1/README.md)** — Реализация Value Objects (Step 1)

---

**💡 Совет**: Начни с INVARIANTS.md, чтобы понять основы, затем переходи к ERROR_HANDLING.md и ERROR_ESCALATION.md!
