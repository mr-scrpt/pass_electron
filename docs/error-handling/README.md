# Error Handling - Обработка ошибок

Этот раздел содержит полную документацию по обработке ошибок, валидации и инвариантам в проекте.

> **⭐ НОВОЕ:** С версии 2.0 используется **полиморфная система ошибок** через интерфейс `IError` — БЕЗ `instanceof`, БЕЗ `switch/case`. См. [POLYMORPHIC_ERROR_SYSTEM.md](./POLYMORPHIC_ERROR_SYSTEM.md)

---

## 📚 Содержание

### 0. **[POLYMORPHIC_ERROR_SYSTEM.md](./POLYMORPHIC_ERROR_SYSTEM.md)** — Полиморфная система ошибок ⭐ NEW

Документ описывает **новую архитектуру** обработки ошибок:
- Интерфейс `IError` — минимальный, только технические методы
- Полиморфизм через методы (`getMessage()`, `getLogLevel()`, `toUserError()`)
- БЕЗ `instanceof`, БЕЗ `switch/case`, БЕЗ тернарников
- Монадный подход с `tapLeft`, `mapLeft`
- Специфичные ошибки для каждого слоя (Domain, Infrastructure, Application)
- Функциональная композиция

**Ключевые преимущества:**
- ✅ Полиморфная обработка через методы интерфейса
- ✅ Каждый слой — свои ошибки, но работают одинаково
- ✅ Type Safety — компилятор проверяет реализацию IError
- ✅ Монадический подход — чистые функции, композиция

**Начни с этого документа**, если внедряешь новый код или рефакторишь существующий.

---

### 1. **[INVARIANTS.md](./INVARIANTS.md)** — Инварианты и валидация

Документ описывает:
- Что такое инварианты в DDD
- Где они живут (Value Objects, Aggregates)
- Паттерн Shared Kernel для переиспользуемых правил валидации
- Примеры: `UuidInvariant` (shared), `NamespaceInvariant` (resource), `ResourceNameInvariant` (resource)
- Интеграция с `InvariantViolationError` (implements `IError`)

**Ключевые концепции:**
- Fail Fast — валидация при создании
- DRY — переиспользуемые инварианты
- Type Safety — компилятор проверяет

**Читай этот документ**, если нужно понять как работает валидация в Domain Layer.

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

### 2. **[ERROR_HANDLING.md](./ERROR_HANDLING.md)** — Иерархия ошибок (Legacy)

> ⚠️ **Устарело:** Документ описывает старую архитектуру с `AppError` и `isOperational`. Для нового кода используй [POLYMORPHIC_ERROR_SYSTEM.md](./POLYMORPHIC_ERROR_SYSTEM.md)

Документ описывает (legacy подход):
- Разделение ошибок по архитектурным слоям
- **Domain Errors**: `BaseError` (теперь implements `IError`)
- **Application Errors**: `GenericApplicationError` (теперь implements `IError`)
- **Infrastructure Errors**: `NetworkError`, `ApiError`, `StorageError` (теперь implements `IError`)
- Преобразование ошибок на границах слоев

**Ключевые принципы (актуальны):**
- Ошибки следуют архитектурным границам
- Domain ошибки — часть Ubiquitous Language
- Infrastructure ошибки трансформируются через `toUserError()`

**Читай для истории**, но используй новый подход из POLYMORPHIC_ERROR_SYSTEM.md

---

### 2.5 **[APPLICATION_ERROR_HANDLING.md](./APPLICATION_ERROR_HANDLING.md)** — Обработка ошибок в Application Layer (Partial Legacy)

> ⚠️ **Частично устарело:** Документ использует `isOperational` вместо `isExpected()`. Концепции актуальны, но API изменился.

Практическое руководство (концепции актуальны):
- **Контекстно-зависимые ошибки** — дубликат в CREATE vs UPDATE
- **Разделение expected vs unexpected** через `error.isExpected()` (вместо `isOperational`)
- **Логирование** через `error.getLogLevel()` и `tapLeft`
- **Трансформация** через `error.toUserError()` (вместо GenericApplicationError)
- Полные примеры Create/Update/Delete handlers
- Интеграция с Presentation Layer

**Ключевые паттерны (обновлены):**
- ✅ `error.isExpected()` — expected vs unexpected (вместо isOperational)
- ✅ `error.getLogLevel()` — полиморфное логирование
- ✅ `tapLeft` для side effects — монадический подход
- ✅ Контекстная трансформация через `toUserError()`

**Читай с учетом новых методов IError** (см. POLYMORPHIC_ERROR_SYSTEM.md)

> 📄 **Reference (Legacy):** 
> - [ERROR_CLASSIFIER_REFERENCE.md](./ERROR_CLASSIFIER_REFERENCE.md) — устарел, используй методы IError
> - [BASE_HANDLERS_REFERENCE.md](./BASE_HANDLERS_REFERENCE.md) — частично актуален

---

### 3. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Эскалация ошибок через Either Pattern ✅

> ✅ **Актуально:** Концепции монадной обработки полностью применимы к новой системе IError

Документ описывает:
- Проблемы традиционного `try-catch` подхода (Try-Catch Hell)
- **@sweet-monads/either** — Either монада (используется!) ⭐
- `mergeInMany` — накопление ВСЕХ ошибок валидации
- `mapLeft` — трансформация ошибок между слоями
- **tapLeft** — side effects (логирование) NEW ⭐
- План миграции

**Ключевые концепции (актуальны):**
- Type-safe обработка ошибок
- Railway-oriented programming
- Ошибки как часть сигнатуры типа `Validation<IError[], T>`
- Накопление всех ошибок (уникально!)
- Функциональная композиция

**Читай этот документ**, чтобы понять монадный подход к обработке ошибок.

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

### 4.5 **[VALIDATION_EVOLUTION.md](./VALIDATION_EVOLUTION.md)** — Эволюция подхода к валидации ⭐

Документ показывает:
- **Полный путь развития** от try-catch к монадам и Specification Pattern
- **Этап 1:** Try-Catch Hell (проблемы instanceof, вложенность)
- **Этап 2:** Either Pattern (монады, mapLeft, type-safe)
- **Этап 3:** Specification Pattern (без if-ов, переиспользуемо)
- **Полные примеры** эскалации через все слои архитектуры
- Сравнительная таблица всех подходов

**Ключевые преимущества:**
- ✅ Показывает **почему** мы перешли на монады
- ✅ Показывает **почему** мы перешли на Specification Pattern
- ✅ Полные примеры кода на каждом этапе
- ✅ Показывает эскалацию через Infrastructure → Domain → Application → Presentation

**Читай этот документ**, чтобы понять полный путь эволюции подхода к валидации и обработке ошибок.

---

## 🎯 Рекомендуемый порядок изучения

### Для начинающих (с нуля):
1. **[POLYMORPHIC_ERROR_SYSTEM.md](./POLYMORPHIC_ERROR_SYSTEM.md)** — новая система ошибок ⭐ **НАЧНИ ЗДЕСЬ**
2. **[INVARIANTS.md](./INVARIANTS.md)** — понять валидацию в DDD
3. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — Either Pattern и монады
4. **[VALIDATION_EVOLUTION.md](./VALIDATION_EVOLUTION.md)** — понять эволюцию подхода
5. **[SPECIFICATION_VALIDATION.md](./SPECIFICATION_VALIDATION.md)** — Specification Pattern

### Для опытных (уже знаком с проектом):
1. **[POLYMORPHIC_ERROR_SYSTEM.md](./POLYMORPHIC_ERROR_SYSTEM.md)** — что изменилось в v2.0 ⭐
2. **[APPLICATION_ERROR_HANDLING.md](./APPLICATION_ERROR_HANDLING.md)** — обновленные паттерны
3. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — tapLeft и новые операторы
4. **[VALIDATION_EVOLUTION.md](./VALIDATION_EVOLUTION.md)** — полный контекст

### Для миграции с v1.0:
1. **[POLYMORPHIC_ERROR_SYSTEM.md](./POLYMORPHIC_ERROR_SYSTEM.md)** — новая архитектура
2. Раздел "Чек-лист создания новой ошибки" в POLYMORPHIC_ERROR_SYSTEM.md
3. **[ERROR_ESCALATION.md](./ERROR_ESCALATION.md)** — новые операторы tapLeft/tapRight

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
  private constructor(private readonly _value: string) {}
  
  static create(value: string): Validation<ValidationError[], ResourceName> {
    return ResourceNameInvariant.instance
      .validate(value, 'ResourceName')
      .map((validValue: string) => new ResourceName(validValue))
  }
  
  getValue(): string {
    return this.value
  }
}
```

> 📖 См. [INVARIANTS.md](./INVARIANTS.md) для деталей

### 3. Ошибки по слоям (v2.0)
```typescript
// ✅ Все реализуют IError
import type { IError } from '@/shared/errors';

// Domain Layer
class InvariantViolationError extends BaseError implements IError {
  isExpected() { return true; }
  getLogLevel() { return 'info'; }
  toUserError() { return this; }
}

// Application Layer  
class GenericApplicationError extends Error implements IError {
  isExpected() { return true; }
  getLogLevel() { return 'warn'; }
  toUserError() { return this; }
}

// Infrastructure Layer
class NetworkError extends Error implements IError {
  isExpected() { return false; }  // ✅ Unexpected!
  getLogLevel() { return 'error'; }
  toUserError() { return new GenericApplicationError('Service unavailable', this); }
}
```

### 4. Either + IError для type-safe обработки (v2.0)
```typescript
import type { IError } from '@/shared/errors';
import type { Validation } from '@/shared/validation';
import { tapLeft } from '@/shared/validation';

// ✅ Все ошибки - IError[]
function findUser(id: string): Validation<IError[], User> {
  // Компилятор заставит обработать IError[]!
}

// ✅ Полиморфная обработка БЕЗ instanceof
return result
  .mapLeft(tapLeft(errors => 
    errors.forEach(error => 
      logger.log(error.getLogLevel(), error.getMessage())  // Полиморфно!
    )
  ))
  .mapLeft(errors => 
    errors.map(error => error.toUserError())  // Полиморфно!
  );
```

---

## 🔗 Связанные документы

- **[../DDD_AND_CLEAN_ARCHITECTURE.md](../DDD_AND_CLEAN_ARCHITECTURE.md)** — Value Objects и Entities
- **[../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)** — Структура Domain Layer
- **[../contracts/domain-types.md](../contracts/domain-types.md)** — Контракты доменных типов
- **[../../steps/step_1/README.md](../../steps/step_1/README.md)** — Реализация Value Objects (Step 1)

---

**💡 Совет v2.0**: Начни с **[POLYMORPHIC_ERROR_SYSTEM.md](./POLYMORPHIC_ERROR_SYSTEM.md)** для понимания новой архитектуры, затем [INVARIANTS.md](./INVARIANTS.md) и [ERROR_ESCALATION.md](./ERROR_ESCALATION.md)!

---

## 📝 История версий

### v2.0 (2025-10-24) - Полиморфная система ошибок
- ✅ Введен интерфейс `IError` 
- ✅ Методы `isExpected()`, `getLogLevel()`, `toUserError()`
- ✅ Полиморфная обработка БЕЗ `instanceof` и `switch/case`
- ✅ Монадные операторы `tapLeft`, `tapRight`, `fromNullable`
- ✅ Все ошибки implements `IError`
- ⚠️ `AppError` и `isOperational` - deprecated

### v1.0 - Классический подход
- `AppError` интерфейс с `isOperational`
- `ErrorClassifier` для классификации
- `BaseError` и иерархия ошибок
